-- Row Level Security (RLS) ポリシーの設定

-- usersテーブルのRLSを有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- usersテーブルのポリシー
-- 認証済みユーザーは自分のレコードのみ読み取り可能
CREATE POLICY "Users can view own record"
  ON users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- 誰でもユーザーを作成可能（登録時）
CREATE POLICY "Anyone can create user"
  ON users FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 認証済みユーザーは自分のレコードのみ更新可能
CREATE POLICY "Users can update own record"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- profilesテーブルのRLSを有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- profilesテーブルのポリシー
-- すべての認証済みユーザーがアクティブなプロフィールを閲覧可能
CREATE POLICY "Anyone can view active profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_active = TRUE AND is_profile_complete = TRUE);

-- 認証済みユーザーは自分のプロフィールを閲覧可能（完成していなくても）
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 認証済みユーザーは自分のプロフィールを作成・更新可能
CREATE POLICY "Users can manage own profile"
  ON profiles FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- swipesテーブルのRLSを有効化
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;

-- swipesテーブルのポリシー
-- 認証済みユーザーは自分が送ったスワイプのみ閲覧可能
CREATE POLICY "Users can view own swipes"
  ON swipes FOR SELECT
  TO authenticated
  USING (from_user_id = auth.uid());

-- 認証済みユーザーは自分からのスワイプのみ作成可能
CREATE POLICY "Users can create own swipes"
  ON swipes FOR INSERT
  TO authenticated
  WITH CHECK (from_user_id = auth.uid());

-- matchesテーブルのRLSを有効化
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- matchesテーブルのポリシー
-- 認証済みユーザーは自分が関わるマッチングのみ閲覧可能
CREATE POLICY "Users can view own matches"
  ON matches FOR SELECT
  TO authenticated
  USING (user1_id = auth.uid() OR user2_id = auth.uid());

-- messagesテーブルのRLSを有効化
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- messagesテーブルのポリシー
-- 認証済みユーザーは自分が関わるマッチングのメッセージのみ閲覧可能
CREATE POLICY "Users can view messages in own matches"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = match_id
        AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
  );

-- 認証済みユーザーは自分が関わるマッチングにのみメッセージ送信可能
CREATE POLICY "Users can send messages in own matches"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = match_id
        AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
  );

-- 認証済みユーザーは受信したメッセージを既読化可能
CREATE POLICY "Users can update received messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (
    sender_id != auth.uid()
    AND EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = match_id
        AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
  );

