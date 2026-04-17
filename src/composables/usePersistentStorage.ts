export async function requestPersistence(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.storage?.persist) return false
  return await navigator.storage.persist()
}

export async function isPersisted(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.storage?.persisted) return false
  return await navigator.storage.persisted()
}

export interface StorageUsage {
  usage: number
  quota: number
}

export async function estimateUsage(): Promise<StorageUsage | null> {
  if (typeof navigator === 'undefined' || !navigator.storage?.estimate) return null
  const r = await navigator.storage.estimate()
  return { usage: r.usage ?? 0, quota: r.quota ?? 0 }
}
