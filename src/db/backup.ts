import { db } from '@/db/schema'
import type { Recipe, MenuEntry } from '@/domain/types'

export interface BackupFile {
  formatVersion: 1
  exportedAt: string
  recipes: Recipe[]
  menus: MenuEntry[]
}

export async function exportAll(): Promise<BackupFile> {
  const [recipes, menus] = await Promise.all([
    db.recipes.toArray(),
    db.menus.toArray(),
  ])
  return {
    formatVersion: 1,
    exportedAt: new Date().toISOString(),
    recipes,
    menus,
  }
}

export async function importAll(raw: unknown): Promise<void> {
  const data = validate(raw)
  await db.transaction('rw', db.recipes, db.menus, async () => {
    await db.recipes.clear()
    await db.menus.clear()
    if (data.recipes.length > 0) {
      await db.recipes.bulkPut(restoreRecipes(data.recipes))
    }
    if (data.menus.length > 0) {
      await db.menus.bulkPut(data.menus)
    }
  })
}

function validate(raw: unknown): BackupFile {
  if (!raw || typeof raw !== 'object') {
    throw new Error('バックアップファイルの形式が正しくありません。')
  }
  const obj = raw as Record<string, unknown>
  if (obj.formatVersion !== 1) {
    throw new Error('サポートしていないバックアップバージョンです。')
  }
  if (!Array.isArray(obj.recipes) || !Array.isArray(obj.menus)) {
    throw new Error('バックアップファイルの内容が不正です。')
  }
  return {
    formatVersion: 1,
    exportedAt: typeof obj.exportedAt === 'string' ? obj.exportedAt : '',
    recipes: obj.recipes as Recipe[],
    menus: obj.menus as MenuEntry[],
  }
}

function restoreRecipes(list: Recipe[]): Recipe[] {
  return list.map((r) => ({
    ...r,
    createdAt: new Date(r.createdAt),
    updatedAt: new Date(r.updatedAt),
  }))
}
