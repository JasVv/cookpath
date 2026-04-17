# 05. 実装ステップ

## 5.1 実装順の原則

- **依存の少ないものから**: データ層 → 共通 UI → レシピ → カレンダー → 買い物リスト → 設定
- **各ステップ完了時に動作確認**: 動くものを積み上げる。未完成機能はコミットに残さない
- **UI と DB を分離**: ページコンポーネントは Repository 関数を介して DB にアクセス

## 5.2 ステップ一覧

### Step 1: プロジェクト初期化

**目的**: ビルドできる空の Vue 3 + TypeScript プロジェクトを用意する

**作業内容**
- `npm create vite@latest .` → Vue + TypeScript を選択
- 依存追加: `vue-router`, `dexie`, `date-fns`
- Tailwind CSS セットアップ（`npm install -D tailwindcss postcss autoprefixer` → `tailwind.config.js` / `postcss.config.js` / `src/assets/styles/tailwind.css`）
- `vite.config.ts` に `base: '/cookpath/'`（リポジトリ名に合わせる）
- `tsconfig.json` に `"strict": true`、パスエイリアス `@/*` 設定
- `.gitignore`（Vite 標準）
- ESLint + Prettier（任意、推奨）

**完了条件**
- `npm run dev` で真っ白ページが表示される
- `npm run build` が成功し、`dist/` が生成される

---

### Step 2: 型定義と DB 層

**目的**: データモデルと IndexedDB アクセス関数を用意する

**作業内容**
1. `src/domain/types.ts` に `Ingredient` / `Recipe` / `Dish` / `MenuEntry` / `AppMeta` の型を定義（[03-data-model.md](./03-data-model.md) の定義通り）
2. `src/utils/id.ts` に UUID 生成（`crypto.randomUUID()` のラッパ）
3. `src/utils/date.ts` に日付ユーティリティ（`formatDate(date, 'yyyy-MM-dd')`、日本語ロケール等）
4. `src/db/schema.ts` に `CookpathDB` クラスと `db` エクスポート
5. `src/db/repositories/recipes.ts` / `menus.ts` / `meta.ts` を実装
6. `src/db/backup.ts` に `exportAll()` / `importAll(json)` を実装

**完了条件**
- ブラウザコンソールから `db.recipes.put(...)` / `db.recipes.toArray()` が動作する
- 型エラーなく `tsc --noEmit` が通る

---

### Step 3: 共通レイアウトとルーティング

**目的**: ヘッダ + ルーティング枠組みを作る

**作業内容**
1. `src/router/index.ts` で 4 ルートを定義（`createWebHashHistory()` を使用）
2. 各ページを空の `<div>` コンポーネントとして作成: `CalendarPage.vue` / `RecipesPage.vue` / `ShoppingListPage.vue` / `SettingsPage.vue`
3. `src/components/layout/AppHeader.vue` を実装（アプリ名 + ナビリンク）
4. `App.vue` を `AppHeader` + `<router-view />` の構成にする
5. `ModalBase.vue` / `ConfirmDialog.vue` を実装

**完了条件**
- ヘッダのナビをクリックして各ページが切り替わる
- アクティブリンクにスタイルが当たる
- 確認ダイアログが呼び出し先から使える

---

### Step 4: レシピ管理画面

**目的**: レシピの CRUD 一式を動かす（献立機能の前提となる）

**作業内容**
1. `useRecipes.ts` composable: 一覧取得・検索・CRUD をラップ
2. `RecipesPage.vue`: 検索ボックス + 並び替えセレクト + レシピ一覧カード
3. `RecipeEditModal.vue`: 新規・編集兼用。材料行の追加・削除、手順メモ入力
4. `IngredientRow.vue`: 名前・分量・単位の 3 フィールド + 削除ボタン（共通化。献立入力モーダルでも再利用）
5. 削除は即時実行（警告なし）。ただし `deleteRecipe` は `Dish.recipeId` を null 化するトランザクション込み

**完了条件**
- レシピを追加・編集・削除できる
- 検索・並び替えが動く
- リロードしても内容が残る

---

### Step 5: 月カレンダー + 献立入力モーダル

**目的**: トップ画面の骨格と、日単位の献立入力を動かす

**作業内容**
1. `useMenus.ts` composable: 期間取得・保存
2. `MonthCalendar.vue`: 月送りヘッダ、7×6 グリッド、当日強調、セル内料理名リスト（スクロール対応）
3. `DayCell.vue`: 1日分のセル（料理名リスト、クリックで emit）
4. `CalendarPage.vue`: `MonthCalendar` を配置。初期月は当月
5. `RecipePicker.vue`: 検索ボックス付きレシピリスト
6. `MenuEditModal.vue`: 料理カード追加（レシピから選択／直接入力）、並び替え、削除、保存
7. `DishCard.vue`: 料理カード（料理名・材料行・メモ・レシピ更新/新規保存ボタン）
8. レシピ更新／新規保存は確認ダイアログ経由

**完了条件**
- 月カレンダーで月送り・当日強調が正しい
- セルをクリックして献立入力モーダルが開く
- レシピ選択／直接入力どちらも保存でき、カレンダーに反映される
- レシピ更新・新規保存が確認ダイアログ経由で動く

---

### Step 6: 週カレンダーとドラッグ&ドロップ

**目的**: 当日起点の週カレンダーを追加し、月↔週・月↔月・週↔週の D&D を実装

**作業内容**
1. `WeekCalendar.vue`: 起点日を props で受け取り、7 日分を表示。左右ボタンで起点を ±1 日
2. `CalendarPage.vue` に `WeekCalendar` を月カレンダーの上に配置。週カレンダーの起点は独立状態として保持（初期値: 当日）
3. HTML5 Drag and Drop を `DayCell.vue` に実装
   - `draggable="true"`、`dragstart` で `date` を `dataTransfer` に乗せる
   - `dragover.prevent` で受け入れ、`drop` で日付を比較
4. ドロップ時のロジック
   - 同じ日付なら何もしない
   - ドロップ先が空なら `copyMenu(src, dst)`
   - ドロップ先に献立があれば `ConfirmDialog` で 3 択（上書き / 入れ替え / キャンセル）
     - 上書き: `copyMenu`
     - 入れ替え: `swapMenu`
5. ドラッグ中のゴースト（半透明化）、ドロップ可能時のハイライトを Tailwind で付ける
6. D&D 後はカレンダーを再読み込みして反映

**完了条件**
- 週カレンダーが起点日を 1 日単位で動かせる
- 月・週の全組み合わせで D&D ができる
- 既存献立ありセルへのドロップ時、ダイアログが 3 択で表示される
- 上書き／入れ替えが正しく動く

---

### Step 7: 買い物リスト画面

**目的**: 期間指定で材料一覧を生成し、チェックで取り消し線を付ける

**作業内容**
1. `useShoppingList.ts` composable: 期間指定 → `listMenusInRange` → 材料展開
2. `ShoppingListPage.vue`:
   - 期間入力（デフォルト: 当日〜当日+6日）+ `[生成]` ボタン
   - 並び順ラジオ（日付順／材料名順）
   - 一覧表示（チェックボックス + 材料名 + 分量+単位 + 出典）
   - チェック状態はコンポーネントローカルに保持（ページ離脱で消える）
   - チェックで取り消し線（並び順は不変）
   - `[すべてチェック解除]`
3. 空の材料行（`name` 空 or `amount` 空）は除外

**完了条件**
- 期間を変えて `[生成]` すると一覧が再計算される
- 日付順／材料名順を切り替えられる
- チェックで取り消し線がつく（ページ遷移すると消える）

---

### Step 8: 設定画面

**目的**: バックアップ・ストレージ管理 UI を整える

**作業内容**
1. `useBackup.ts` composable: `exportAll()` / `importAll()` をラップし、ファイル選択・ダウンロード処理を内包
2. `usePersistentStorage.ts` composable: `requestPersistence` / `isPersisted` / `estimateUsage`
3. `SettingsPage.vue`:
   - [JSONエクスポート]: ファイルダウンロード + `meta.lastExportedAt` 更新
   - [JSONインポート]: ファイル選択 → 確認ダイアログ → 全置換
   - 最終エクスポート日時表示、30 日超過時に警告バナー
   - 永続化ストレージ状態表示、[永続化を要求] ボタン
   - 使用容量表示（MB 単位）
4. `App.vue` の `onMounted` で初回起動時に `requestPersistence()` を試みる（結果握りつぶし）

**完了条件**
- エクスポートしたファイルでインポートできる（全置換）
- 永続化ストレージの状態が正しく表示される
- 最終エクスポート日時が 30 日を超えたら警告が出る

---

### Step 9: GitHub Pages デプロイ

**目的**: 本番公開

**作業内容**
1. `.github/workflows/deploy.yml` を作成（`main` push で `npm run build` → `gh-pages` ブランチへデプロイ、または `actions/deploy-pages`）
2. GitHub リポジトリ設定で Pages のソースを指定
3. `vite.config.ts` の `base` がリポジトリ名と一致しているか確認
4. 本番 URL で全機能を動作確認

**完了条件**
- `https://<user>.github.io/cookpath/` で動作する
- リロードや直接 URL アクセスでも 404 にならない（ハッシュルーター効果）

---

## 5.3 追加で検討する事項（初期実装後）

以下は初期スコープに含めないが、実装進行中に気づいたらメモしておく。

- レシピ編集のアンドゥ
- カレンダーセルのキーボード操作対応
- 献立の複製（ある日の献立を別日に単にコピー、D&D 以外の手段）
- 買い物リストのテキストコピー（クリップボード）
- ダークモード

## 5.4 開発時に守ること

- **CLAUDE.md の言語ルール**: コミットメッセージ・PR 説明・コード内コメントは原則日本語。識別子は英語
- **`any` を避ける**: Dexie の型、Vue の `defineProps` を活用
- **コンポーネントは小さく**: 1 ファイル 300 行を超えたら分割を検討
- **ユーティリティは再利用可能に**: 材料行、モーダル枠、確認ダイアログは共通化
- **動かないコードをコミットしない**: 各ステップ完了時にビルドとブラウザ確認
- **ユーザーのデータが消える可能性のある操作には必ず確認ダイアログ**: 全置換インポートなど
