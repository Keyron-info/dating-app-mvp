-- ユーザー認証情報テーブル
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- プロフィールテーブル
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  nickname VARCHAR(20) NOT NULL,
  birthdate DATE NOT NULL,
  age INT,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  interested_in TEXT[] NOT NULL,
  bio TEXT,
  photo_urls TEXT[] DEFAULT '{}',
  is_profile_complete BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT check_nickname_length CHECK (char_length(nickname) BETWEEN 2 AND 20),
  CONSTRAINT check_age CHECK (age >= 18),
  CONSTRAINT check_interested_in_not_empty CHECK (array_length(interested_in, 1) > 0),
  CONSTRAINT check_bio_length CHECK (char_length(COALESCE(bio, '')) <= 500),
  CONSTRAINT check_photo_urls_count CHECK (array_length(photo_urls, 1) BETWEEN 1 AND 3)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON profiles(gender);
CREATE INDEX IF NOT EXISTS idx_profiles_age ON profiles(age);
CREATE INDEX IF NOT EXISTS idx_profiles_interested_in ON profiles USING GIN(interested_in);
CREATE INDEX IF NOT EXISTS idx_profiles_active ON profiles(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_profiles_complete ON profiles(is_profile_complete) WHERE is_profile_complete = TRUE;

-- スワイプ履歴テーブル
CREATE TABLE IF NOT EXISTS swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(10) NOT NULL CHECK (action IN ('like', 'skip')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_swipe UNIQUE (from_user_id, to_user_id),
  CONSTRAINT check_not_self_swipe CHECK (from_user_id != to_user_id)
);

CREATE INDEX IF NOT EXISTS idx_swipes_from_user ON swipes(from_user_id, action);
CREATE INDEX IF NOT EXISTS idx_swipes_to_user ON swipes(to_user_id, action);
CREATE INDEX IF NOT EXISTS idx_swipes_created_at ON swipes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_swipes_mutual_like ON swipes(from_user_id, to_user_id, action) 
  WHERE action = 'like';

-- マッチングテーブル
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT check_user_order CHECK (user1_id < user2_id),
  CONSTRAINT unique_match UNIQUE (user1_id, user2_id)
);

CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches(user1_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches(user2_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_matches_users ON matches(user1_id, user2_id);

-- メッセージテーブル
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT check_content_not_empty CHECK (char_length(trim(content)) > 0),
  CONSTRAINT check_content_length CHECK (char_length(content) <= 1000)
);

CREATE INDEX IF NOT EXISTS idx_messages_match ON messages(match_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(match_id, read_at) WHERE read_at IS NULL;

-- updated_at自動更新関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガー作成（既存の場合は削除してから作成）
DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;
CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- プロフィール更新時にageとis_profile_completeを自動計算する関数
CREATE OR REPLACE FUNCTION update_profile_derived_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- ageを計算
  NEW.age = EXTRACT(YEAR FROM AGE(CURRENT_DATE, NEW.birthdate))::INT;
  
  -- is_profile_completeを計算
  NEW.is_profile_complete = (
    NEW.nickname IS NOT NULL 
    AND NEW.birthdate IS NOT NULL 
    AND NEW.gender IS NOT NULL 
    AND array_length(NEW.interested_in, 1) > 0
    AND array_length(NEW.photo_urls, 1) >= 1
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- プロフィールのINSERT/UPDATE時に自動計算
DROP TRIGGER IF EXISTS trigger_update_profile_derived ON profiles;
CREATE TRIGGER trigger_update_profile_derived
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_derived_fields();

-- マッチング自動作成トリガー
CREATE OR REPLACE FUNCTION create_match_on_mutual_like()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.action = 'like' THEN
    IF EXISTS (
      SELECT 1 FROM swipes
      WHERE from_user_id = NEW.to_user_id
        AND to_user_id = NEW.from_user_id
        AND action = 'like'
    ) THEN
      INSERT INTO matches (user1_id, user2_id)
      VALUES (
        LEAST(NEW.from_user_id, NEW.to_user_id),
        GREATEST(NEW.from_user_id, NEW.to_user_id)
      )
      ON CONFLICT (user1_id, user2_id) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_match ON swipes;
CREATE TRIGGER trigger_create_match
  AFTER INSERT ON swipes
  FOR EACH ROW
  EXECUTE FUNCTION create_match_on_mutual_like();

