<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import type { Recipe } from '@/domain/types'
import { searchRecipes } from '@/db/repositories/recipes'

const emit = defineEmits<{
  (e: 'dragstart', recipeId: string): void
  (e: 'dragend'): void
}>()

const query = ref('')
const recipes = ref<Recipe[]>([])

async function reload() {
  recipes.value = await searchRecipes(query.value, 'nameAsc')
}

onMounted(reload)
watch(query, reload)

// 外部からレシピが追加/削除/更新された場合に備え、一覧を再取得する公開 API
defineExpose({ reload })

function onDragStart(ev: DragEvent, recipe: Recipe) {
  ev.dataTransfer?.setData('text/plain', `recipe:${recipe.id}`)
  if (ev.dataTransfer) ev.dataTransfer.effectAllowed = 'copy'
  emit('dragstart', recipe.id)
}

function onDragEnd() {
  emit('dragend')
}

function ingredientSummary(recipe: Recipe): string {
  const names = recipe.ingredients
    .map((i) => i.name.trim())
    .filter((n) => n.length > 0)
  if (names.length === 0) return '(材料なし)'
  return names.join(', ')
}
</script>

<template>
  <aside class="w-72 shrink-0">
    <div class="sticky top-6 flex flex-col gap-3 max-h-[calc(100vh-6rem)]">
      <h3 class="flex items-center gap-2.5 text-sm font-bold text-text">
        <span class="w-1 h-4 rounded-sm bg-accent"></span>
        レシピ一覧
      </h3>
      <input
        v-model="query"
        type="text"
        class="w-full px-3 py-1.5 border border-border rounded-md text-sm bg-surface text-text placeholder:text-text-subtle focus:border-primary focus:ring-2 focus:ring-primary/30"
        placeholder="レシピ名で検索"
      />
      <p class="text-xs text-text-muted">
        カレンダーの日付にドラッグ＆ドロップすると、その日の献立の最後にレシピが追加されます。
      </p>
      <ul
        v-if="recipes.length > 0"
        class="space-y-2 overflow-y-auto pr-1 flex-1 min-h-0"
      >
        <li
          v-for="r in recipes"
          :key="r.id"
          class="bg-surface border border-border rounded-lg p-2.5 cursor-grab active:cursor-grabbing shadow-card hover:border-border-strong transition-colors"
          draggable="true"
          @dragstart="onDragStart($event, r)"
          @dragend="onDragEnd"
        >
          <div class="font-semibold text-text text-sm truncate">{{ r.name }}</div>
          <div class="text-xs text-text-muted mt-0.5 line-clamp-2 break-words">
            {{ ingredientSummary(r) }}
          </div>
        </li>
      </ul>
      <div v-else class="text-xs text-text-muted text-center py-6 border border-dashed border-border rounded-lg">
        一致するレシピがありません
      </div>
    </div>
  </aside>
</template>
