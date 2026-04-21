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
      <h2 class="text-lg font-semibold text-slate-700">日用品</h2>
    </div>

    <p class="text-sm text-slate-500 mb-4">
      買い物のたびに毎回チェックする日用品を登録します。登録した品目は買い物リストに常に表示されます。
    </p>

    <form class="flex items-center gap-2 mb-4" @submit.prevent="onAdd">
      <input
        v-model="newName"
        type="text"
        class="px-2 py-1 border border-slate-300 rounded w-60 text-sm"
        placeholder="例: ティッシュ"
      />
      <button
        type="submit"
        class="px-4 py-1.5 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 disabled:opacity-50"
        :disabled="!newName.trim()"
      >
        追加
      </button>
    </form>

    <div v-if="supplies.length === 0" class="text-sm text-slate-500 py-8 text-center">
      日用品がまだ登録されていません。
    </div>

    <ul v-else class="space-y-2">
      <li
        v-for="supply in supplies"
        :key="supply.id"
        class="bg-white border border-slate-200 rounded p-3 flex items-center gap-3"
      >
        <template v-if="editingId === supply.id">
          <input
            v-model="editingName"
            type="text"
            class="flex-1 px-2 py-1 border border-slate-300 rounded text-sm"
            @keyup.enter="saveEdit"
            @keyup.escape="cancelEdit"
          />
          <button
            type="button"
            class="px-3 py-1 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
            :disabled="!editingName.trim()"
            @click="saveEdit"
          >
            保存
          </button>
          <button
            type="button"
            class="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-100"
            @click="cancelEdit"
          >
            キャンセル
          </button>
        </template>
        <template v-else>
          <span class="flex-1 text-slate-800">{{ supply.name }}</span>
          <button
            type="button"
            class="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-100"
            @click="startEdit(supply)"
          >
            編集
          </button>
          <button
            type="button"
            class="px-3 py-1 text-sm border border-rose-300 text-rose-600 rounded hover:bg-rose-50"
            @click="onDelete(supply.id)"
          >
            削除
          </button>
        </template>
      </li>
    </ul>
  </section>
</template>
