import { ref } from 'vue'
import type { Recipe } from '@/domain/types'
import {
  searchRecipes,
  deleteRecipe,
  type RecipeSortKey,
} from '@/db/repositories/recipes'

export function useRecipes() {
  const recipes = ref<Recipe[]>([])
  const query = ref('')
  const sort = ref<RecipeSortKey>('updatedDesc')

  async function reload() {
    recipes.value = await searchRecipes(query.value, sort.value)
  }

  async function remove(id: string) {
    await deleteRecipe(id)
    await reload()
  }

  return { recipes, query, sort, reload, remove }
}
