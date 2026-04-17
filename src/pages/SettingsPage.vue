<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { runExport, runImportFromFile } from '@/composables/useBackup'
import {
  estimateUsage,
  isPersisted,
  requestPersistence,
} from '@/composables/usePersistentStorage'
import { getLastExportedAt, isExportStale } from '@/db/repositories/meta'
import { formatJpDateTime } from '@/utils/date'

const lastExportedAt = ref<Date | null>(null)
const persisted = ref(false)
const usage = ref<{ usage: number; quota: number } | null>(null)
const errorMessage = ref<string | null>(null)
const importFileInput = ref<HTMLInputElement | null>(null)

type ConfirmState = null | { kind: 'import'; file: File }
const confirm = ref<ConfirmState>(null)

onMounted(async () => {
  await refresh()
})

async function refresh() {
  lastExportedAt.value = await getLastExportedAt()
  persisted.value = await isPersisted()
  usage.value = await estimateUsage()
}

const isStale = computed(() => isExportStale(lastExportedAt.value))
const lastExportedLabel = computed(() =>
  lastExportedAt.value ? formatJpDateTime(lastExportedAt.value) : '未エクスポート',
)
const usageMB = computed(() =>
  usage.value ? (usage.value.usage / (1024 * 1024)).toFixed(2) : null,
)
const quotaMB = computed(() =>
  usage.value && usage.value.quota > 0
    ? (usage.value.quota / (1024 * 1024)).toFixed(0)
    : null,
)

async function onExport() {
  errorMessage.value = null
  try {
    await runExport()
    await refresh()
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : String(e)
  }
}

function onImportClick() {
  errorMessage.value = null
  importFileInput.value?.click()
}

function onImportFileSelected(ev: Event) {
  const target = ev.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) confirm.value = { kind: 'import', file }
  target.value = ''
}

async function performImport() {
  if (!confirm.value || confirm.value.kind !== 'import') return
  const file = confirm.value.file
  confirm.value = null
  try {
    await runImportFromFile(file)
    await refresh()
  } catch (e) {
    errorMessage.value =
      e instanceof Error ? e.message : 'インポートに失敗しました。'
  }
}

async function onRequestPersist() {
  await requestPersistence()
  await refresh()
}
</script>

<template>
  <section>
    <h2 class="text-lg font-semibold text-slate-700 mb-4">設定</h2>

    <div class="space-y-6 max-w-2xl">
      <div class="bg-white border border-slate-200 rounded p-4 space-y-3">
        <h3 class="font-semibold text-slate-800 text-sm">データ管理</h3>
        <div class="flex gap-2">
          <button
            type="button"
            class="px-4 py-1.5 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700"
            @click="onExport"
          >
            JSONエクスポート
          </button>
          <button
            type="button"
            class="px-4 py-1.5 border border-slate-300 text-sm rounded hover:bg-slate-100"
            @click="onImportClick"
          >
            JSONインポート
          </button>
          <input
            ref="importFileInput"
            type="file"
            accept=".json,application/json"
            class="hidden"
            @change="onImportFileSelected"
          />
        </div>
        <div class="text-sm text-slate-600">
          最終エクスポート: {{ lastExportedLabel }}
        </div>
        <div
          v-if="isStale"
          class="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded px-3 py-2"
        >
          ⚠ 30日以上エクスポートされていません。バックアップを作成することを推奨します。
        </div>
        <div v-if="errorMessage" class="text-sm text-rose-600">{{ errorMessage }}</div>
      </div>

      <div class="bg-white border border-slate-200 rounded p-4 space-y-3">
        <h3 class="font-semibold text-slate-800 text-sm">ストレージ</h3>
        <div class="text-sm text-slate-600">
          永続化ストレージ:
          <span v-if="persisted" class="text-emerald-700 font-medium">許可済み ✓</span>
          <span v-else class="text-slate-500">未許可</span>
        </div>
        <div>
          <button
            type="button"
            class="px-3 py-1 border border-slate-300 text-sm rounded hover:bg-slate-100 disabled:opacity-50"
            :disabled="persisted"
            @click="onRequestPersist"
          >
            永続化を要求
          </button>
        </div>
        <div v-if="usage" class="text-sm text-slate-600">
          使用容量: {{ usageMB }} MB
          <span v-if="quotaMB">/ 推定上限 約{{ quotaMB }} MB</span>
        </div>
      </div>
    </div>

    <ConfirmDialog
      v-if="confirm?.kind === 'import'"
      title="インポートの確認"
      message="現在のデータはすべて削除され、インポートしたデータで置き換えられます。続行しますか？"
      ok-label="インポート"
      danger
      @ok="performImport"
      @cancel="confirm = null"
    />
  </section>
</template>
