# セットアップガイド

## 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)にアクセスしてアカウントを作成（またはログイン）
2. 「New Project」をクリック
3. プロジェクト名、データベースパスワード、リージョンを設定
4. プロジェクト作成完了を待つ（数分かかります）

## 2. データベーススキーマの適用

1. Supabaseダッシュボードでプロジェクトを開く
2. 左メニューから「SQL Editor」を選択
3. 「New query」をクリック
4. `supabase/migrations/001_initial_schema.sql` の内容をコピー&ペースト
5. 「Run」ボタンをクリックして実行
6. エラーがなければ成功です

## 3. Storageバケットの作成

1. Supabaseダッシュボードで左メニューから「Storage」を選択
2. 「Create a new bucket」をクリック
3. バケット名: `profile-photos`
4. Public bucket: **ON**（重要！）
5. 「Create bucket」をクリック

### Storage RLSポリシーの設定

Storageバケット作成後、以下のSQLをSQL Editorで実行してください：

```sql
-- ユーザーは自分のフォルダにのみアップロード可能
CREATE POLICY "Users can upload own photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 全員が写真を閲覧可能
CREATE POLICY "Anyone can view photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-photos');

-- ユーザーは自分の写真のみ削除可能
CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

## 4. 環境変数の設定

1. Supabaseダッシュボードで左メニューから「Settings」→「API」を選択
2. 以下の値をコピー：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`（注意：このキーは秘密にしてください）

3. `.env.local` ファイルを開いて、コピーした値を設定：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SESSION_SECRET=your-random-secret-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

**重要**: `SESSION_SECRET`にはランダムな文字列を設定してください（例：`openssl rand -base64 32`で生成）

## 5. 依存関係のインストール

```bash
npm install
```

## 6. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

## トラブルシューティング

### エラー: "Invalid API key"
- `.env.local`のSupabase認証情報が正しいか確認してください
- SupabaseダッシュボードのAPI設定から最新のキーを取得してください

### エラー: "relation does not exist"
- データベーススキーマが正しく適用されているか確認してください
- SQL Editorでテーブルが作成されているか確認してください

### エラー: "Bucket not found"
- Storageバケット `profile-photos` が作成されているか確認してください
- バケット名が正確に `profile-photos` であることを確認してください

### 画像アップロードが失敗する
- StorageバケットがPublicに設定されているか確認してください
- RLSポリシーが正しく設定されているか確認してください

