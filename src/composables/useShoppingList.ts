import { ref } from 'vue'
import { listMenusInRange } from '@/db/repositories/menus'
import { listSupplies } from '@/db/repositories/supplies'
import { addDays, toDateKey } from '@/utils/date'

export interface ShoppingRow {
  id: string
  date: string
  dishName: string
  name: string
  amount: string
  unit: string
}

export interface SupplyRow {
  id: string
  supplyId: string
  name: string
  createdAt: Date
}

export type ShoppingSort = 'date' | 'name'

// モジュールレベルで状態を保持し、画面遷移しても期間・並び順・チェック状態を維持する
const today = new Date()
const fromKey = ref(toDateKey(today))
const toKey = ref(toDateKey(addDays(today, 6)))
const sortMode = ref<ShoppingSort>('date')
const rows = ref<ShoppingRow[]>([])
const supplyRows = ref<SupplyRow[]>([])
const checked = ref<Record<string, boolean>>({})

// 食材行 ID は内容ベース。内容が変化すれば ID も変わるため、チェックは自動で外れる仕組み
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

// 日用品行 ID は supplyId と name を含めることで、改名時に自動でチェックが外れるようにする
function buildSupplyRowId(supplyId: string, name: string): string {
  return ['supply', supplyId, name].join('\u0001')
}

async function generate() {
  if (fromKey.value > toKey.value) return
  const [menus, supplies] = await Promise.all([
    listMenusInRange(fromKey.value, toKey.value),
    listSupplies(),
  ])
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

  const supplyList: SupplyRow[] = supplies.map((s) => ({
    id: buildSupplyRowId(s.id, s.name),
    supplyId: s.id,
    name: s.name,
    createdAt: s.createdAt,
  }))

  // 現存する行 ID に対応するチェックのみを残す（行が消えた・内容が変わったものは自動で解除）
  const present = new Set<string>()
  for (const r of list) present.add(r.id)
  for (const r of supplyList) present.add(r.id)
  const next: Record<string, boolean> = {}
  for (const [k, v] of Object.entries(checked.value)) {
    if (v && present.has(k)) next[k] = true
  }
  rows.value = list
  supplyRows.value = supplyList
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

function sortedSupplyRows(mode: ShoppingSort): SupplyRow[] {
  const list = [...supplyRows.value]
  if (mode === 'name') {
    list.sort((a, b) => a.name.localeCompare(b.name, 'ja'))
  } else {
    // 日付順時は登録順（古い順）で安定表示
    list.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  }
  return list
}

function clearChecks() {
  checked.value = {}
}

export function useShoppingList() {
  return {
    fromKey,
    toKey,
    sortMode,
    rows,
    supplyRows,
    checked,
    generate,
    sortedRows,
    sortedSupplyRows,
    clearChecks,
  }
}
