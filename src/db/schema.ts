import Dexie, { type Table } from 'dexie'
import type { Recipe, MenuEntry, AppMeta } from '@/domain/types'

export class CookpathDB extends Dexie {
  recipes!: Table<Recipe, string>
  menus!: Table<MenuEntry, string>
  meta!: Table<AppMeta, string>

  constructor() {
    super('cookpath')
    this.version(1).stores({
      recipes: 'id, name, updatedAt',
      menus: 'date',
      meta: 'id',
    })
  }
}

export const db = new CookpathDB()
