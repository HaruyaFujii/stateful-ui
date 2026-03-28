# Plan モード テンプレート

> 適用タイミング：「計画して」「Plan」とトリガーされたとき、または 3 ステップ以上のタスクを開始するとき

---

## 必須セクション

| # | セクション | 形式 |
|---|-----------|------|
| 1 | なぜやるか | 散文（3行以内） |
| 2 | 何を変えるか | テーブル（ファイル・変更内容） |
| 3 | どう実装するか | 番号付きリスト（ステップ順） |
| 4 | 検証方法 | チェックリスト |
| 5 | リスク・注意点 | 箇条書き |

---

## テンプレート

```markdown
## 計画：<タスクの一言要約>

### 1. なぜやるか
<解決したい問題・背景を3行以内で>

### 2. 何を変えるか

| ファイル | 変更内容 | 種別 |
|---------|---------|------|
| `packages/react/src/components/XXX/index.tsx` | XXX を追加 | 新規 / 修正 / 削除 |

### 3. どう実装するか

1. <ステップ1>
2. <ステップ2>
3. <ステップ3>

### 4. 検証方法

- [ ] `yarn workspace @behave-ui/react test` が全件通過する
- [ ] `yarn workspace @behave-ui/react typecheck` がエラーなし
- [ ] <機能固有の検証項目>

### 5. リスク・注意点

- <破壊的変更の有無>
- <パフォーマンスへの影響>
- <既存テストへの影響>
```

---

## 記入例（AutoForm に条件付きフィールドを追加する場合）

```markdown
## 計画：AutoForm に Discriminated Union 対応を追加

### 1. なぜやるか
z.discriminatedUnion() を渡したとき、選択値に応じてフィールドを動的に切替できない。
管理画面で「個人 / 法人」を切り替えるユースケースが未対応。

### 2. 何を変えるか

| ファイル | 変更内容 | 種別 |
|---------|---------|------|
| `schema-utils.ts` | `extractDiscriminatedFields()` 関数を追加 | 修正 |
| `index.tsx` | discriminator フィールドの watch と動的フィールド切替を実装 | 修正 |
| `AutoForm.test.tsx` | Discriminated Union のテストケースを追加 | 修正 |

### 3. どう実装するか

1. `schema-utils.ts` に `isDiscriminatedUnion()` 型ガードを追加
2. discriminator キーと各 option のスキーマを抽出するヘルパーを実装
3. `AutoForm` 内で `form.watch(discriminatorKey)` を使い選択値を監視
4. 選択値に対応するスキーマのフィールドのみをレンダリング
5. テストを追加し全件通過を確認

### 4. 検証方法

- [ ] `yarn workspace @behave-ui/react test` 全件通過
- [ ] `yarn workspace @behave-ui/react typecheck` エラーなし
- [ ] discriminator の初期値変更でフィールドが切り替わること
- [ ] 切り替え前後でバリデーションが正しく動くこと

### 5. リスク・注意点

- `z.discriminatedUnion()` は Zod v3.22+ が必要
- 既存の `z.object()` のテストに影響しないこと
- `useWatch` の追加で re-render が増える可能性があるため、局所的に使う
```
