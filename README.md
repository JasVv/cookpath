# Cookpath -メニュー記録と買い物サポート-

個人用の献立管理と買い物チェックリスト作成をサポートする PC 向け Web アプリ。
フロントエンドのみ（Vue 3 + TypeScript + Vite + Dexie/IndexedDB）で構成し、GitHub Pages で配信する。

設計の詳細は [design/](./design) 配下を参照。

## セットアップ

```bash
npm install
npm run dev       # 開発サーバー
npm run build     # 本番ビルド (dist/)
npm run preview   # ビルド結果のローカル確認
npm run typecheck # 型チェックのみ
```

Node 20 系を想定。

## デプロイ

`main` への push で `.github/workflows/deploy.yml` が GitHub Pages に自動デプロイする。
Vite の `base` は `/cookpath/` に設定しているため、リポジトリ名を変更する場合は
[vite.config.ts](./vite.config.ts) の `base` も揃えること。

## データ

- 保存先: IndexedDB（データベース名 `cookpath`、ラッパ: Dexie.js）
- ルーティングはハッシュ履歴 (`#/...`) を使用
- 設定画面から JSON エクスポート／インポート、永続化ストレージの要求が可能
- エクスポートから 30 日経過で設定画面に警告表示
