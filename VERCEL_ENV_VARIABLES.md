# Vercel環境変数設定ガイド

## 設定手順

1. Vercelのプロジェクトページを開く
2. **Settings** → **Environment Variables** を開く
3. 以下の環境変数を1つずつ追加
4. 各環境変数で **Production、Preview、Development** すべてにチェックを入れる

## 環境変数一覧

### 1. NEXT_PUBLIC_SUPABASE_URL
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://mscuxylyloerhxzkzven.supabase.co
Environment: ✅ Production, ✅ Preview, ✅ Development
```

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zY3V4eWx5bG9lcmh4emt6dmVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2Njg5NDIsImV4cCI6MjA4MzI0NDk0Mn0._ltmL4Nevo0zK2hK8QGAvbddPVHKk33JoGOfSnSSBIo
Environment: ✅ Production, ✅ Preview, ✅ Development
```

### 3. SUPABASE_SERVICE_ROLE_KEY
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zY3V4eWx5bG9lcmh4emt6dmVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzY2ODk0MiwiZXhwIjoyMDgzMjQ0OTQyfQ.ag_Hc7E9jOn_MTLMLMLVBliWV66oXTkYFhyEhwO5jtFbU
Environment: ✅ Production, ✅ Preview, ✅ Development
```

### 4. SESSION_SECRET
```
Name: SESSION_SECRET
Value: mscuxylyloerhxzkzven
Environment: ✅ Production, ✅ Preview, ✅ Development
```

### 5. NEXT_PUBLIC_APP_URL
```
Name: NEXT_PUBLIC_APP_URL
Value: https://YOUR_PROJECT_NAME.vercel.app
Environment: ✅ Production, ✅ Preview, ✅ Development
```
**⚠️ 重要**: `YOUR_PROJECT_NAME`を実際のVercelプロジェクト名に置き換えてください。
デプロイ後にVercelが提供するURLを使用します（例: `https://dating-app-mvp.vercel.app`）

### 6. NODE_ENV
```
Name: NODE_ENV
Value: production
Environment: ✅ Production, ✅ Preview, ✅ Development
```

## クイックコピー用（一括設定）

Vercelの環境変数設定画面で、以下の形式でコピー&ペーストできます：

```
NEXT_PUBLIC_SUPABASE_URL=https://mscuxylyloerhxzkzven.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zY3V4eWx5bG9lcmh4emt6dmVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2Njg5NDIsImV4cCI6MjA4MzI0NDk0Mn0._ltmL4Nevo0zK2hK8QGAvbddPVHKk33JoGOfSnSSBIo
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zY3V4eWx5bG9lcmh4emt6dmVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzY2ODk0MiwiZXhwIjoyMDgzMjQ0OTQyfQ.ag_Hc7E9jOn_MTLMLMLVBliWV66oXTkYFhyEhwO5jtFbU
SESSION_SECRET=mscuxylyloerhxzkzven
NEXT_PUBLIC_APP_URL=https://YOUR_PROJECT_NAME.vercel.app
NODE_ENV=production
```

## 注意事項

1. **NEXT_PUBLIC_APP_URL**: 初回デプロイ後にVercelが提供するURLに置き換えてください
2. **SUPABASE_SERVICE_ROLE_KEY**: 機密情報です。GitHubにコミットしないでください
3. **環境変数の変更後**: 必ず「Redeploy」を実行して再デプロイしてください

## 設定後の確認

環境変数を設定したら：
1. すべての環境変数が正しく設定されているか確認
2. 「Redeploy」ボタンをクリックして再デプロイ
3. デプロイが完了したら、提供されたURLでアプリが正常に動作するか確認

