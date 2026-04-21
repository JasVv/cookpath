<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import type { Recipe } from '@/domain/types'
import { useRecipes } from '@/composables/useRecipes'
import RecipeEditModal from '@/components/recipe/RecipeEditModal.vue'
import { formatJpDateTime } from '@/utils/date'

const { recipes, query, sort, reload, remove } = useRecipes()

const editing = ref<Recipe | null>(null)
const editorOpen = ref(false)

onMounted(reload)
watch([query, sort], reload)

function openNew() {
  editing.value = null
  editorOpen.value = true
}

function openEdit(recipe: Recipe) {
  editing.value = recipe
  editorOpen.value = true
}

function closeEditor() {
  editorOpen.value = false
  editing.value = null
}

async function onSaved() {
  closeEditor()
  await reload()
}

async function onDelete(recipe: Recipe) {
  await remove(recipe.id)
}

function summarizeIngredients(recipe: Recipe): string {
  const names = recipe.ingredients
    .map((i) => i.name.trim())
    .filter((n) => n.length > 0)
  if (names.length === 0) return '（材料なし）'
  const joined = names.join(', ')
  return joined.length > 80 ? joined.slice(0, 80) + '…' : joined
}
</script>

<template>
  <section>
    <div class="flex items-center justify-between mb-4">
      <h2 class="flex items-center gap-2.5 text-lg font-bold text-text">
        <span class="w-1 h-5 rounded-sm bg-accent"></span>
        レシピ管理
      </h2>
      <button
        type="button"
        class="px-3.5 py-1.5 text-[13px] font-semibold rounded-md bg-primary text-white hover:bg-primary-hover transition-colors"
        @click="openNew"
      >
        ＋新規レシピ
      </button>
    </div>

    <div class="flex items-center gap-3 mb-4">
      <label class="flex items-center gap-2 text-sm">
        <span class="text-text-muted">検索:</span>
        <input
          v-model="query"
          type="text"
          class="px-3 py-1.5 border border-border rounded-md w-60 text-sm bg-surface text-text placeholder:text-text-subtle focus:border-primary focus:ring-2 focus:ring-primary/30"
          placeholder="レシピ名"
        />
      </label>
      <label class="flex items-center gap-2 text-sm">
        <span class="text-text-muted">並び順:</span>
        <select v-model="sort" class="px-3 py-1.5 border border-border rounded-md text-sm bg-surface text-text focus:border-primary focus:ring-2 focus:ring-primary/30">
          <option value="updatedDesc">更新日新順</option>
          <option value="updatedAsc">更新日古順</option>
          <option value="nameAsc">名前昇順</option>
          <option value="nameDesc">名前降順</option>
        </select>
      </label>
    </div>

    <div v-if="recipes.length === 0" class="text-sm text-text-muted py-8 text-center">
      レシピがまだありません。
    </div>

    <ul class="space-y-2">
      <li
        v-for="recipe in recipes"
        :key="recipe.id"
        class="bg-surface border border-border rounded-lg p-3.5 flex items-start justify-between gap-4 shadow-card"
      >
        <div class="flex-1 min-w-0">
          <div class="flex items-baseline gap-3">
            <h3 class="font-semibold text-text truncate">{{ recipe.name }}</h3>
            <span class="text-xs text-text-muted whitespace-nowrap tabular">
              更新: {{ formatJpDateTime(recipe.updatedAt) }}
            </span>
          </div>
          <p class="text-sm text-text-muted mt-1 truncate">
            材料: {{ summarizeIngredients(recipe) }}
          </p>
        </div>
        <div class="flex gap-1 shrink-0">
          <button
            type="button"
            class="px-3 py-1 text-xs font-semibold border border-border rounded-md bg-surface text-text hover:bg-bg-subtle transition-colors"
            @click="openEdit(recipe)"
          >
            編集
          </button>
          <button
            type="button"
            class="px-3 py-1 text-xs font-semibold border border-danger/40 text-danger rounded-md bg-surface hover:bg-danger-soft transition-colors"
            @click="onDelete(recipe)"
          >
            削除
          </button>
        </div>
      </li>
    </ul>

    <RecipeEditModal
      v-if="editorOpen"
      :recipe="editing"
      @close="closeEditor"
      @saved="onSaved"
    />
  </section>
</template>
