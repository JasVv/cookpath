import { db } from '@/db/schema'
import type { Supply } from '@/domain/types'
import { genId } from '@/utils/id'

export async function listSupplies(): Promise<Supply[]> {
  const all = await db.supplies.toArray()
  // 登録順（古いものが上）で安定させる
  all.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  return all
}

export async function createSupply(name: string): Promise<Supply> {
  const now = new Date()
  const supply: Supply = {
    id: genId(),
    name: name.trim(),
    createdAt: now,
    updatedAt: now,
  }
  await db.supplies.put(supply)
  return supply
}

export async function updateSupply(id: string, name: string): Promise<void> {
  const existing = await db.supplies.get(id)
  if (!existing) return
  await db.supplies.put({ ...existing, name: name.trim(), updatedAt: new Date() })
}

export async function deleteSupply(id: string): Promise<void> {
  await db.supplies.delete(id)
}
