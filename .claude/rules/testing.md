# テスト戦略・規約

> 適用タイミング：テストを新規作成・修正するとき、テストが落ちたとき

---

## スタック

| ツール | 用途 |
|--------|------|
| Vitest | テストランナー（Jest 互換 API） |
| @testing-library/react | React コンポーネントのレンダリング・操作 |
| @testing-library/jest-dom | カスタムマッチャー（`toBeInTheDocument` 等） |
| jsdom | ブラウザ環境のエミュレーション |

---

## 実行コマンド

```bash
# react パッケージの全テストを実行
yarn workspace @behave-ui/react test

# ウォッチモード（開発中はこちら）
yarn workspace @behave-ui/react test:watch

# カバレッジレポート付き
yarn workspace @behave-ui/react test:coverage

# 特定のファイルのみ実行
yarn workspace @behave-ui/react test src/components/AsyncButton/AsyncButton.test.tsx

# 特定のテスト名にマッチするものだけ実行（-t オプション）
yarn workspace @behave-ui/react test -t "shows loadingText"

# 全パッケージのテストを一括実行
yarn test
```

---

## ファイル配置

- テストファイルはコンポーネントと同じディレクトリに置く（`__tests__` フォルダは使わない）
- ファイル名: `<ComponentName>.test.tsx` / `<hookName>.test.ts`

```
AsyncButton/
├── index.tsx
└── AsyncButton.test.tsx   ← ここ
```

---

## タイマー・非同期のルール

### ⚠️ `vi.useFakeTimers()` と `waitFor()` は共存できない

`waitFor` は内部でポーリングするが、fake timer 環境ではそのポーリングが止まる。
**AsyncButton / DataFetch のテストではグローバルな fake timer を使わない。**

```ts
// ❌ Bad — waitFor がタイムアウトする
beforeEach(() => vi.useFakeTimers());

it('shows loadingText', async () => {
  fireEvent.click(button);
  await waitFor(() => expect(screen.getByText('Loading...')).toBeInTheDocument()); // タイムアウト
});
```

```ts
// ✅ Good — fake timer を使わず実 Promise を使う
it('shows loadingText', async () => {
  let resolve!: () => void;
  const promise = new Promise<void>((res) => { resolve = res; });

  render(<AsyncButton onClick={() => promise} loadingText="Loading...">Submit</AsyncButton>);
  fireEvent.click(screen.getByRole('button'));

  await waitFor(() => expect(screen.getByText('Loading...')).toBeInTheDocument());
  await act(async () => { resolve(); await promise; });
});
```

### `resetDelay` など setTimeout のみをテストする場合

`shouldAdvanceTime: true` オプション付きで局所的に fake timer を使う。

```ts
it('auto-resets after resetDelay', async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true }); // 実 Promise + fake setTimeout

  render(<AsyncButton onClick={() => Promise.resolve()} resetDelay={500}>Submit</AsyncButton>);
  fireEvent.click(screen.getByRole('button'));
  await waitFor(() => expect(screen.getByRole('button')).toHaveAttribute('data-status', 'success'));

  act(() => vi.advanceTimersByTime(500));
  await waitFor(() => expect(screen.getByRole('button')).toHaveAttribute('data-status', 'idle'));

  vi.useRealTimers();
});
```

### `useAsyncState` フックのみのテスト

フックは `renderHook` を使い、fake timer + `act` で制御してよい（`waitFor` を使わないため）。

```ts
beforeEach(() => vi.useFakeTimers());
afterEach(() => { vi.runAllTimers(); vi.useRealTimers(); });

it('auto-resets to idle', async () => {
  const { result } = renderHook(() => useAsyncState({ resetDelay: 1000 }));
  await act(async () => { await result.current.execute(() => Promise.resolve('ok')); });
  act(() => vi.advanceTimersByTime(1000));
  expect(result.current.status).toBe('idle');
});
```

---

## テスト構成のパターン

### describe の分け方

```ts
describe('ComponentName — loading state', () => { ... });
describe('ComponentName — success state', () => { ... });
describe('ComponentName — error state', () => { ... });
describe('ComponentName — accessibility', () => { ... });
```

### 1テスト1アサーション原則

複数の状態を1テストで検証しない。テストが落ちたとき何が壊れたかすぐわかるようにする。

```ts
// ✅ Good
it('disables the button while pending', async () => { ... });
it('sets aria-busy="true" while pending', async () => { ... });

// ❌ Bad — 落ちた理由がわかりにくい
it('handles pending state correctly', async () => {
  expect(button).toBeDisabled();
  expect(button).toHaveAttribute('aria-busy', 'true');
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});
```

---

## アクセシビリティのチェック項目

新しいコンポーネントを作ったら以下を必ずテストする。

- [ ] エラーメッセージに `role="alert"` が付いているか
- [ ] ローディング中に `aria-busy="true"` が付いているか
- [ ] 入力要素に `aria-describedby` でエラーメッセージが紐づいているか
- [ ] ボタンが disabled 中に `aria-required` が適切か
- [ ] スクリーンリーダー向けの `aria-label` / `aria-labelledby` があるか

---

## カバレッジ目標

| 対象 | 目標 |
|------|------|
| フック（`useAsyncState` / `useDataFetch`） | 90% 以上 |
| コンポーネント（状態遷移） | 全 4 状態をカバー |
| エラーパス | 全エラー分岐をカバー |
| ハッピーパス | 必ずカバー |

ストーリーファイル（`.stories.tsx`）はカバレッジ計測から除外する。
