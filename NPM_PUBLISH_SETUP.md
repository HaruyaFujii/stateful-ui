# NPM Publish セットアップガイド

## 必要な設定

npm publishを有効にするには、GitHub Secretsに`NPM_TOKEN`を設定する必要があります。

### 手順

1. **npm アカウントでトークンを作成**
   ```bash
   npm login
   npm token create --read-only=false
   ```

2. **GitHub にシークレットを追加**
   - リポジトリの Settings → Secrets and variables → Actions
   - `New repository secret` をクリック
   - Name: `NPM_TOKEN`
   - Value: npm で作成したトークン

3. **動作確認**
   - mainブランチへのpushで自動的にpublishが実行されます
   - `.changeset/` にchangesetファイルが必要です

## 現在の設定状況

- ✅ パッケージ名変更完了: `@stateful-ui/react`, `@stateful-ui/cli`
- ✅ ビルドプロセス設定済み
- ✅ CI/CDワークフロー設定済み
- ⚠️ **NPM_TOKEN未設定** - 上記手順で設定してください

## Changeset の使い方

```bash
# 変更を記録
yarn changeset

# バージョンを更新
yarn changeset version

# publish（CI で自動実行）
yarn changeset publish
```