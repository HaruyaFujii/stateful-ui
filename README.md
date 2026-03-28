# behave-ui

**Behavior-first React components.**
Async state, forms, and data fetching — batteries included.

> "1つの『めんどくさい』を完璧に潰す"

---

## 目次

- [コンセプト](#コンセプト)
- [コンポーネント一覧](#コンポーネント一覧)
- [インストール](#インストール)
- [使い方](#使い方)
- [開発者向けセットアップ](#開発者向けセットアップ)
- [設計原則](#設計原則)
- [ライセンス](#ライセンス)

---

## コンセプト

ほとんどの UI ライブラリは「見た目」で止まっています。あなたはまだこれを毎回書いていませんか？

```tsx
// ❌ 毎回書くボイラープレート
const [loading, setLoading] = useState(false);
const [error, setError] = useState<Error | null>(null);

async function handleClick() {
  setLoading(true);
  try {
    await api.submit(data);
  } catch (e) {
    setError(e as Error);
  } finally {
    setLoading(false);
  }
}
```

**behave-ui** はこれを「振る舞い込みコンポーネント」として提供します。

```tsx
// ✅ behave-ui
<AsyncButton onClick={() => api.submit(data)} loadingText="送信中...">
  送信する
</AsyncButton>
```

---

## コンポーネント一覧

| コンポーネント | 解決する問題 |
|---|---|
| `<AsyncButton />` | pending / success / error 状態を自動管理するボタン |
| `<AutoForm />` | Zod スキーマから完全なフォーム UI を自動生成 |
| `<DataFetch />` | loading / error / empty / data を 1 タグで管理 |
| `useAsyncState` | 上記のコアとなる非同期状態フック |

---

## インストール

### Option A — コピペ方式（推奨）

コードをプロジェクトにコピーします。依存関係ゼロ。コードを完全に制御できます。

```bash
yarn dlx @behave-ui/cli add async-button
yarn dlx @behave-ui/cli add auto-form
yarn dlx @behave-ui/cli add data-fetch

# 全部まとめて
yarn dlx @behave-ui/cli add async-button auto-form data-fetch

# 一覧を確認
yarn dlx @behave-ui/cli list
```

ファイルは `src/components/ui/<ComponentName>/` に追加されます。

### Option B — npm パッケージ

```bash
yarn add @behave-ui/react
```

---

## 使い方

### AsyncButton

```tsx
import { AsyncButton } from '@behave-ui/react';

<AsyncButton
  onClick={async () => await api.submitForm(data)}
  loadingText="送信中..."
  successText="完了！"
  errorText="失敗しました"
  onSuccess={() => router.push('/done')}
  onError={(err) => toast.error(err.message)}
>
  送信する
</AsyncButton>
```

**状態機械**

```
idle ──(click)──► pending ──(resolve)──► success ──(resetDelay)──► idle
                      └───(reject)───► error ─────(click)──────► idle
```

**主な Props**

| Prop | 型 | デフォルト | 説明 |
|------|----|-----------|------|
| `onClick` | `() => Promise<T>` | **必須** | 実行する非同期関数 |
| `loadingText` | `string` | — | pending 時のラベル |
| `successText` | `string` | — | success 時のラベル |
| `errorText` | `string` | — | error 時のラベル |
| `onSuccess` | `(data: T) => void` | — | 成功時コールバック |
| `onError` | `(err: Error) => void` | — | エラー時コールバック |
| `resetDelay` | `number` | `2000` | success 後 idle に戻るまでの ms。`0` で無効 |
| `renderContent` | `(status) => ReactNode` | — | 状態に応じた完全カスタムレンダリング |

---

### AutoForm

```tsx
import { z } from 'zod';
import { AutoForm } from '@behave-ui/react';

const schema = z.object({
  name:  z.string().min(1, '必須項目です'),
  email: z.string().email(),
  role:  z.enum(['admin', 'user', 'viewer']),
  bio:   z.string().optional(),
});

<AutoForm
  schema={schema}
  onSubmit={async (values) => await api.createUser(values)}
  fieldConfig={{
    bio:  { label: '自己紹介', type: 'textarea' },
    role: { label: '権限', type: 'radio-group' },
  }}
/>
```

**フィールド自動マッピング**

| Zod の型 | デフォルト UI | `type` で変更可能 |
|---------|-------------|-----------------|
| `z.string()` | `<input type="text">` | `textarea`, `password`, `url`, `email` |
| `z.number()` | `<input type="number">` | `range` |
| `z.boolean()` | `<input type="checkbox">` | `toggle` |
| `z.enum()` | `<select>` | `radio-group` |
| `z.date()` | `<input type="date">` | `datetime-local` |

---

### DataFetch

```tsx
import { DataFetch } from '@behave-ui/react';

<DataFetch
  queryKey={['user', userId]}
  queryFn={() => api.getUser(userId)}
  loadingFallback={<UserSkeleton />}
  errorFallback={({ error, retry }) => (
    <div>
      <p>{error.message}</p>
      <button onClick={retry}>再試行</button>
    </div>
  )}
  emptyFallback={<p>ユーザーが見つかりません。</p>}
>
  {(user) => <UserCard user={user} />}
</DataFetch>
```

**主な Props**

| Prop | 型 | デフォルト | 説明 |
|------|----|-----------|------|
| `queryKey` | `readonly unknown[]` | **必須** | キャッシュキー |
| `queryFn` | `() => Promise<T>` | **必須** | データ取得関数 |
| `children` | `(data: NonNullable<T>) => ReactNode` | **必須** | 成功時レンダー関数 |
| `loadingFallback` | `ReactNode` | 内蔵スケルトン | ローディング中の UI |
| `errorFallback` | `({ error, retry }) => ReactNode` | 内蔵エラー表示 | エラー時の UI |
| `emptyFallback` | `ReactNode` | — | データが空の時の UI |
| `staleTime` | `number` | `60000` | キャッシュ有効期間（ms） |
| `retry` | `number \| false` | `3` | 自動リトライ回数 |

---

### useAsyncState（フック）

AsyncButton のコア。ボタン UI なしで非同期状態管理だけが欲しい場合に使用。

```tsx
import { useAsyncState } from '@behave-ui/react';

const { execute, isPending, isSuccess, isError, error, reset } = useAsyncState({
  onSuccess: () => toast.success('完了！'),
  onError: (err) => toast.error(err.message),
  resetDelay: 3000,
});

<button onClick={() => execute(() => uploadFile(file))} disabled={isPending}>
  {isPending ? 'アップロード中...' : 'アップロード'}
</button>
```

---

## 開発者向けセットアップ

### 必要な環境

| ツール | バージョン |
|--------|----------|
| Node.js | 20 以上（LTS 推奨） |
| yarn | 4.x（Corepack で自動管理） |

### セットアップ手順

```bash
# 1. クローン
git clone https://github.com/your-org/behave-ui.git
cd behave-ui

# 2. Corepack を有効化（初回のみ）
#    Node.js に標準付属。package.json の "packageManager" を読んで
#    正しいバージョンの yarn を自動的に使ってくれる。
corepack enable

# 3. 依存関係インストール
yarn install

# 4. ビルド確認
yarn build
```

---

### テストの実行

```bash
# ── 全テスト ──────────────────────────────────────

# 全パッケージのテストを一括実行
yarn test

# react パッケージのみ（開発中はこちらが速い）
yarn workspace @behave-ui/react test

# ウォッチモード（保存時に自動実行）
yarn workspace @behave-ui/react test:watch

# カバレッジレポート付き
yarn workspace @behave-ui/react test:coverage


# ── 絞り込み ──────────────────────────────────────

# コンポーネント単位で実行
yarn workspace @behave-ui/react test src/components/AsyncButton
yarn workspace @behave-ui/react test src/components/AutoForm
yarn workspace @behave-ui/react test src/components/DataFetch
yarn workspace @behave-ui/react test src/hooks

# テスト名でフィルタ
yarn workspace @behave-ui/react test -t "shows loadingText"

# 特定ファイルのみ
yarn workspace @behave-ui/react test src/components/AsyncButton/AsyncButton.test.tsx
```

**テスト一覧**

| ファイル | テスト数 | カバー範囲 |
|---------|---------|-----------|
| `useAsyncState.test.ts` | 9本 | 状態遷移・リトライ防止・コールバック |
| `AsyncButton.test.tsx` | 15本 | 4状態・二重送信防止・アクセシビリティ |
| `AutoForm.test.tsx` | 22本 | フィールド推論・バリデーション・アクセシビリティ |
| `DataFetch.test.tsx` | 15本 | loading/success/empty/error・キャッシュ・リトライ |
| **合計** | **61本** | |

---

### ビルド

```bash
# 全パッケージ（ESM + CJS デュアル出力）
yarn build

# react パッケージのみ
yarn workspace @behave-ui/react build

# CLI パッケージのみ
yarn workspace @behave-ui/cli build

# 型チェックのみ（ビルドなし）
yarn workspace @behave-ui/react typecheck

# CLI のローカル動作確認
yarn workspace @behave-ui/cli build
node packages/cli/dist/index.js list
node packages/cli/dist/index.js add async-button --out-dir ./test-output
```

---

### ディレクトリ構造

```
behave-ui/
├── CLAUDE.md                     # Claude Code 向けプロジェクト設定
├── README.md                     # このファイル
├── package.json                  # yarn workspaces ルート
├── .yarnrc.yml                   # yarn berry 設定
├── tsconfig.base.json            # 共有 TypeScript 設定
├── .changeset/                   # バージョン管理（changesets）
├── .github/workflows/ci.yml      # CI（テスト・型チェック・publish）
│
├── .claude/
│   └── rules/
│       ├── coding-style.md       # TypeScript / React コーディング規約
│       ├── testing.md            # テスト戦略・タイマーの注意点
│       └── plan-template.md      # Plan モードのテンプレート
│
├── packages/
│   ├── react/                    # @behave-ui/react
│   │   └── src/
│   │       ├── index.ts          # 公開エントリポイント
│   │       ├── hooks/
│   │       │   ├── useAsyncState.ts
│   │       │   └── useAsyncState.test.ts
│   │       └── components/
│   │           ├── AsyncButton/
│   │           ├── AutoForm/
│   │           └── DataFetch/
│   └── cli/                      # @behave-ui/cli
│       └── src/
│           ├── index.ts
│           ├── registry.ts
│           └── commands/add.ts
└── apps/                        # （Phase 4 で追加予定）
    └── docs/                     # Storybook（未実装）
```

---

## 設計原則

1. **振る舞いファースト** — コンポーネントは見た目ではなく状態機械を内包する
2. **ゼロマジック** — `data-status` 属性で内部状態を常に可視化・デバッグ可能にする
3. **型安全** — generics で型を伝播。`onSuccess` はデータの型を知っている
4. **非破壊的導入** — グローバルプロバイダー不要。1コンポーネントから段階的に導入できる
5. **1問題1解決** — デザインシステム化しない。汎用化の罠を避ける

---

## ロードマップ

| フェーズ | 状態 | 内容 |
|---------|------|------|
| Phase 0 | ✅ 完了 | モノレポ環境構築 |
| Phase 1 | ✅ 完了 | AsyncButton + useAsyncState |
| Phase 2 | ✅ 完了 | AutoForm（Zod v4 対応） |
| Phase 3 | ✅ 完了 | DataFetch（キャッシュ・リトライ） |
| Phase 4 | 🟡 進行中 | ~~CLI 整備~~・npm publish・Storybook |
| Phase 5 | 🔲 未着手 | Discriminated Union・パフォーマンス最適化 |

---

## ライセンス

MIT
