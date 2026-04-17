import { db } from '@/db/schema'
import type { Recipe } from '@/domain/types'
import { genId } from '@/utils/id'

export type RecipeSortKey = 'updatedDesc' | 'updatedAsc' | 'nameAsc' | 'nameDesc'

export async function listRecipes(sort: RecipeSortKey = 'updatedDesc'): Promise<Recipe[]> {
  const all = await db.recipes.toArray()
  return sortRecipes(all, sort)
}

export async function searchRecipes(
  query: string,
  sort: RecipeSortKey = 'updatedDesc',
): Promise<Recipe[]> {
  const all = await listRecipes(sort)
  const q = query.trim().toLowerCase()
  if (!q) return all
  return all.filter((r) => r.name.toLowerCase().includes(q))
}

export async function getRecipe(id: string): Promise<Recipe | undefined> {
  return db.recipes.get(id)
}

export async function createRecipe(
  input: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Recipe> {
  const now = new Date()
  const recipe: Recipe = {
    id: genId(),
    createdAt: now,
    updatedAt: now,
    ...input,
  }
  await db.recipes.put(recipe)
  return recipe
}

export async function updateRecipe(recipe: Recipe): Promise<void> {
  await db.recipes.put({ ...recipe, updatedAt: new Date() })
}

export async function deleteRecipe(id: string): Promise<void> {
  await db.transaction('rw', db.menus, db.recipes, async () => {
    const menus = await db.menus.toArray()
    for (const m of menus) {
      let changed = false
      for (const d of m.dishes) {
        if (d.recipeId === id) {
          d.recipeId = null
          changed = true
        }
      }
      if (changed) await db.menus.put(m)
    }
    await db.recipes.delete(id)
  })
}

function sortRecipes(list: Recipe[], sort: RecipeSortKey): Recipe[] {
  const sorted = [...list]
  sorted.sort((a, b) => {
    switch (sort) {
      case 'updatedDesc':
        return b.updatedAt.getTime() - a.updatedAt.getTime()
      case 'updatedAsc':
        return a.updatedAt.getTime() - b.updatedAt.getTime()
      case 'nameAsc':
        return a.name.localeCompare(b.name, 'ja')
      case 'nameDesc':
        return b.name.localeCompare(a.name, 'ja')
    }
  })
  return sorted
}
