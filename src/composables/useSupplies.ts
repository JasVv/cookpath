import { ref } from 'vue'
import type { Supply } from '@/domain/types'
import {
  listSupplies,
  createSupply,
  updateSupply,
  deleteSupply,
} from '@/db/repositories/supplies'

export function useSupplies() {
  const supplies = ref<Supply[]>([])

  async function reload() {
    supplies.value = await listSupplies()
  }

  async function add(name: string) {
    if (!name.trim()) return
    await createSupply(name)
    await reload()
  }

  async function rename(id: string, name: string) {
    if (!name.trim()) return
    await updateSupply(id, name)
    await reload()
  }

  async function remove(id: string) {
    await deleteSupply(id)
    await reload()
  }

  return { supplies, reload, add, rename, remove }
}
