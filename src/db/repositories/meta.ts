import { db } from '@/db/schema'
import type { AppMeta } from '@/domain/types'

const SINGLETON_ID: 'singleton' = 'singleton'

export async function getMeta(): Promise<AppMeta> {
  const m = await db.meta.get(SINGLETON_ID)
  if (m) return m
  const initial: AppMeta = { id: SINGLETON_ID, lastExportedAt: null }
  await db.meta.put(initial)
  return initial
}

export async function touchExportedAt(): Promise<void> {
  await db.meta.put({ id: SINGLETON_ID, lastExportedAt: new Date() })
}

export async function getLastExportedAt(): Promise<Date | null> {
  const m = await getMeta()
  return m.lastExportedAt ?? null
}

export function isExportStale(lastExportedAt: Date | null): boolean {
  if (!lastExportedAt) return true
  const ms = Date.now() - lastExportedAt.getTime()
  return ms > 30 * 24 * 60 * 60 * 1000
}
