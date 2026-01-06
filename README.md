# Dating App MVP

Tinder/タップル/東カレデート風のスワイプ型マッチングアプリのMVP（最小実行可能製品）

## 🎉 実装完了

以下の機能が実装されています：

- ✅ ユーザー認証（メール + パスワード、セッション管理）
- ✅ プロフィール作成・編集（写真アップロード含む）
- ✅ 性別に基づくユーザーフィルタリング
- ✅ スワイプ型マッチング機能（ドラッグ&ドロップ対応）
- ✅ 相互いいねによるマッチング
- ✅ マッチング後のチャット機能（リアルタイム更新）
- ✅ レスポンシブデザイン
- ✅ 画像圧縮・最適化
- ✅ エラーハンドリング
- ✅ 利用規約・プライバシーポリシー

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local.example`をコピーして`.env.local`を作成し、必要な値を設定してください。

```bash
cp .env.local.example .env.local
```

`.env.local`に以下を設定：
- `NEXT_PUBLIC_SUPABASE_URL` - SupabaseプロジェクトURL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase匿名キー
- `SUPABASE_SERVICE_ROLE_KEY` - Supabaseサービスロールキー
- `SESSION_SECRET` - セッション暗号化キー（任意の文字列）
- `NEXT_PUBLIC_APP_URL` - アプリのURL（開発時は http://localhost:3000）

### 3. Supabaseのセットアップ

#### データベーススキーマの適用

1. Supabaseダッシュボードを開く
2. SQL Editorに移動
3. `supabase/migrations/001_initial_schema.sql` の内容を実行

#### Storageバケットの作成

1. Supabaseダッシュボード > Storage
2. 新しいバケット作成: `profile-photos`
3. Public設定: `ON`
4. RLSポリシー設定（`02_DATABASE_DESIGN.md`参照）

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

## ドキュメント

詳細な要件定義や設計書は、`/Users/nittaeito/Downloads/files/` ディレクトリを参照してください。

- `01_REQUIREMENTS.md` - 要件定義書
- `02_DATABASE_DESIGN.md` - データベース設計書
- `03_API_DESIGN.md` - API設計書
- `04_UI_DESIGN.md` - UI設計書
- `05_TECHNICAL_SPEC.md` - 技術仕様書
- `06_IMPLEMENTATION_CHECKLIST.md` - 実装チェックリスト

## プロジェクト構成

```
dating-app-mvp/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 認証画面
│   ├── (main)/            # メイン機能
│   │   └── app/
│   │       ├── swipe/     # スワイプ画面
│   │       ├── matches/   # マッチング一覧
│   │       ├── profile/   # マイページ
│   │       └── chat/      # チャット画面
│   ├── api/               # APIルート
│   └── profile/           # プロフィール作成・編集
├── components/            # Reactコンポーネント
│   ├── auth/              # 認証関連
│   ├── profile/           # プロフィール関連
│   ├── swipe/             # スワイプ関連
│   ├── match/              # マッチング関連
│   ├── chat/               # チャット関連
│   └── layout/             # レイアウト関連
├── lib/                   # ユーティリティ
│   ├── supabase/          # Supabaseクライアント
│   ├── auth/              # 認証関連
│   ├── validation/        # バリデーション
│   └── utils/             # その他ユーティリティ
├── types/                 # TypeScript型定義
└── supabase/              # Supabaseスキーマ
    └── migrations/        # マイグレーションファイル
```

## 主要機能

### 認証機能
- メールアドレス + パスワードでの登録・ログイン
- セッション管理（JWT、HTTPOnly Cookie）
- パスワードハッシュ化（bcrypt）

### プロフィール機能
- プロフィール作成・編集
- 写真アップロード（1-3枚、自動圧縮）
- ドラッグ&ドロップ対応

### スワイプ機能
- 候補ユーザーの表示
- スワイプ操作（ドラッグ&ドロップ、ボタン）
- いいね/スキップ
- マッチング成立時のモーダル表示

### チャット機能
- リアルタイムメッセージ送受信（Supabase Realtime）
- メッセージ一覧表示
- 未読数表示

## 技術スタック

- **Framework**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: TailwindCSS
- **アニメーション**: Framer Motion
- **フォーム**: React Hook Form + Zod
- **画像処理**: browser-image-compression
- **BaaS**: Supabase (Database, Auth, Storage, Realtime)
- **認証**: Cookie-based Session (JWT)

