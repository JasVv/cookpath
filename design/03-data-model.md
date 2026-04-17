# 03. データモデル

## 3.1 エンティティ一覧

| エンティティ | 役割 |
|---|---|
| `Recipe` | レシピマスタ。レシピ管理画面で CRUD する。 |
| `Ingredient` | 材料（`Recipe` と `Dish` の両方に含まれる値オブジェクト）。 |
| `MenuEntry` | 1日分の献立。`date` をキーとし、複数の `Dish` を持つ。 |
| `Dish` | 1日内の1料理。レシピ参照あり／なしのいずれも可。 |
| `AppMeta` | アプリ全体のメタ情報（最終 export 日時など）。 |

## 3.2 TypeScript 型定義

```typescript
// src/domain/types.ts

/**
 * 材料（Recipe / Dish 共通の値オブジェクト）
 *
 * - 表記ゆれ（玉ねぎ / タマネギ / 玉葱）は別物として扱う（ユーザー入力に委ねる）
 * - 分量は「2」「大さじ1」「ひとつまみ」「少々」等を許容するため文字列
 * - 単位は「個」「g」「ml」等。空文字も許容
 */
export interface Ingredient {
  name: string
  amount: string
  unit: string
}

/**
 * レシピマスタ
 */
export interface Recipe {
  id: string              // UUID
  name: string
  ingredients: Ingredient[]
  procedureMemo: string   // 簡潔な手順メモ（空文字OK）
  createdAt: Date
  updatedAt: Date
}

/**
 * 1日内の1料理
 *
 * - recipeId が null のときは直接入力された料理
 * - ingredients はレシピから複製した値で保持。その日だけの分量変更はここで行う
 * - ingredients が空配列なら「料理名のみ」の記録（漬物など）
 */
export interface Dish {
  id: string                 // UUID。D&D・編集時の識別子
  name: string
  recipeId: string | null
  ingredients: Ingredient[]
  procedureMemo: string
}

/**
 * 1日分の献立
 *
 * - date は "YYYY-MM-DD" 形式（JST基準の日付文字列）
 * - dishes の順序は UI の表示順と一致させる
 */
export interface MenuEntry {
  date: string
  dishes: Dish[]
}

/**
 * アプリのメタ情報
 */
export interface AppMeta {
  id: 'singleton'               // 常に 1 レコードのみ
  lastExportedAt: Date | null
}
```

## 3.3 IndexedDB スキーマ（Dexie.js）

```typescript
// src/db/schema.ts
import Dexie, { type Table } from 'dexie'
import type { Recipe, MenuEntry, AppMeta } from '@/domain/types'

export class CookpathDB extends Dexie {
  recipes!: Table<Recipe, string>      // 主キー: id
  menus!: Table<MenuEntry, string>     // 主キー: date ("YYYY-MM-DD")
  meta!: Table<AppMeta, string>        // 主キー: id ('singleton' 固定)

  constructor() {
    super('cookpath')
    this.version(1).stores({
      recipes: 'id, name, updatedAt',   // name / updatedAt はインデックス（検索・並び替え用）
      menus: 'date',
      meta: 'id',
    })
  }
}

export const db = new CookpathDB()
```

### インデックス設計意図

- `recipes.name`: レシピ管理画面の検索・並び替えで使用
- `recipes.updatedAt`: 「更新日新順」ソートで使用
- `menus.date`: 月・週カレンダーで期間指定の `where('date').between(...)` を効かせる

## 3.4 Repository 関数（方針）

`src/db/repositories/*.ts` に、Dexie を直接叩かずに済む薄いラッパ関数を置く。画面・composable は Repository を介して DB にアクセスする。

例:

```typescript
// src/db/repositories/recipes.ts
import { db } from '@/db/schema'
import type { Recipe } from '@/domain/types'
import { genId } from '@/utils/id'

export async function listRecipes(): Promise<Recipe[]> {
  return db.recipes.orderBy('updatedAt').reverse().toArray()
}

export async function searchRecipes(query: string): Promise<Recipe[]> {
  const all = await listRecipes()
  if (!query) return all
  const q = query.toLowerCase()
  return all.filter(r => r.name.toLowerCase().includes(q))
}

export async function getRecipe(id: string): Promise<Recipe | undefined> {
  return db.recipes.get(id)
}

export async function createRecipe(input: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): Promise<Recipe> {
  const now = new Date()
  const recipe: Recipe = { id: genId(), createdAt: now, updatedAt: now, ...input }
  await db.recipes.put(recipe)
  return recipe
}

export async function updateRecipe(recipe: Recipe): Promise<void> {
  await db.recipes.put({ ...recipe, updatedAt: new Date() })
}

export async function deleteRecipe(id: string): Promise<void> {
  // 献立側の recipeId を null 化（過去の記録は残す）
  await db.transaction('rw', db.menus, db.recipes, async () => {
    const affected = await db.menus.toArray()
    for (const m of affected) {
      let changed = false
      for (const d of m.dishes) {
        if (d.recipeId === id) {
          d.recipeId = null
          changed = true
        }
      }
      if (changed) await db.menus.put(m)
    }
    await db.recipes.delete(id)
  })
}
```

```typescript
// src/db/repositories/menus.ts
import { db } from '@/db/schema'
import type { MenuEntry, Dish } from '@/domain/types'

export async function getMenu(date: string): Promise<MenuEntry | undefined> {
  return db.menus.get(date)
}

export async function listMenusInRange(fromDate: string, toDate: string): Promise<MenuEntry[]> {
  return db.menus.where('date').between(fromDate, toDate, true, true).toArray()
}

export async function saveMenu(entry: MenuEntry): Promise<void> {
  if (entry.dishes.length === 0) {
    await db.menus.delete(entry.date)
  } else {
    await db.menus.put(entry)
  }
}

// D&D: コピー（上書き）
export async function copyMenu(fromDate: string, toDate: string): Promise<void> {
  const src = await getMenu(fromDate)
  if (!src) return
  await saveMenu({ date: toDate, dishes: cloneDishes(src.dishes) })
}

// D&D: 入れ替え（スワップ）
export async function swapMenu(dateA: string, dateB: string): Promise<void> {
  const a = await getMenu(dateA)
  const b = await getMenu(dateB)
  await db.transaction('rw', db.menus, async () => {
    await db.menus.delete(dateA)
    await db.menus.delete(dateB)
    if (b) await db.menus.put({ date: dateA, dishes: b.dishes })
    if (a) await db.menus.put({ date: dateB, dishes: a.dishes })
  })
}

function cloneDishes(dishes: Dish[]): Dish[] {
  return dishes.map(d => ({ ...d, ingredients: d.ingredients.map(i => ({ ...i })) }))
}
```

## 3.5 JSON Export / Import フォーマット

```typescript
// src/db/backup.ts
export interface BackupFile {
  formatVersion: 1
  exportedAt: string         // ISO8601
  recipes: Recipe[]
  menus: MenuEntry[]
}
```

- Export: 上記形式の JSON を Blob 化してダウンロード。ファイル名例: `cookpath-backup-YYYYMMDD-HHmm.json`
- Import: ファイルを読み込み、`formatVersion` をチェック → 既存 `recipes` / `menus` を全削除 → 投入 → `meta.lastExportedAt` は更新しない（Export 時のみ更新）
- `formatVersion` は将来のスキーマ変更に備える。1 以外なら拒否する

## 3.6 永続化・ストレージ関連

### Persistent Storage

```typescript
// src/composables/usePersistentStorage.ts
export async function requestPersistence(): Promise<boolean> {
  if (!navigator.storage?.persist) return false
  return await navigator.storage.persist()
}

export async function isPersisted(): Promise<boolean> {
  if (!navigator.storage?.persisted) return false
  return await navigator.storage.persisted()
}

export async function estimateUsage(): Promise<{ usage: number; quota: number } | null> {
  if (!navigator.storage?.estimate) return null
  const r = await navigator.storage.estimate()
  return { usage: r.usage ?? 0, quota: r.quota ?? 0 }
}
```

初回アプリ起動時、`isPersisted()` が false なら自動で `requestPersistence()` を試みる（失敗しても機能は使える）。設定画面から再要求可能。

### 最終 Export 日時と 30 日警告

```typescript
// src/db/repositories/meta.ts
export async function getLastExportedAt(): Promise<Date | null> {
  const m = await db.meta.get('singleton')
  return m?.lastExportedAt ?? null
}

export async function touchExportedAt(): Promise<void> {
  await db.meta.put({ id: 'singleton', lastExportedAt: new Date() })
}

export function isExportStale(lastExportedAt: Date | null): boolean {
  if (!lastExportedAt) return true
  const ms = Date.now() - lastExportedAt.getTime()
  return ms > 30 * 24 * 60 * 60 * 1000
}
```

## 3.7 日付の扱い

- DB・JSON 上では `"YYYY-MM-DD"` の文字列（例: `"2026-04-17"`）。タイムゾーンは JST（端末のローカルタイム）基準で統一
- JS 側で扱う際は `date-fns` の `format(date, 'yyyy-MM-dd')` を使う
- 月・週カレンダーの日付範囲計算は `startOfMonth` / `endOfMonth` / `eachDayOfInterval` / `startOfWeek({ weekStartsOn: 0 })` を使う（週開始は日曜）
