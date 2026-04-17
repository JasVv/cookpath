import { db } from '@/db/schema'
import type { MenuEntry, Dish, Ingredient } from '@/domain/types'

export async function getMenu(date: string): Promise<MenuEntry | undefined> {
  return db.menus.get(date)
}

export async function listMenusInRange(
  fromDate: string,
  toDate: string,
): Promise<MenuEntry[]> {
  return db.menus.where('date').between(fromDate, toDate, true, true).toArray()
}

export async function saveMenu(entry: MenuEntry): Promise<void> {
  if (entry.dishes.length === 0) {
    await db.menus.delete(entry.date)
  } else {
    await db.menus.put(entry)
  }
}

export async function deleteMenu(date: string): Promise<void> {
  await db.menus.delete(date)
}

export async function copyMenu(fromDate: string, toDate: string): Promise<void> {
  if (fromDate === toDate) return
  const src = await getMenu(fromDate)
  if (!src) {
    await db.menus.delete(toDate)
    return
  }
  await db.menus.put({ date: toDate, dishes: cloneDishes(src.dishes) })
}

export async function swapMenu(dateA: string, dateB: string): Promise<void> {
  if (dateA === dateB) return
  await db.transaction('rw', db.menus, async () => {
    const a = await db.menus.get(dateA)
    const b = await db.menus.get(dateB)
    await db.menus.delete(dateA)
    await db.menus.delete(dateB)
    if (b) await db.menus.put({ date: dateA, dishes: b.dishes })
    if (a) await db.menus.put({ date: dateB, dishes: a.dishes })
  })
}

export function cloneDishes(dishes: Dish[]): Dish[] {
  return dishes.map((d) => ({
    ...d,
    ingredients: d.ingredients.map((i: Ingredient) => ({ ...i })),
  }))
}
