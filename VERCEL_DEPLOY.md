# Vercelデプロイガイド

このガイドでは、マッチングアプリをVercelにデプロイする手順を説明します。

## 前提条件

1. GitHubアカウント（またはGitLab/Bitbucket）
2. Vercelアカウント（無料で作成可能: https://vercel.com）

## デプロイ手順

### 1. Gitリポジトリの準備

プロジェクトがGitリポジトリになっていない場合、初期化します：

```bash
# Gitリポジトリを初期化（まだの場合）
git init

# すべてのファイルをステージング
git add .

# 初回コミット
git commit -m "Initial commit"
```

### 2. GitHubにリポジトリを作成

1. GitHubにログイン
2. 新しいリポジトリを作成（例: `dating-app-mvp`）
3. リモートリポジトリを追加：

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 3. Vercelにプロジェクトをインポート

1. [Vercel](https://vercel.com)にログイン
2. 「Add New...」→「Project」をクリック
3. GitHubリポジトリを選択
4. プロジェクト設定：
   - **Framework Preset**: Next.js（自動検出されるはず）
   - **Root Directory**: `./`（そのまま）
   - **Build Command**: `npm run build`（デフォルト）
   - **Output Directory**: `.next`（デフォルト）

### 4. 環境変数の設定

Vercelのプロジェクト設定で、以下の環境変数を追加します：

#### 必須の環境変数

```
NEXT_PUBLIC_SUPABASE_URL=https://mscuxylyloerhxzkzven.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zY3V4eWx5bG9lcmh4emt6dmVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2Njg5NDIsImV4cCI6MjA4MzI0NDk0Mn0._ltmL4Nevo0zK2hK8QGAvbddPVHKk33JoGOfSnSSBIo
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zY3V4eWx5bG9lcmh4emt6dmVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzY2ODk0MiwiZXhwIjoyMDgzMjQ0OTQyfQ.ag_Hc7E9jOn_MTLMLMLVBliWV66oXTkYFhyEhwO5jtFbU
SESSION_SECRET=mscuxylyloerhxzkzven
NEXT_PUBLIC_APP_URL=https://YOUR_PROJECT_NAME.vercel.app
NODE_ENV=production
```

**重要**: `NEXT_PUBLIC_APP_URL`は、Vercelがデプロイ後に提供するURLに置き換えてください。

#### 環境変数の設定方法

1. Vercelのプロジェクトページで「Settings」→「Environment Variables」を開く
2. 各環境変数を追加：
   - **Name**: 環境変数名
   - **Value**: 値
   - **Environment**: Production, Preview, Development すべてにチェック

### 5. デプロイの実行

環境変数を設定したら、「Deploy」ボタンをクリックします。

初回デプロイには数分かかります。デプロイが完了すると、以下のようなURLが提供されます：
- `https://YOUR_PROJECT_NAME.vercel.app`

### 6. デプロイ後の確認

1. 提供されたURLにアクセス
2. アプリが正常に動作するか確認
3. ログイン・登録機能をテスト

## トラブルシューティング

### ビルドエラーが発生する場合

1. ローカルでビルドをテスト：
   ```bash
   npm run build
   ```
2. エラーメッセージを確認して修正

### 環境変数が反映されない場合

1. Vercelの環境変数設定を再確認
2. デプロイを再実行（環境変数変更後は再デプロイが必要）

### 画像が表示されない場合

`next.config.js`の`images.remotePatterns`に必要なドメインが追加されているか確認してください。

## カスタムドメインの設定（オプション）

1. Vercelのプロジェクト設定で「Domains」を開く
2. カスタムドメインを追加
3. DNS設定を更新（Vercelの指示に従う）

## 注意事項

- **開発用エンドポイント**: `/api/dev/*`は本番環境では無効化されています
- **セキュリティ**: `SUPABASE_SERVICE_ROLE_KEY`は機密情報です。GitHubにコミットしないでください
- **ストレージ**: Supabase Storageのバケットが正しく設定されているか確認してください

