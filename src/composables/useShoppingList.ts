import { ref } from 'vue'
import { listMenusInRange } from '@/db/repositories/menus'
import { addDays, toDateKey } from '@/utils/date'

export interface ShoppingRow {
  id: string
  date: string
  dishName: string
  name: string
  amount: string
  unit: string
}

export type ShoppingSort = 'date' | 'name'

// モジュールレベルで状態を保持し、画面遷移しても期間・並び順・チェック状態を維持する
const today = new Date()
const fromKey = ref(toDateKey(today))
const toKey = ref(toDateKey(addDays(today, 6)))
const sortMode = ref<ShoppingSort>('date')
const rows = ref<ShoppingRow[]>([])
const checked = ref<Record<string, boolean>>({})

// 行 ID は内容ベース。内容が変化すれば ID も変わるため、チェックは自動で外れる仕組み
function buildRowId(
  date: string,
  dishName: string,
  name: string,
  amount: string,
  unit: string,
  occurrence: number,
): string {
  // 項目内容との衝突を避けるため ASCII 制御文字 (U+0001) を区切りに使う
  return [date, dishName, name, amount, unit, String(occurrence)].join('\u0001')
}

async function generate() {
  if (fromKey.value > toKey.value) return
  const menus = await listMenusInRange(fromKey.value, toKey.value)
  menus.sort((a, b) => a.date.localeCompare(b.date))
  const list: ShoppingRow[] = []
  const occurrences = new Map<string, number>()
  for (const m of menus) {
    for (const dish of m.dishes) {
      for (const ing of dish.ingredients) {
        if (!ing.name.trim() || !ing.amount.trim()) continue
        const base = `${m.date}\u0001${dish.name}\u0001${ing.name}\u0001${ing.amount}\u0001${ing.unit}`
        const n = occurrences.get(base) ?? 0
        occurrences.set(base, n + 1)
        list.push({
          id: buildRowId(m.date, dish.name, ing.name, ing.amount, ing.unit, n),
          date: m.date,
          dishName: dish.name,
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
        })
      }
    }
  }
  // 現存する行 ID に対応するチェックのみを残す（行が消えた・内容が変わったものは自動で解除）
  const present = new Set(list.map((r) => r.id))
  const next: Record<string, boolean> = {}
  for (const [k, v] of Object.entries(checked.value)) {
    if (v && present.has(k)) next[k] = true
  }
  rows.value = list
  checked.value = next
}

function sortedRows(mode: ShoppingSort): ShoppingRow[] {
  const list = [...rows.value]
  if (mode === 'name') {
    list.sort(
      (a, b) => a.name.localeCompare(b.name, 'ja') || a.date.localeCompare(b.date),
    )
  }
  // mode === 'date' の場合は generate 時の順序（date/dish/ingredient 順）をそのまま使う
  return list
}

function clearChecks() {
  checked.value = {}
}

export function useShoppingList() {
  return { fromKey, toKey, sortMode, rows, checked, generate, sortedRows, clearChecks }
}
