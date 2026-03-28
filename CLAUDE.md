# stateful-ui — CLAUDE.md

> このファイルは Claude Code がセッション開始時に読み込むプロジェクト固有の設定。
> グローバル設定（`~/.claude/CLAUDE.md`）と組み合わせて使う。

---

## プロジェクト概要

**stateful-ui** は「振る舞い込みコンポーネント」を提供する React 向け OSS ライブラリ。
非同期状態・フォーム・データ取得の「めんどくさい」を1コンポーネントで解決する。

| 項目 | 内容 |
|------|------|
| パッケージ名 | `@stateful-ui/react` / `@stateful-ui/cli` |
| 配布モデル | shadcn/ui 型（コピペ CLI） + npm パッケージ |
| ターゲット | React 18 / 19、TypeScript strict |
| パッケージマネージャ | yarn (berry) + workspaces |

---

## ディレクトリ構造

```
stateful-ui/
├── CLAUDE.md                     ← このファイル
├── README.md                     ← ユーザー向けドキュメント
├── .claude/
│   ├── rules/
│   │   ├── coding-style.md       ← TypeScript / React コーディング規約
│   │   ├── testing.md            ← テスト戦略・命名規則
│   │   └── plan-template.md      ← Plan モードの計画テンプレート
│   └── CLAUDE.md                 ← （このファイルと同一視される）
├── packages/
│   ├── react/                    ← @stateful-ui/react コア
│   │   └── src/
│   │       ├── components/
│   │       │   ├── AsyncButton/  ← 非同期状態内包ボタン
│   │       │   ├── AutoForm/     ← Zod スキーマからフォーム自動生成
│   │       │   └── DataFetch/    ← データ取得・状態管理
│   │       ├── hooks/
│   │       │   └── useAsyncState.ts
│   │       └── index.ts          ← 公開エントリポイント
│   └── cli/                      ← @stateful-ui/cli
│       └── src/
│           ├── commands/add.ts
│           ├── index.ts
│           └── registry.ts
└── apps/
    └── docs/                     ← Storybook ドキュメント（Phase 4）
```

---

## よく使うコマンド

```bash
# 依存関係インストール
yarn install

# 全パッケージをビルド
yarn build

# 全テストを実行
yarn test

# react パッケージのみテスト（開発中はこちら）
yarn workspace @stateful-ui/react test

# テストをウォッチモードで実行
yarn workspace @stateful-ui/react test:watch

# 型チェック
yarn workspace @stateful-ui/react typecheck

# CLI のローカル動作確認
yarn workspace @stateful-ui/cli build
node packages/cli/dist/index.js add async-button
```

---

## スキル発火条件

| トリガーワード | 動作 |
|--------------|------|
| 「コンポーネントを追加して」 | `.claude/rules/coding-style.md` を参照して実装 |
| 「テストを書いて」 | `.claude/rules/testing.md` を参照して作成 |
| 「計画して」/ 「Plan」 | `.claude/rules/plan-template.md` の形式で計画作成 |
| 「リリースして」 | changeset → build → publish のフローを確認 |

---

## 意思決定の原則

1. **単一責任** — 1コンポーネントは1つの「めんどくさい」だけを解決する
2. **型安全** — `any` は原則禁止。generics で型を伝播させる
3. **透明性** — ブラックボックスにしない。`data-status` 等でデバッグ可能にする
4. **非破壊的** — 既存プロジェクトへの段階的な導入を妨げない
5. **ゼロ摩擦** — CLI で 1 コマンド・30 秒以内に導入できること

---

## 現在のフェーズ

| フェーズ | 状態 | 内容 |
|---------|------|------|
| Phase 0 | ✅ 完了 | モノレポ環境構築 |
| Phase 1 | ✅ 完了 | AsyncButton + useAsyncState |
| Phase 2 | ✅ 完了 | AutoForm（Zod v4 対応） |
| Phase 3 | ✅ 完了 | DataFetch（キャッシュ・リトライ） |
| Phase 4 | 🔲 未着手 | CLI 整備・npm publish・Storybook |
| Phase 5 | 🔲 未着手 | Discriminated Union・パフォーマンス最適化 |

---

## コンテキスト管理（焦ったら止まれ）

- ファイルを読まずにコードを書かない
- テストを省略しない（全テスト通過を確認してから完了とする）
- Plan モードを飛ばさない（3ステップ以上のタスクは必ず計画から）
- コンテキストが残り少ない場合は正直に中断を宣言する
- 中途半端に終わらせるくらいなら止まる
