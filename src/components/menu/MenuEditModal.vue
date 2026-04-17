<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import ModalBase from '@/components/common/ModalBase.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import DishCard from '@/components/menu/DishCard.vue'
import RecipePicker from '@/components/menu/RecipePicker.vue'
import type { Dish, Ingredient, MenuEntry, Recipe } from '@/domain/types'
import { getMenu } from '@/db/repositories/menus'
import {
  getRecipe,
  createRecipe,
  updateRecipe,
  listRecipes,
} from '@/db/repositories/recipes'
import { genId } from '@/utils/id'
import { formatJpDate, parseDateKey } from '@/utils/date'

const props = defineProps<{
  date: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved', entry: MenuEntry): void
}>()

const dishes = ref<Dish[]>([])
const pickerOpen = ref(false)
const recipeMap = ref<Record<string, Recipe>>({})

const confirm = ref<null | {
  message: string
  danger?: boolean
  onOk: () => void | Promise<void>
}>(null)

onMounted(async () => {
  const [menu, allRecipes] = await Promise.all([getMenu(props.date), listRecipes()])
  dishes.value = menu ? clone(menu.dishes) : []
  const map: Record<string, Recipe> = {}
  for (const r of allRecipes) map[r.id] = r
  recipeMap.value = map
})

function clone(ds: Dish[]): Dish[] {
  return ds.map((d) => ({
    ...d,
    ingredients: d.ingredients.map((i) => ({ ...i })),
  }))
}

const title = computed(() => `${formatJpDate(parseDateKey(props.date))} の献立`)

function addDirectDish() {
  dishes.value.push({
    id: genId(),
    name: '',
    recipeId: null,
    ingredients: [],
    procedureMemo: '',
  })
}

function openPicker() {
  pickerOpen.value = true
}

function onRecipeSelected(recipe: Recipe) {
  dishes.value.push({
    id: genId(),
    name: recipe.name,
    recipeId: recipe.id,
    ingredients: recipe.ingredients.map((i) => ({ ...i })),
    procedureMemo: recipe.procedureMemo,
  })
  recipeMap.value = { ...recipeMap.value, [recipe.id]: recipe }
  pickerOpen.value = false
}

function updateDish(idx: number, next: Dish) {
  dishes.value[idx] = next
}

function removeDish(idx: number) {
  dishes.value.splice(idx, 1)
}

function moveDish(idx: number, direction: -1 | 1) {
  const target = idx + direction
  if (target < 0 || target >= dishes.value.length) return
  const [item] = dishes.value.splice(idx, 1)
  dishes.value.splice(target, 0, item)
}

function unlinkRecipe(idx: number) {
  dishes.value[idx] = { ...dishes.value[idx], recipeId: null }
}

function askUpdateRecipe(idx: number) {
  const dish = dishes.value[idx]
  if (!dish.recipeId) return
  const recipe = recipeMap.value[dish.recipeId]
  if (!recipe) return
  confirm.value = {
    message: `レシピ「${recipe.name}」をこの料理の内容で更新しますか？`,
    onOk: async () => {
      const next: Recipe = {
        ...recipe,
        name: dish.name,
        ingredients: dish.ingredients.map((i: Ingredient) => ({ ...i })),
        procedureMemo: dish.procedureMemo,
      }
      await updateRecipe(next)
      const refreshed = await getRecipe(recipe.id)
      if (refreshed) {
        recipeMap.value = { ...recipeMap.value, [refreshed.id]: refreshed }
      }
      confirm.value = null
    },
  }
}

function askSaveAsRecipe(idx: number) {
  const dish = dishes.value[idx]
  if (!dish.name.trim()) return
  confirm.value = {
    message: `この料理を新しいレシピ「${dish.name}」として保存しますか？`,
    onOk: async () => {
      const created = await createRecipe({
        name: dish.name,
        ingredients: dish.ingredients.map((i) => ({ ...i })),
        procedureMemo: dish.procedureMemo,
      })
      dishes.value[idx] = { ...dishes.value[idx], recipeId: created.id }
      recipeMap.value = { ...recipeMap.value, [created.id]: created }
      confirm.value = null
    },
  }
}

function linkedRecipe(dish: Dish): Recipe | null {
  if (!dish.recipeId) return null
  return recipeMap.value[dish.recipeId] ?? null
}

async function save() {
  const entry: MenuEntry = {
    date: props.date,
    dishes: clone(dishes.value),
  }
  emit('saved', entry)
}
</script>

<template>
  <ModalBase :title="title" width-class="max-w-3xl" @close="emit('close')">
    <div class="space-y-3">
      <div class="flex items-center gap-2">
        <span class="text-sm text-slate-600">＋料理を追加</span>
        <button
          type="button"
          class="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-100"
          @click="openPicker"
        >
          レシピから選択
        </button>
        <button
          type="button"
          class="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-100"
          @click="addDirectDish"
        >
          直接入力
        </button>
      </div>

      <div v-if="pickerOpen" class="border border-slate-200 rounded p-2 bg-slate-50">
        <RecipePicker
          @select="onRecipeSelected"
          @close="pickerOpen = false"
        />
      </div>

      <div v-if="dishes.length === 0" class="text-sm text-slate-500 py-8 text-center">
        料理が登録されていません。「＋料理を追加」から追加してください。
      </div>

      <div class="space-y-3">
        <DishCard
          v-for="(dish, idx) in dishes"
          :key="dish.id"
          :dish="dish"
          :index="idx"
          :total="dishes.length"
          :linked-recipe="linkedRecipe(dish)"
          @update="updateDish(idx, $event)"
          @remove="removeDish(idx)"
          @move="moveDish(idx, $event)"
          @unlink-recipe="unlinkRecipe(idx)"
          @update-recipe="askUpdateRecipe(idx)"
          @save-as-recipe="askSaveAsRecipe(idx)"
        />
      </div>
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
          class="px-4 py-1.5 rounded bg-emerald-600 text-white text-sm hover:bg-emerald-700"
          @click="save"
        >
          保存
        </button>
      </div>
    </template>

    <ConfirmDialog
      v-if="confirm"
      :message="confirm.message"
      :danger="confirm.danger"
      @ok="confirm.onOk"
      @cancel="confirm = null"
    />
  </ModalBase>
</template>
