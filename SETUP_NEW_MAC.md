# 新しいMacでの開発環境セットアップ手順

## 前提条件
- macOS
- インターネット接続
- GitHubアカウント（既存のリポジトリにアクセス可能）

## 1. 基本ツールのインストール

### Homebrewのインストール（未インストールの場合）
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 必要なツールをインストール
```bash
# Node.js、npm、Git、PostgreSQLをインストール
brew install node npm git postgresql

# PostgreSQLサービスを開始
brew services start postgresql
```

## 2. プロジェクトのクローン

```bash
# 任意のディレクトリに移動（例：デスクトップ）
cd ~/Desktop

# GitHubからプロジェクトをクローン
git clone https://github.com/Leadfive-LLC/estimate-system.git
cd estimate-system
```

## 3. 依存関係のインストール

### フロントエンド
```bash
cd frontend
npm install
cd ..
```

### バックエンド
```bash
cd backend
npm install
cd ..
```

## 4. データベースのセットアップ

```bash
# PostgreSQLデータベースを作成
createdb estimate_system

# または、PostgreSQLにログインして作成
psql postgres
CREATE DATABASE estimate_system;
\q
```

## 5. 環境変数の設定

### backend/.env ファイルを作成
```bash
cd backend
cat > .env << 'EOF'
DATABASE_URL="postgresql://$(whoami)@localhost:5432/estimate_system"
JWT_SECRET="your-very-secure-secret-key-here"
PORT=3001
NODE_ENV=development
EOF
cd ..
```

### frontend/.env ファイルを作成（必要に応じて）
```bash
cd frontend
cat > .env << 'EOF'
REACT_APP_API_URL=http://localhost:3001
EOF
cd ..
```

## 6. データベースマイグレーション（初回のみ）

```bash
cd backend
# Prismaクライアントを生成（package.jsonにprismaがある場合）
npx prisma generate

# データベースマイグレーション実行
npx prisma migrate dev

# または、SQLファイルがある場合は手動実行
# psql estimate_system < schema.sql
cd ..
```

## 7. 開発サーバーの起動

### ターミナル1: バックエンドサーバー
```bash
cd backend
npm run dev
# または npm start
```

### ターミナル2: フロントエンドサーバー
```bash
cd frontend
npm start
```

## 8. 動作確認

- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:3001

## トラブルシューティング

### PostgreSQL接続エラーの場合
```bash
# PostgreSQLが起動しているか確認
brew services list | grep postgresql

# 起動していない場合
brew services start postgresql

# ユーザー権限の確認
createuser -s $(whoami)
```

### ポート競合の場合
```bash
# ポート使用状況を確認
lsof -i :3000
lsof -i :3001

# プロセスを終了（PIDを指定）
kill -9 <PID>
```

### Node.jsバージョンの問題
```bash
# Node.jsバージョンを確認
node --version

# 推奨バージョン: v16以上
# 必要に応じてnvmでバージョン管理
```

## 完了後の確認事項

1. [ ] フロントエンドが http://localhost:3000 で起動
2. [ ] バックエンドが http://localhost:3001 で起動  
3. [ ] データベース接続が正常
4. [ ] 見積作成ページが表示される
5. [ ] ボタンの色が正しく表示される（緑、青、紫など）

## 継続開発のワークフロー

```bash
# 最新のコードを取得
git pull origin main

# 作業ブランチを作成（推奨）
git checkout -b feature/new-feature

# 変更をコミット
git add .
git commit -m "Add new feature"

# GitHubにプッシュ
git push origin feature/new-feature

# Vercelが自動デプロイ（mainブランチにマージ後）
``` 