import { ref } from 'vue'
import type { MenuEntry } from '@/domain/types'
import { listMenusInRange, saveMenu } from '@/db/repositories/menus'

export function useMenus() {
  const menusByDate = ref<Record<string, MenuEntry>>({})

  async function loadRange(from: string, to: string) {
    const list = await listMenusInRange(from, to)
    const map: Record<string, MenuEntry> = {}
    for (const m of list) map[m.date] = m
    menusByDate.value = map
  }

  async function save(entry: MenuEntry) {
    await saveMenu(entry)
    if (entry.dishes.length === 0) {
      delete menusByDate.value[entry.date]
    } else {
      menusByDate.value = { ...menusByDate.value, [entry.date]: entry }
    }
  }

  return { menusByDate, loadRange, save }
}
