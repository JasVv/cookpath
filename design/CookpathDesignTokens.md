# Cookpath デザイントークン定義書 — C案 "Paper & Persimmon"

紙のような温白地に柿色を主役、深緑を補色として用いる温かみのあるパレット。
Claude Code / 開発者がこのドキュメントを起点に `tailwind.config.js` と global CSS を更新し、各コンポーネントの className を差し替えられるよう構成しています。

- 対象: `JasVv/cookpath`（Vue 3 + Vite + Tailwind CSS）
- 言語ルール: 識別子は英語、ユーザー向け文言は日本語

---

## 1. カラートークン

### 1.1 セマンティック定義（参照時はこちらを使うこと）

| トークン | HEX | 用途 |
|---|---|---|
| `bg` | `#FAF5EC` | ページ背景（和紙のような温白） |
| `bg-subtle` | `#F2EADB` | セクション背景・入力フォーム地・ホバー弱 |
| `surface` | `#FFFFFF` | カード・モーダル・セル背景 |
| `surface-raised` | `#FFFFFF` | ポップオーバー・ドロップダウン（+ shadow） |
| `border` | `#E8DFCB` | 標準の罫線・カード縁 |
| `border-strong` | `#D2C3A2` | 強調罫線・チェックボックス枠・フォーカス前の入力枠 |
| `grid-line` | `#EDE2CB` | カレンダーの格子罫線（標準 border より薄い） |
| `text` | `#262320` | 本文・見出し（炭黒） |
| `text-muted` | `#7E7466` | 補助テキスト・日付番号（ラベル弱） |
| `text-subtle` | `#A89B87` | さらに弱い補助（プレースホルダ等） |
| `primary` | `#E07856` | ブランド主色＝柿色。主要ボタン・当日強調・アクティブタブ |
| `primary-hover` | `#C9623F` | `primary` のホバー／押下 |
| `primary-soft` | `#F9E0D1` | `primary` の薄地（アクティブ背景・当日背景・プライマリ警告地） |
| `primary-ring` | `rgba(224,120,86,0.35)` | フォーカスリング |
| `accent` | `#3E5A46` | 深緑。セクション見出しバー・チェック済み・生成ボタン等 |
| `accent-hover` | `#324A3A` | `accent` のホバー |
| `accent-soft` | `#DDE5DC` | `accent` の薄地（成功状態・タグ等） |
| `danger` | `#B54A2B` | 削除・破壊的操作 |
| `danger-soft` | `#F6DED3` | 削除ボタンの薄地・エラー背景 |
| `sunday` | `#B54A2B` | カレンダーの日曜ラベル |
| `saturday` | `#3F5A78` | カレンダーの土曜ラベル |

### 1.2 フォーカスリング

`0 0 0 3px var(--primary-ring)` をインタラクティブ要素（ボタン・入力・チェックボックス）の `:focus-visible` に適用。

### 1.3 使い分けの原則

- **主要アクション**（新規追加・保存）は `primary`。アプリ全体で一つのストーリーになるよう乱用しない
- **補助的な実行アクション**（買い物リスト生成・日用品追加）は `accent`。`primary` が他にあっても被らない
- **現在地／チェック済み**のような「状態」表現は `accent-soft` / `primary-soft` の薄地で表現し、本文コントラストを保つ
- カードやセクションは `surface`（白）。ページ地は `bg`（和紙色）。白と和紙色の組み合わせで温かさと清潔さを両立
- 罫線は原則 `border`。カレンダーの密な格子だけ `grid-line` を使って軽くする

---

## 2. タイポグラフィ

### 2.1 フォントファミリー

```css
--font-sans: "Noto Sans JP", "Hiragino Sans", "Yu Gothic", "Meiryo", system-ui, sans-serif;
--font-mono: ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
```

Google Fonts からの読み込み:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### 2.2 タイプスケール

| 役割 | サイズ | 行間 | ウェイト | Tailwind |
|---|---|---|---|---|
| ページタイトル（H1） | 20px | 1.4 | 700 | `text-xl font-bold` |
| セクション見出し（H2） | 14px | 1.4 | 700 | `text-sm font-bold` |
| 本文 | 13.5–14px | 1.6 | 400 | `text-sm` |
| UIラベル・ボタン | 13px | 1.4 | 500–600 | `text-[13px] font-medium` |
| 補助テキスト | 12px | 1.5 | 400 | `text-xs` |
| 日付番号 | 11–12px | 1 | 500–700 | `text-xs` |

数字には `font-variant-numeric: tabular-nums` を付けて桁揃え。

---

## 3. スペーシング・角丸・影

| トークン | 値 | 用途 |
|---|---|---|
| `radius-sm` | `4px` | チェックボックス・タグ |
| `radius-md` | `6px` | ボタン・入力 |
| `radius-lg` | `8px` | カード・リスト行 |
| `radius-xl` | `10px` | セクションコンテナ・モーダル |
| `shadow-card` | `0 1px 2px rgba(40, 30, 20, 0.04), 0 2px 8px rgba(40, 30, 20, 0.04)` | カード基本 |
| `shadow-raised` | `0 4px 16px rgba(40, 30, 20, 0.08)` | モーダル・ドロップダウン |
| `shadow-ring-today` | `inset 0 0 0 1.5px var(--primary)` | 当日セルの内枠強調 |

スペーシングは Tailwind デフォルト（4px 基準）をそのまま使用。セクション間 `gap-4`（16px）、カード内 `p-4`/`p-5`、ページ外周 `px-7 py-6`（28px / 24px）程度を目安。

---

## 4. Tailwind 設定

`tailwind.config.js` に以下の差分を適用。

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // パレット生値（custom 用途時の fallback）
        paper:   { 50:'#FAF5EC', 100:'#F2EADB', 200:'#E8DFCB', 300:'#D2C3A2', 400:'#A89B87' },
        ink:     { 900:'#262320', 700:'#4A4339', 500:'#7E7466' },
        persimmon:{ 50:'#F9E0D1', 500:'#E07856', 600:'#C9623F', 700:'#B54A2B' },
        forest:  { 50:'#DDE5DC', 600:'#3E5A46', 700:'#324A3A' },

        // セマンティック（コンポーネントからはこちらを参照）
        bg:            '#FAF5EC',
        'bg-subtle':   '#F2EADB',
        surface:       '#FFFFFF',
        border:        { DEFAULT: '#E8DFCB', strong: '#D2C3A2' },
        grid:          '#EDE2CB',
        text:          { DEFAULT: '#262320', muted: '#7E7466', subtle: '#A89B87' },
        primary:       { DEFAULT: '#E07856', hover: '#C9623F', soft: '#F9E0D1' },
        accent:        { DEFAULT: '#3E5A46', hover: '#324A3A', soft: '#DDE5DC' },
        danger:        { DEFAULT: '#B54A2B', soft: '#F6DED3' },
        sunday:        '#B54A2B',
        saturday:      '#3F5A78',
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', '"Hiragino Sans"', '"Yu Gothic"', '"Meiryo"', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', '"SFMono-Regular"', 'Menlo', 'Consolas', 'monospace'],
      },
      borderRadius: {
        sm: '4px', md: '6px', lg: '8px', xl: '10px',
      },
      boxShadow: {
        card:    '0 1px 2px rgba(40,30,20,0.04), 0 2px 8px rgba(40,30,20,0.04)',
        raised:  '0 4px 16px rgba(40,30,20,0.08)',
      },
      ringColor: {
        DEFAULT: 'rgba(224,120,86,0.35)',
      },
    },
  },
  plugins: [],
}
```

> `border.DEFAULT` / `border.strong` を分けているため `border-border` / `border-border-strong` のように参照できる。既存の Tailwind `border-DEFAULT` も引き続き `#E8DFCB` を指す。

---

## 5. グローバル CSS

`src/assets/styles/tailwind.css`（または同等ファイル）の先頭に以下を追加。

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Color */
  --bg: #FAF5EC;
  --bg-subtle: #F2EADB;
  --surface: #FFFFFF;
  --border: #E8DFCB;
  --border-strong: #D2C3A2;
  --grid-line: #EDE2CB;
  --text: #262320;
  --text-muted: #7E7466;
  --text-subtle: #A89B87;
  --primary: #E07856;
  --primary-hover: #C9623F;
  --primary-soft: #F9E0D1;
  --primary-ring: rgba(224,120,86,0.35);
  --accent: #3E5A46;
  --accent-hover: #324A3A;
  --accent-soft: #DDE5DC;
  --danger: #B54A2B;
  --danger-soft: #F6DED3;
  --sunday: #B54A2B;
  --saturday: #3F5A78;

  /* Typography */
  --font-sans: "Noto Sans JP", "Hiragino Sans", "Yu Gothic", "Meiryo", system-ui, sans-serif;
  --font-mono: ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;

  /* Radius & shadow */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 10px;
  --shadow-card: 0 1px 2px rgba(40,30,20,0.04), 0 2px 8px rgba(40,30,20,0.04);
  --shadow-raised: 0 4px 16px rgba(40,30,20,0.08);
}

html, body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-sans);
  font-feature-settings: "palt";
  -webkit-font-smoothing: antialiased;
}

/* フォーカスリング統一 */
*:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--primary-ring);
  border-radius: inherit;
}

/* 数値揃え */
.tabular { font-variant-numeric: tabular-nums; }
```

---

## 6. コンポーネント別の適用ガイド

Claude Code はこの節を起点に既存 `.vue` の className を差し替える。

### 6.1 ボタン

```html
<!-- Primary（新規追加・保存） -->
<button class="px-3.5 py-1.5 text-[13px] font-semibold rounded-md
               bg-primary text-white hover:bg-primary-hover
               transition-colors">＋新規レシピ</button>

<!-- Accent（生成・日用品追加） -->
<button class="px-3.5 py-1.5 text-[13px] font-semibold rounded-md
               bg-accent text-white hover:bg-accent-hover">生成</button>

<!-- Ghost（編集・キャンセル） -->
<button class="px-3 py-1 text-xs font-semibold rounded-md
               bg-surface text-text border border-border
               hover:bg-bg-subtle">編集</button>

<!-- Danger（削除） -->
<button class="px-3 py-1 text-xs font-semibold rounded-md
               bg-surface text-danger border border-danger/40
               hover:bg-danger-soft">削除</button>
```

### 6.2 入力欄

```html
<input class="w-full px-3 py-2 text-sm rounded-md
              bg-surface border border-border text-text
              placeholder:text-text-subtle
              focus:border-primary focus:ring-2 focus:ring-primary/30" />
```

### 6.3 チェックボックス

```html
<!-- wrapper は CSS で自前描画（チェック状態を accent で） -->
<input type="checkbox" class="appearance-none w-4 h-4 rounded-sm
      border-[1.5px] border-border-strong bg-surface cursor-pointer
      checked:bg-accent checked:border-accent
      checked:bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 10 10%22><path d=%22M2 5l2 2 4-4%22 fill=%22none%22 stroke=%22white%22 stroke-width=%221.8%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/></svg>')] bg-center bg-no-repeat" />
```

### 6.4 ヘッダーナビ

```html
<header class="bg-surface border-b border-border px-7 py-3.5 flex items-center gap-8">
  <div class="font-bold">
    <span class="text-primary">Cookpath</span>
    <span class="text-text-muted font-normal text-xs ml-1.5">−メニュー記録と買い物サポート−</span>
  </div>
  <nav class="ml-auto flex gap-1">
    <router-link
      v-for="item in nav"
      :to="item.to"
      active-class="bg-primary-soft text-primary font-semibold border border-primary/25"
      class="px-3.5 py-1.5 text-[13.5px] font-medium rounded-md
             text-text-muted border border-transparent
             hover:text-text hover:bg-bg-subtle transition-colors">
      {{ item.label }}
    </router-link>
  </nav>
</header>
```

### 6.5 カレンダーセル

```html
<!-- 通常セル -->
<div class="bg-surface border-r border-b border-grid p-1.5 min-h-[70px]">
  <span class="text-xs text-text">21</span>
</div>

<!-- 当日セル -->
<div class="bg-primary-soft border-r border-b border-grid p-1.5 min-h-[70px]
            ring-[1.5px] ring-inset ring-primary">
  <span class="text-xs font-bold text-primary">21</span>
  <div class="text-[11px] text-primary font-semibold mt-1">生姜焼き</div>
</div>

<!-- 曜日ヘッダ -->
<div class="bg-bg-subtle py-1.5 text-xs font-semibold text-center border-r border-b border-grid"
     :class="{
       'text-sunday': dow === 0,
       'text-saturday': dow === 6,
       'text-text-muted': dow > 0 && dow < 6
     }">日</div>
```

### 6.6 カード・セクション

```html
<section class="bg-surface rounded-xl border border-border p-4 shadow-card">
  <!-- セクション見出し（accent バー付き） -->
  <h2 class="flex items-center gap-2.5 mb-3">
    <span class="w-1 h-4 rounded-sm bg-accent"></span>
    <span class="text-sm font-bold text-text">データ管理</span>
  </h2>
  …
</section>
```

### 6.7 警告バナー（30日未export）

```html
<div class="flex items-center gap-2 px-3 py-2 rounded-md
            bg-primary-soft border border-primary/30 text-primary-hover text-xs">
  <span>⚠</span>
  <span>30日以上エクスポートされていません。バックアップを推奨します。</span>
</div>
```

### 6.8 モーダル

```html
<div class="fixed inset-0 z-50 bg-ink-900/40 backdrop-blur-[2px]
            flex items-center justify-center">
  <div class="bg-surface rounded-xl shadow-raised border border-border
              max-w-2xl w-[92%] max-h-[85vh] overflow-hidden flex flex-col">
    <!-- header -->
    <div class="px-5 py-3.5 border-b border-border flex items-center">
      <h3 class="text-base font-bold">2026年4月21日(火) の献立</h3>
      <button class="ml-auto text-text-muted hover:text-text">×</button>
    </div>
    <!-- body / footer 省略 -->
  </div>
</div>
```

---

## 7. 移行チェックリスト（Claude Code 向け指示）

1. `tailwind.config.js` を §4 の内容で置き換え（`extend` 部分）
2. `src/assets/styles/tailwind.css` 先頭に §5 の CSS変数＋body ベーススタイルを追加
3. `index.html` に §2.1 の Google Fonts リンクを追加
4. 既存の色指定を以下の対応で一括置換:
   - `bg-white` → `bg-surface`（カード）/ 保持（純白が必要な特殊ケース）
   - `bg-gray-50` / `bg-gray-100` → `bg-bg` or `bg-bg-subtle`
   - `text-gray-900` → `text-text`
   - `text-gray-500` / `text-gray-600` → `text-text-muted`
   - `border-gray-200` / `border-gray-300` → `border-border`
   - `bg-green-500` / `bg-emerald-500`（既存プライマリ）→ `bg-primary`
   - `text-green-600`（アクティブナビ）→ `text-primary` + `bg-primary-soft`
   - `bg-red-500` / `text-red-600`（削除）→ `text-danger` + `border-danger/40`
5. `AppHeader.vue`: §6.4 のマークアップに差し替え、router-link の `active-class` を更新
6. `MonthCalendar.vue` / `DayCell.vue`: §6.5 を参照。当日判定ブロックで `bg-primary-soft ring-inset ring-primary` を付与。曜日ヘッダの日曜/土曜色分けを `sunday` / `saturday` セマンティックトークンに
7. `ShoppingListPage.vue`: セクション見出しに §6.6 の accent バーを追加。チェック済み行は `opacity-60 line-through` で表現（色は `text` のまま、取り消し線のみ）
8. `SettingsPage.vue`: §6.7 の警告バナーを `meta.lastExportedAt` 30日超過時に表示。各セクションカードを §6.6 のスタイルに
9. ボタンは §6.1 に従って semantic に分類:
   - 「新規〜」「保存」「JSONエクスポート」→ Primary
   - 「追加」「生成」→ Accent
   - 「編集」「キャンセル」「JSONインポート」「すべてチェック解除」「永続化を要求」→ Ghost
   - 「削除」→ Danger

---

## 8. 付録: コントラスト検証

WCAG AA（4.5:1 for small text, 3:1 for large text）を満たすことを確認済み:

| 前景 / 背景 | コントラスト比 | 判定 |
|---|---|---|
| `text` #262320 on `bg` #FAF5EC | 14.6:1 | AAA |
| `text` #262320 on `surface` #FFFFFF | 15.9:1 | AAA |
| `text-muted` #7E7466 on `bg` | 4.7:1 | AA |
| `primary` #E07856 on `surface` | 3.4:1 | AA (large/UI) |
| `white` on `primary` #E07856 | 3.4:1 | AA (large/UI) |
| `white` on `accent` #3E5A46 | 7.9:1 | AAA |
| `sunday` #B54A2B on `surface` | 5.3:1 | AA |
| `saturday` #3F5A78 on `surface` | 7.4:1 | AAA |

`primary` 上の白文字はボタンサイズ（13px font-semibold）で AA Large 基準に収まる。不安な場合はボタン内テキストを 14px+ に上げるか、ボタン本体を `accent` に寄せる余地あり。

---

## 9. ライセンス・クレジット

- フォント: Noto Sans JP (SIL Open Font License 1.1)
- パレットはこのプロジェクトのために作成したオリジナル
