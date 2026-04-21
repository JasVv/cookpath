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
    <h2 class="flex items-center gap-2.5 text-lg font-bold text-text mb-4">
      <span class="w-1 h-5 rounded-sm bg-accent"></span>
      設定
    </h2>

    <div
      v-if="isStale"
      class="max-w-2xl mb-4 flex items-center gap-2 px-3 py-2 rounded-md bg-primary-soft border border-primary/30 text-primary-hover text-xs"
    >
      <span>⚠</span>
      <span>30日以上エクスポートされていません。バックアップを作成することを推奨します。</span>
    </div>

    <div class="space-y-6 max-w-2xl">
      <section class="bg-surface rounded-xl border border-border p-4 shadow-card space-y-3">
        <h3 class="flex items-center gap-2.5">
          <span class="w-1 h-4 rounded-sm bg-accent"></span>
          <span class="text-sm font-bold text-text">データ管理</span>
        </h3>
        <div class="flex gap-2">
          <button
            type="button"
            class="px-3.5 py-1.5 text-[13px] font-semibold rounded-md bg-primary text-white hover:bg-primary-hover transition-colors"
            @click="onExport"
          >
            JSONエクスポート
          </button>
          <button
            type="button"
            class="px-3.5 py-1.5 text-[13px] font-semibold rounded-md border border-border bg-surface text-text hover:bg-bg-subtle transition-colors"
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
        <div class="text-sm text-text-muted tabular">
          最終エクスポート: {{ lastExportedLabel }}
        </div>
        <div v-if="errorMessage" class="text-sm text-danger bg-danger-soft border border-danger/30 rounded-md px-3 py-2">{{ errorMessage }}</div>
      </section>

      <section class="bg-surface rounded-xl border border-border p-4 shadow-card space-y-3">
        <h3 class="flex items-center gap-2.5">
          <span class="w-1 h-4 rounded-sm bg-accent"></span>
          <span class="text-sm font-bold text-text">ストレージ</span>
        </h3>
        <div class="text-sm text-text-muted">
          永続化ストレージ:
          <span v-if="persisted" class="text-accent font-semibold">許可済み ✓</span>
          <span v-else class="text-text-subtle">未許可</span>
        </div>
        <div>
          <button
            type="button"
            class="px-3 py-1 text-xs font-semibold border border-border rounded-md bg-surface text-text hover:bg-bg-subtle disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            :disabled="persisted"
            @click="onRequestPersist"
          >
            永続化を要求
          </button>
        </div>
        <div v-if="usage" class="text-sm text-text-muted tabular">
          使用容量: {{ usageMB }} MB
          <span v-if="quotaMB">/ 推定上限 約{{ quotaMB }} MB</span>
        </div>
      </section>
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
