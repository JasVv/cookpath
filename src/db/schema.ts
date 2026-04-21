import Dexie, { type Table } from 'dexie'
import type { Recipe, MenuEntry, AppMeta, Supply } from '@/domain/types'

export class CookpathDB extends Dexie {
  recipes!: Table<Recipe, string>
  menus!: Table<MenuEntry, string>
  meta!: Table<AppMeta, string>
  supplies!: Table<Supply, string>

  constructor() {
    super('cookpath')
    this.version(1).stores({
      recipes: 'id, name, updatedAt',
      menus: 'date',
      meta: 'id',
    })
    // v2: 日用品テーブルを追加
    this.version(2).stores({
      recipes: 'id, name, updatedAt',
      menus: 'date',
      meta: 'id',
      supplies: 'id, name, createdAt',
    })
  }
}

export const db = new CookpathDB()
