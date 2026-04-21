<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Supply } from '@/domain/types'
import { useSupplies } from '@/composables/useSupplies'

const { supplies, reload, add, rename, remove } = useSupplies()

const newName = ref('')

// 編集中の id と入力中の名前を保持。null なら編集モードではない
const editingId = ref<string | null>(null)
const editingName = ref('')

onMounted(reload)

async function onAdd() {
  const name = newName.value.trim()
  if (!name) return
  await add(name)
  newName.value = ''
}

function startEdit(supply: Supply) {
  editingId.value = supply.id
  editingName.value = supply.name
}

function cancelEdit() {
  editingId.value = null
  editingName.value = ''
}

async function saveEdit() {
  if (!editingId.value) return
  const name = editingName.value.trim()
  if (!name) {
    cancelEdit()
    return
  }
  await rename(editingId.value, name)
  cancelEdit()
}

async function onDelete(id: string) {
  await remove(id)
  if (editingId.value === id) cancelEdit()
}
</script>

<template>
  <section>
    <div class="flex items-center justify-between mb-4">
      <h2 class="flex items-center gap-2.5 text-lg font-bold text-text">
        <span class="w-1 h-5 rounded-sm bg-accent"></span>
        日用品
      </h2>
    </div>

    <p class="text-sm text-text-muted mb-4">
      買い物のたびに毎回チェックする日用品を登録します。登録した品目は買い物リストに常に表示されます。
    </p>

    <form class="flex items-center gap-2 mb-4" @submit.prevent="onAdd">
      <input
        v-model="newName"
        type="text"
        class="px-3 py-1.5 border border-border rounded-md w-60 text-sm bg-surface text-text placeholder:text-text-subtle focus:border-primary focus:ring-2 focus:ring-primary/30"
        placeholder="例: ティッシュ"
      />
      <button
        type="submit"
        class="px-3.5 py-1.5 text-[13px] font-semibold rounded-md bg-accent text-white hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        :disabled="!newName.trim()"
      >
        追加
      </button>
    </form>

    <div v-if="supplies.length === 0" class="text-sm text-text-muted py-8 text-center">
      日用品がまだ登録されていません。
    </div>

    <ul v-else class="space-y-2">
      <li
        v-for="supply in supplies"
        :key="supply.id"
        class="bg-surface border border-border rounded-lg p-3 flex items-center gap-3 shadow-card"
      >
        <template v-if="editingId === supply.id">
          <input
            v-model="editingName"
            type="text"
            class="flex-1 px-3 py-1.5 border border-border rounded-md text-sm bg-surface text-text focus:border-primary focus:ring-2 focus:ring-primary/30"
            @keyup.enter="saveEdit"
            @keyup.escape="cancelEdit"
          />
          <button
            type="button"
            class="px-3 py-1 text-xs font-semibold rounded-md bg-primary text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            :disabled="!editingName.trim()"
            @click="saveEdit"
          >
            保存
          </button>
          <button
            type="button"
            class="px-3 py-1 text-xs font-semibold border border-border rounded-md bg-surface text-text hover:bg-bg-subtle transition-colors"
            @click="cancelEdit"
          >
            キャンセル
          </button>
        </template>
        <template v-else>
          <span class="flex-1 text-text">{{ supply.name }}</span>
          <button
            type="button"
            class="px-3 py-1 text-xs font-semibold border border-border rounded-md bg-surface text-text hover:bg-bg-subtle transition-colors"
            @click="startEdit(supply)"
          >
            編集
          </button>
          <button
            type="button"
            class="px-3 py-1 text-xs font-semibold border border-danger/40 text-danger rounded-md bg-surface hover:bg-danger-soft transition-colors"
            @click="onDelete(supply.id)"
          >
            削除
          </button>
        </template>
      </li>
    </ul>
  </section>
</template>
