# プッシュエラー修正方法

## エラー内容
```
remote: Permission to Keyron-info/dating-app-mvp.git denied to nittaeito.
fatal: unable to access 'https://github.com/Keyron-info/dating-app-mvp.git/': The requested URL returned error: 403
```

## 原因
現在のGit設定が個人用アカウント（nittaeito）になっているため、会社用アカウント（Keyron-info）のリポジトリにアクセスできません。

## 解決方法

### 方法1: Personal Access Tokenを使用（推奨）

1. **会社用GitHubアカウント（info@keyron-dx.jp）でログイン**
2. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
3. 「Generate new token (classic)」をクリック
4. 設定：
   - **Note**: `Vercel Deployment Token`（任意の名前）
   - **Expiration**: お好みの期間（90日、1年など）
   - **Select scopes**: `repo` にチェック（すべてのリポジトリへのアクセス）
5. 「Generate token」をクリック
6. **トークンをコピー**（一度しか表示されないので注意！）

7. **リモートURLにトークンを含める**：
```bash
# トークンを含むURL形式
git remote set-url origin https://YOUR_TOKEN@github.com/Keyron-info/dating-app-mvp.git

# または、プッシュ時に認証情報を入力
git push -u origin main
# Username: Keyron-info（または会社用アカウントのユーザー名）
# Password: （トークンを貼り付け）
```

### 方法2: Git認証情報をクリアして再認証

```bash
# macOSのキーチェーンから認証情報を削除
git credential-osxkeychain erase
host=github.com
protocol=https
# （Enterを2回押す）

# または、キーチェーンアクセスアプリから手動で削除
# アプリケーション → ユーティリティ → キーチェーンアクセス
# 「github.com」を検索して削除

# その後、プッシュ時に会社用アカウントで認証
git push -u origin main
```

### 方法3: SSH鍵を使用

```bash
# SSH URLに変更
git remote set-url origin git@github.com:Keyron-info/dating-app-mvp.git

# SSH鍵を会社用アカウントに追加
# 1. SSH鍵を生成（まだの場合）
ssh-keygen -t ed25519 -C "info@keyron-dx.jp"

# 2. 公開鍵をコピー
cat ~/.ssh/id_ed25519.pub

# 3. GitHub → Settings → SSH and GPG keys → New SSH key
# 4. 公開鍵を貼り付けて保存

# 5. プッシュ
git push -u origin main
```

## 推奨手順

**方法1（Personal Access Token）が最も簡単です。**

1. トークンを生成
2. 以下のコマンドでプッシュ：
```bash
git push -u origin main
```
3. 認証情報を求められたら：
   - Username: `Keyron-info`（または会社用アカウントのユーザー名）
   - Password: `生成したトークン`（パスワードではなくトークンを貼り付け）

