# 🌿 造園見積システム

個人宅向け造園工事の見積から請求まで一元管理するWebアプリケーションです。

## ✨ 主な機能

### 📊 **単価マスタ管理**
- **39項目の詳細価格データベース**：植栽工事、ガレージ工事、テラス工事、電気工事、ウッドフェンス建柱
- **インライン編集**：一覧画面から直接価格編集
- **価格整合性チェック**：仕入単価×掛け率と見積単価の自動比較
- **レスポンシブ対応**：スマホでもタブレットでも使いやすいUI

### 👥 **顧客管理**
- 顧客情報の登録・編集・削除
- 連絡先・住所管理

### 📋 **見積管理**
- 見積書作成・編集・削除
- 項目別単価・数量・小計の自動計算
- PDF出力対応

### 📱 **スマホ対応**
- **カード表示モード**：スマホでの操作性を重視
- **テーブル表示モード**：PC・タブレット向け
- **タッチ操作対応**：編集しやすいUI

## 🛠️ 技術スタック

### **フロントエンド**
- React 18 + TypeScript
- Tailwind CSS
- React Router v6

### **バックエンド**
- Node.js + Express
- TypeScript
- Prisma ORM
- SQLite Database
- JWT認証

## 🚀 ローカル開発環境セットアップ

### **必要な環境**
- Node.js 18以上
- npm 9以上

### **1. プロジェクトのクローン**
```bash
git clone <repository-url>
cd 見積もりシステム
```

### **2. 依存関係のインストール**
```bash
npm run install:all
```

### **3. データベースのセットアップ**
```bash
npm run db:migrate
npm run db:seed
```

### **4. 開発サーバーの起動**
```bash
npm run dev
```

- フロントエンド: http://localhost:3000
- バックエンド API: http://localhost:3001

### **5. テスト用ログイン情報**
- メールアドレス: `test@example.com`
- パスワード: `password123`

## 📦 プロジェクト構成

```
見積もりシステム/
├── frontend/          # React フロントエンド
│   ├── src/
│   │   ├── components/    # 再利用可能コンポーネント
│   │   ├── pages/        # ページコンポーネント
│   │   ├── contexts/     # React Context
│   │   └── utils/        # ユーティリティ関数
│   └── public/
├── backend/           # Node.js バックエンド
│   ├── src/
│   │   ├── routes/       # API ルート
│   │   ├── utils/        # ユーティリティ関数
│   │   └── app.ts        # Express アプリケーション
│   └── prisma/
│       ├── schema.prisma # データベーススキーマ
│       └── seed.ts       # シードデータ
└── package.json       # プロジェクト設定
```

## 🌐 デプロイメント

### **推奨構成: Vercel + Railway**

#### **フロントエンド (Vercel)**
1. GitHubにプッシュ
2. Vercelで新規プロジェクト作成
3. `frontend` フォルダを選択
4. 自動デプロイ設定

#### **バックエンド (Railway)**
1. [Railway](https://railway.app) にサインアップ
2. 新規プロジェクト作成
3. GitHubリポジトリ連携
4. `backend` フォルダを選択
5. PostgreSQL データベースを追加

### **環境変数設定**

#### **Backend (.env)**
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-jwt-secret"
PORT=3001
NODE_ENV=production
```

#### **Frontend**
```env
REACT_APP_API_URL=https://your-backend.railway.app
```

## 📱 モバイル対応

### **カード表示モード**
- スマートフォンでの操作性を重視
- 大きなタップターゲット
- 縦スクロール対応

### **テーブル表示モード**
- PC・タブレット向け
- 情報密度の高い表示
- 横スクロール対応

## 🎯 使用方法

### **単価マスタ管理**
1. **価格の直接編集**: 価格欄をタップして数値入力
2. **ビュー切り替え**: 📋 表形式 ⇔ 📱 カード形式
3. **検索・フィルタ**: 項目名、カテゴリー、仕様で検索
4. **詳細編集**: 「詳細編集」ボタンで全項目編集

### **見積作成**
1. 「新規見積」ボタンをクリック
2. 顧客を選択
3. 項目と数量を入力
4. 自動計算で小計・合計を確認

## 📊 データベース構造

### **主要テーブル**
- `User`: ユーザー情報
- `Client`: 顧客情報
- `Item`: 単価マスタ
- `Estimate`: 見積情報
- `EstimateItem`: 見積明細

### **価格マスタ項目数**
- 植栽工事: 20項目
- ガレージ工事: 5項目
- テラス工事: 6項目
- 電気工事: 4項目
- ウッドフェンス建柱: 4項目
- **合計: 39項目**

## 🔧 開発コマンド

```bash
# 全体開発サーバー起動
npm run dev

# フロントエンドのみ
npm run dev:frontend

# バックエンドのみ
npm run dev:backend

# ビルド
npm run build

# データベース管理
npm run db:studio

# データベースシード実行
npm run db:seed
```

## 🤝 コントリビューション

1. フォークする
2. フィーチャーブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. コミット (`git commit -m 'Add some AmazingFeature'`)
4. プッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照

## 📞 サポート

問題や質問がある場合は、GitHubのIssuesで報告してください。

---

**Built with ❤️ for Japanese landscaping professionals**
