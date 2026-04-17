# 02. 技術スタック

## 2.1 採用ライブラリ

| 種別 | 採用 | 備考 |
|---|---|---|
| 言語 | TypeScript | strict モード推奨 |
| フレームワーク | Vue 3 (Composition API) | `<script setup>` で書く |
| ビルドツール | Vite | 開発サーバー・本番ビルド |
| ルーティング | Vue Router | `createWebHashHistory()` を使用（理由は後述） |
| 状態管理 | Pinia（必要になったら導入） | まずは Composables（`useXxx`）で始めて足りなければ導入 |
| CSS | Tailwind CSS | ユーティリティクラス主体。必要に応じ素のCSS併用可 |
| 日付 | date-fns | tree-shaking が効く関数ベース。日本語ロケール併用 |
| IndexedDB ラッパ | Dexie.js | 型定義が充実。スキーマ・クエリを宣言的に書ける |
| ドラッグ&ドロップ | HTML5 Drag and Drop API（標準） | 外部ライブラリ不要。上書き/入れ替え確認ダイアログとの組み合わせを自前制御 |
| テスト | Vitest（任意） | 初期スコープでは必須としない。後で追加可 |
| リンタ／フォーマッタ | ESLint + Prettier（推奨） | Vue 公式テンプレートに沿う |

## 2.2 ホスティング

- **GitHub Pages** で配信する
- リポジトリ名がサブパスになる（例: `https://<user>.github.io/cookpath/`）
- デプロイは GitHub Actions で `npm run build` → `dist/` を `gh-pages` ブランチに公開する構成を想定
- Vite の `base` オプションをリポジトリ名に合わせて設定する（例: `base: '/cookpath/'`）

### なぜ Hash History か

`createWebHistory()` を使うと、ユーザーが直接サブページ URL にアクセスしたときや再読み込みしたときに GitHub Pages が 404 を返す（サーバーサイドで SPA フォールバックを設定できないため）。

`createWebHashHistory()` であれば URL の `#` 以降はクライアントで処理されるため、GitHub Pages のような静的ホスティングでも問題なく動作する。URL が `#/recipes` のようになる点はトレードオフだが、個人利用のため許容する。

## 2.3 ディレクトリ構成（提案）

```
cookpath/
├── design/                    # 設計ドキュメント（このディレクトリ）
├── public/                    # 静的アセット
├── src/
│   ├── main.ts                # エントリポイント
│   ├── App.vue                # ルートコンポーネント（ヘッダ + <router-view>）
│   ├── router/
│   │   └── index.ts           # ルーティング定義
│   ├── db/
│   │   ├── schema.ts          # Dexie スキーマ定義
│   │   ├── repositories/      # エンティティごとの Repository 関数
│   │   │   ├── recipes.ts
│   │   │   ├── menus.ts
│   │   │   └── meta.ts        # 最終 export 日時など
│   │   └── backup.ts          # JSON export/import
│   ├── domain/
│   │   └── types.ts           # Recipe / Dish / Ingredient / MenuEntry の型
│   ├── pages/
│   │   ├── CalendarPage.vue   # トップ（月＋週カレンダー）
│   │   ├── RecipesPage.vue    # レシピ管理
│   │   ├── ShoppingListPage.vue
│   │   └── SettingsPage.vue
│   ├── components/
│   │   ├── layout/
│   │   │   └── AppHeader.vue
│   │   ├── calendar/
│   │   │   ├── MonthCalendar.vue
│   │   │   ├── WeekCalendar.vue
│   │   │   └── DayCell.vue
│   │   ├── menu/
│   │   │   ├── MenuEditModal.vue
│   │   │   ├── DishCard.vue
│   │   │   ├── IngredientRow.vue
│   │   │   └── RecipePicker.vue         # 検索ボックス付きリスト
│   │   ├── recipe/
│   │   │   ├── RecipeList.vue
│   │   │   └── RecipeEditModal.vue
│   │   └── common/
│   │       ├── ConfirmDialog.vue
│   │       └── ModalBase.vue
│   ├── composables/
│   │   ├── useRecipes.ts
│   │   ├── useMenus.ts
│   │   ├── useShoppingList.ts
│   │   ├── usePersistentStorage.ts
│   │   └── useBackup.ts
│   ├── utils/
│   │   ├── date.ts            # date-fns の薄いラッパ
│   │   └── id.ts              # UUID 生成
│   └── assets/
│       └── styles/
│           └── tailwind.css
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── .github/
    └── workflows/
        └── deploy.yml         # GitHub Pages デプロイ
```

## 2.4 ブラウザストレージ戦略

### IndexedDB（Dexie.js 経由）

- レシピ、献立、メタ情報（最終 export 日時等）を保存
- スキーマ詳細は [03-data-model.md](./03-data-model.md) 参照

### Persistent Storage API

- 初回起動時、または設定画面の「永続化を要求」ボタンから `navigator.storage.persist()` を呼ぶ
- ブラウザのストレージ圧迫時に自動退避されにくくなる（ただしユーザー手動削除は防げない）
- `navigator.storage.persisted()` で現在の許可状態を取得できる
- `navigator.storage.estimate()` で使用容量を表示できる

### JSON Export / Import

- Export: 全テーブルを 1 つの JSON にまとめて `Blob` → `<a download>` でダウンロード
- Import: `<input type="file">` で読み込み → 既存データ全削除 → 投入（全置換）
- 最終 export 日時をメタ情報に保存し、30 日経過で設定画面に警告表示

## 2.5 UI デザイン方針

- Tailwind CSS のユーティリティクラスを基本に、シンプルで視認性重視のレイアウト
- ダークモード対応は初期スコープ外（必要になったら追加）
- 色は控えめに、データが主役になる配色
- ドラッグ中のゴースト、ドロップ可能領域のハイライトを CSS で明示

## 2.6 型安全・品質

- `tsconfig.json` は `strict: true`
- `any` は極力避ける。Dexie の型定義を活用
- Vue コンポーネントの props は `defineProps<{ ... }>()` で型付け
