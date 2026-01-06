# StorageバケットとRLSポリシーのセットアップ

## 1. Storageバケットの作成

1. Supabaseダッシュボードで左メニューから「Storage」を選択
2. 「Create a new bucket」をクリック
3. 以下の設定で作成：
   - **バケット名**: `profile-photos`
   - **Public bucket**: **ON**（重要！これがないと画像が表示されません）
4. 「Create bucket」をクリック

## 2. Storage RLSポリシーの設定

Storageバケット作成後、SQL Editorで以下のSQLを実行してください：

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

**注意**: 既存のポリシーがある場合は、先に削除してください：

```sql
DROP POLICY IF EXISTS "Users can upload own photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own photos" ON storage.objects;
```

