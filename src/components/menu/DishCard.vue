<script setup lang="ts">
import { computed } from 'vue'
import type { Dish, Ingredient, Recipe } from '@/domain/types'
import IngredientRow from '@/components/recipe/IngredientRow.vue'

const props = defineProps<{
  dish: Dish
  index: number
  total: number
  linkedRecipe: Recipe | null
}>()

const emit = defineEmits<{
  (e: 'update', dish: Dish): void
  (e: 'remove'): void
  (e: 'move', direction: -1 | 1): void
  (e: 'unlinkRecipe'): void
  (e: 'updateRecipe'): void
  (e: 'saveAsRecipe'): void
}>()

function update<K extends keyof Dish>(field: K, value: Dish[K]) {
  emit('update', { ...props.dish, [field]: value })
}

function updateIngredient(idx: number, value: Ingredient) {
  const next = props.dish.ingredients.map((ing, i) => (i === idx ? value : ing))
  update('ingredients', next)
}

function addIngredient() {
  update('ingredients', [...props.dish.ingredients, { name: '', amount: '', unit: '' }])
}

function removeIngredient(idx: number) {
  update(
    'ingredients',
    props.dish.ingredients.filter((_, i) => i !== idx),
  )
}

const isDirectInput = computed(() => props.dish.recipeId === null)

const hasRecipeDiff = computed(() => {
  if (!props.linkedRecipe) return false
  const r = props.linkedRecipe
  const d = props.dish
  if (d.name !== r.name) return true
  if (d.procedureMemo !== r.procedureMemo) return true
  if (d.ingredients.length !== r.ingredients.length) return true
  for (let i = 0; i < d.ingredients.length; i++) {
    const a = d.ingredients[i]
    const b = r.ingredients[i]
    if (a.name !== b.name || a.amount !== b.amount || a.unit !== b.unit) return true
  }
  return false
})

const canSaveAsRecipe = computed(
  () => isDirectInput.value && props.dish.name.trim().length > 0,
)
</script>

<template>
  <div class="border border-border rounded-lg bg-surface shadow-card overflow-hidden">
    <div class="flex items-center justify-between px-3 py-2 border-b border-border bg-bg-subtle">
      <span class="text-xs text-text-muted font-semibold">料理 {{ index + 1 }}</span>
      <div class="flex items-center gap-1">
        <button
          type="button"
          class="px-2 py-0.5 text-xs border border-border rounded-md bg-surface text-text hover:bg-bg-subtle disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          :disabled="index === 0"
          @click="emit('move', -1)"
          aria-label="上へ"
        >
          ↑
        </button>
        <button
          type="button"
          class="px-2 py-0.5 text-xs border border-border rounded-md bg-surface text-text hover:bg-bg-subtle disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          :disabled="index === total - 1"
          @click="emit('move', 1)"
          aria-label="下へ"
        >
          ↓
        </button>
        <button
          type="button"
          class="px-2 py-0.5 text-xs border border-danger/40 text-danger rounded-md bg-surface hover:bg-danger-soft ml-1 transition-colors"
          @click="emit('remove')"
          aria-label="削除"
        >
          🗑
        </button>
      </div>
    </div>

    <div class="p-3 space-y-3">
      <label class="block text-sm">
        <span class="text-text-muted font-medium">料理名</span>
        <input
          type="text"
          class="mt-1 w-full px-3 py-2 border border-border rounded-md text-sm bg-surface text-text placeholder:text-text-subtle focus:border-primary focus:ring-2 focus:ring-primary/30"
          placeholder="例: 焼き鮭"
          :value="dish.name"
          @input="update('name', ($event.target as HTMLInputElement).value)"
        />
      </label>

      <div class="flex items-center gap-2 text-xs">
        <template v-if="isDirectInput">
          <span class="text-text-subtle">(直接入力)</span>
        </template>
        <template v-else>
          <span class="text-text-muted">
            レシピ参照:
            <span class="text-text font-semibold">{{ linkedRecipe?.name ?? '(削除済み)' }}</span>
          </span>
          <button
            type="button"
            class="text-text-muted hover:text-text underline"
            @click="emit('unlinkRecipe')"
          >
            解除
          </button>
        </template>
      </div>

      <div>
        <span class="text-sm text-text-muted font-medium">材料</span>
        <div class="mt-1 space-y-2">
          <IngredientRow
            v-for="(ing, idx) in dish.ingredients"
            :key="idx"
            :model-value="ing"
            @update:model-value="updateIngredient(idx, $event)"
            @remove="removeIngredient(idx)"
          />
          <button
            type="button"
            class="text-sm text-accent font-semibold hover:text-accent-hover hover:underline"
            @click="addIngredient"
          >
            ＋材料を追加
          </button>
        </div>
      </div>

      <label class="block text-sm">
        <span class="text-text-muted font-medium">メモ</span>
        <textarea
          rows="2"
          class="mt-1 w-full px-3 py-2 border border-border rounded-md text-sm bg-surface text-text placeholder:text-text-subtle focus:border-primary focus:ring-2 focus:ring-primary/30"
          placeholder="簡潔な手順メモ"
          :value="dish.procedureMemo"
          @input="update('procedureMemo', ($event.target as HTMLTextAreaElement).value)"
        />
      </label>

      <div class="flex gap-2">
        <button
          v-if="!isDirectInput && hasRecipeDiff"
          type="button"
          class="px-3 py-1 text-xs font-semibold border border-primary/30 text-primary-hover bg-primary-soft rounded-md hover:bg-primary-soft/70 transition-colors"
          @click="emit('updateRecipe')"
        >
          レシピを更新
        </button>
        <button
          v-if="canSaveAsRecipe"
          type="button"
          class="px-3 py-1 text-xs font-semibold border border-accent/30 text-accent bg-accent-soft rounded-md hover:bg-accent-soft/70 transition-colors"
          @click="emit('saveAsRecipe')"
        >
          新規レシピとして保存
        </button>
      </div>
    </div>
  </div>
</template>
