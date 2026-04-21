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
  <div class="border border-border rounded-lg bg-surface shadow-card w-80">
    <div class="p-2 border-b border-border flex items-center gap-2">
      <input
        v-model="query"
        type="text"
        class="flex-1 px-2.5 py-1.5 border border-border rounded-md text-sm bg-surface text-text placeholder:text-text-subtle focus:border-primary focus:ring-2 focus:ring-primary/30"
        placeholder="レシピ名で検索"
        autofocus
      />
      <button
        type="button"
        class="px-2 py-1 text-text-muted hover:text-text hover:bg-bg-subtle rounded-md text-sm transition-colors"
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
        class="px-3 py-2 text-sm hover:bg-bg-subtle cursor-pointer border-b border-border last:border-b-0 transition-colors"
        @click="emit('select', r)"
      >
        <div class="font-semibold text-text">{{ r.name }}</div>
        <div
          v-if="r.ingredients.length > 0"
          class="text-xs text-text-muted truncate"
        >
          {{ r.ingredients.map((i) => i.name).filter(Boolean).join(', ') }}
        </div>
      </li>
      <li
        v-if="results.length === 0"
        class="px-3 py-6 text-sm text-text-subtle text-center"
      >
        一致するレシピがありません
      </li>
    </ul>
  </div>
</template>
