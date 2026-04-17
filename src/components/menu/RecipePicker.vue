<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import type { Recipe } from '@/domain/types'
import { searchRecipes } from '@/db/repositories/recipes'

const query = ref('')
const results = ref<Recipe[]>([])

const emit = defineEmits<{
  (e: 'select', recipe: Recipe): void
  (e: 'close'): void
}>()

async function reload() {
  results.value = await searchRecipes(query.value)
}

onMounted(reload)
watch(query, reload)
</script>

<template>
  <div class="border border-slate-300 rounded-md bg-white shadow-sm w-80">
    <div class="p-2 border-b border-slate-200 flex items-center gap-2">
      <input
        v-model="query"
        type="text"
        class="flex-1 px-2 py-1 border border-slate-300 rounded text-sm"
        placeholder="レシピ名で検索"
        autofocus
      />
      <button
        type="button"
        class="text-slate-400 hover:text-slate-700 text-sm"
        @click="emit('close')"
        aria-label="閉じる"
      >
        ×
      </button>
    </div>
    <ul class="max-h-64 overflow-y-auto">
      <li
        v-for="r in results"
        :key="r.id"
        class="px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
        @click="emit('select', r)"
      >
        <div class="font-medium text-slate-800">{{ r.name }}</div>
        <div
          v-if="r.ingredients.length > 0"
          class="text-xs text-slate-500 truncate"
        >
          {{ r.ingredients.map((i) => i.name).filter(Boolean).join(', ') }}
        </div>
      </li>
      <li
        v-if="results.length === 0"
        class="px-3 py-6 text-sm text-slate-400 text-center"
      >
        一致するレシピがありません
      </li>
    </ul>
  </div>
</template>
