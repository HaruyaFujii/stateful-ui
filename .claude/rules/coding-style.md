# コーディング規約

> 適用タイミング：コンポーネント・フック・ユーティリティを新規作成・編集するとき

---

## TypeScript

- `strict: true` を維持する。`noUncheckedIndexedAccess` / `exactOptionalPropertyTypes` も有効
- `any` は **原則禁止**。やむを得ない場合はコメントで理由を明記
- generics を積極的に使い、型を呼び出し元まで伝播させる
- `unknown` で受け取り、型ガードで絞り込む

```ts
// ✅ Good
function wrap<T>(fn: () => Promise<T>): Promise<T> { ... }

// ❌ Bad
function wrap(fn: () => Promise<any>): Promise<any> { ... }
```

---

## React

- 関数コンポーネント + hooks のみ。クラスコンポーネントは使わない
- `forwardRef` を使う場合は displayName を必ず設定する
- 副作用は `useEffect` に閉じ込め、クリーンアップ関数を返す
- 不要な re-render を防ぐため、状態は可能な限りコンポーネント内に閉じる
- `children` は `React.ReactNode` 型を使う

```tsx
// ✅ Good — 状態を内部に閉じる
export function AsyncButton({ onClick }: Props) {
  const { status, execute } = useAsyncState(); // 内部状態
  ...
}

// ❌ Bad — 親から状態を渡す（責務が漏れる）
export function AsyncButton({ loading, setLoading }: Props) { ... }
```

---

## コンポーネント設計

### ファイル構成

```
ComponentName/
├── index.tsx          ← コンポーネント本体（デフォルトエクスポートしない）
├── types.ts           ← Props・内部型定義（コンポーネントが大きい場合）
├── ComponentName.test.tsx
└── ComponentName.stories.tsx  ← Phase 4 以降
```

### 命名

| 対象 | 規則 | 例 |
|------|------|----|
| コンポーネント | PascalCase | `AsyncButton` |
| フック | camelCase + `use` prefix | `useAsyncState` |
| 型・インターフェース | PascalCase | `AsyncButtonProps` |
| 内部ユーティリティ | camelCase | `inferFieldType` |
| CSS クラス | `behave-` prefix + kebab-case | `behave-async-btn` |

### Props 設計の原則

- 必須 Props は最小限にする（`onClick` のみ必須、他はすべて任意）
- boolean Props は `is-` / `has-` prefix を付けない（`disabled` / `hidden` 等の標準に合わせる）
- コールバックは `on` prefix（`onSuccess` / `onError`）
- render props は `render` prefix（`renderContent` / `renderSubmit`）

---

## スタイリング

- **外部 CSS ライブラリに依存しない**（インラインスタイルまたは `style` タグで注入）
- スタイル注入は `typeof document !== 'undefined'` を確認し SSR-safe にする
- クラス名は `behave-` prefix で名前空間を確保する
- Tailwind CSS を使いたい場合は `fieldConfig` / `className` prop 経由でユーザーに委ねる

---

## エクスポート

- `index.ts` から named export のみ使う（default export は禁止）
- tree-shaking を壊さないため、barrel export は公開 API のみ

```ts
// ✅ Good
export { AsyncButton } from './components/AsyncButton';
export type { AsyncButtonProps } from './components/AsyncButton';

// ❌ Bad
export * from './components/AsyncButton'; // 型まで全部出てしまう
```

---

## コミットメッセージ

```
<type>(<scope>): <summary>

type: feat | fix | test | docs | refactor | chore
scope: react | cli | AsyncButton | AutoForm | DataFetch | useAsyncState

例:
feat(AsyncButton): add renderContent render prop
fix(useAsyncState): prevent stale closure in execute callback
test(DataFetch): add retry count assertion
```
