<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import ModalBase from '@/components/common/ModalBase.vue'
import IngredientRow from '@/components/recipe/IngredientRow.vue'
import type { Recipe, Ingredient } from '@/domain/types'
import { createRecipe, updateRecipe } from '@/db/repositories/recipes'

const props = defineProps<{
  recipe: Recipe | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
}>()

const isEdit = computed(() => props.recipe !== null)
const name = ref('')
const procedureMemo = ref('')
const ingredients = ref<Ingredient[]>([])

watch(
  () => props.recipe,
  (r) => {
    if (r) {
      name.value = r.name
      procedureMemo.value = r.procedureMemo
      ingredients.value = r.ingredients.map((i) => ({ ...i }))
    } else {
      name.value = ''
      procedureMemo.value = ''
      ingredients.value = []
    }
  },
  { immediate: true },
)

function addIngredient() {
  ingredients.value.push({ name: '', amount: '', unit: '' })
}

function removeIngredient(idx: number) {
  ingredients.value.splice(idx, 1)
}

function updateIngredient(idx: number, value: Ingredient) {
  ingredients.value[idx] = value
}

const canSave = computed(() => name.value.trim().length > 0)

async function save() {
  if (!canSave.value) return
  const payload = {
    name: name.value.trim(),
    procedureMemo: procedureMemo.value,
    ingredients: ingredients.value.map((i) => ({ ...i })),
  }
  if (props.recipe) {
    await updateRecipe({
      ...props.recipe,
      ...payload,
    })
  } else {
    await createRecipe(payload)
  }
  emit('saved')
}
</script>

<template>
  <ModalBase
    :title="isEdit ? 'レシピ編集' : '新規レシピ'"
    width-class="max-w-2xl"
    @close="emit('close')"
  >
    <div class="space-y-4">
      <label class="block text-sm">
        <span class="text-slate-600">名前</span>
        <input
          v-model="name"
          type="text"
          class="mt-1 w-full px-3 py-1.5 border border-slate-300 rounded"
          placeholder="例: 焼き鮭(基本)"
        />
      </label>

      <div>
        <span class="text-sm text-slate-600">材料</span>
        <div class="mt-1 space-y-2">
          <IngredientRow
            v-for="(ing, idx) in ingredients"
            :key="idx"
            :model-value="ing"
            @update:model-value="updateIngredient(idx, $event)"
            @remove="removeIngredient(idx)"
          />
          <button
            type="button"
            class="text-sm text-emerald-700 hover:underline"
            @click="addIngredient"
          >
            ＋材料を追加
          </button>
        </div>
      </div>

      <label class="block text-sm">
        <span class="text-slate-600">手順メモ</span>
        <textarea
          v-model="procedureMemo"
          rows="4"
          class="mt-1 w-full px-3 py-1.5 border border-slate-300 rounded text-sm"
          placeholder="簡潔な手順メモ"
        />
      </label>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <button
          type="button"
          class="px-4 py-1.5 rounded border border-slate-300 bg-white text-slate-700 text-sm hover:bg-slate-100"
          @click="emit('close')"
        >
          キャンセル
        </button>
        <button
          type="button"
          class="px-4 py-1.5 rounded bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:bg-slate-300"
          :disabled="!canSave"
          @click="save"
        >
          保存
        </button>
      </div>
    </template>
  </ModalBase>
</template>
