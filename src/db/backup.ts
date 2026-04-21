import { db } from '@/db/schema'
import type { Recipe, MenuEntry, Supply } from '@/domain/types'

export interface BackupFile {
  formatVersion: 2
  exportedAt: string
  recipes: Recipe[]
  menus: MenuEntry[]
  supplies: Supply[]
}

export async function exportAll(): Promise<BackupFile> {
  const [recipes, menus, supplies] = await Promise.all([
    db.recipes.toArray(),
    db.menus.toArray(),
    db.supplies.toArray(),
  ])
  return {
    formatVersion: 2,
    exportedAt: new Date().toISOString(),
    recipes,
    menus,
    supplies,
  }
}

export async function importAll(raw: unknown): Promise<void> {
  const data = validate(raw)
  await db.transaction('rw', db.recipes, db.menus, db.supplies, async () => {
    await db.recipes.clear()
    await db.menus.clear()
    await db.supplies.clear()
    if (data.recipes.length > 0) {
      await db.recipes.bulkPut(restoreRecipes(data.recipes))
    }
    if (data.menus.length > 0) {
      await db.menus.bulkPut(data.menus)
    }
    if (data.supplies.length > 0) {
      await db.supplies.bulkPut(restoreSupplies(data.supplies))
    }
  })
}

function validate(raw: unknown): BackupFile {
  if (!raw || typeof raw !== 'object') {
    throw new Error('バックアップファイルの形式が正しくありません。')
  }
  const obj = raw as Record<string, unknown>
  // formatVersion 1（日用品が無い旧バックアップ）も読み込めるようにする
  if (obj.formatVersion !== 1 && obj.formatVersion !== 2) {
    throw new Error('サポートしていないバックアップバージョンです。')
  }
  if (!Array.isArray(obj.recipes) || !Array.isArray(obj.menus)) {
    throw new Error('バックアップファイルの内容が不正です。')
  }
  const supplies = Array.isArray(obj.supplies) ? (obj.supplies as Supply[]) : []
  return {
    formatVersion: 2,
    exportedAt: typeof obj.exportedAt === 'string' ? obj.exportedAt : '',
    recipes: obj.recipes as Recipe[],
    menus: obj.menus as MenuEntry[],
    supplies,
  }
}

function restoreRecipes(list: Recipe[]): Recipe[] {
  return list.map((r) => ({
    ...r,
    createdAt: new Date(r.createdAt),
    updatedAt: new Date(r.updatedAt),
  }))
}

function restoreSupplies(list: Supply[]): Supply[] {
  return list.map((s) => ({
    ...s,
    createdAt: new Date(s.createdAt),
    updatedAt: new Date(s.updatedAt),
  }))
}
