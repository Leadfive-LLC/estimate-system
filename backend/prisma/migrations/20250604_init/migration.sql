-- 造園見積システム初期化SQL
-- PostgreSQL用

-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "googleId" TEXT,
    "role" TEXT NOT NULL DEFAULT 'ESTIMATOR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- 顧客テーブル
CREATE TABLE IF NOT EXISTS "Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- 見積テーブル
CREATE TABLE IF NOT EXISTS "Estimate" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "clientId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "totalAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "validUntil" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Estimate_pkey" PRIMARY KEY ("id")
);

-- 単価マスタテーブル
CREATE TABLE IF NOT EXISTS "Item" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "specification" TEXT,
    "unit" TEXT,
    "purchasePrice" DECIMAL(65,30),
    "markupRate" DECIMAL(65,30) NOT NULL DEFAULT 1.5,
    "unitPrice" DECIMAL(65,30) NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- 見積項目テーブル
CREATE TABLE IF NOT EXISTS "EstimateItem" (
    "id" TEXT NOT NULL,
    "estimateId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "unitPrice" DECIMAL(65,30) NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "adjustment" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EstimateItem_pkey" PRIMARY KEY ("id")
);

-- ユニーク制約
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "User_googleId_key" ON "User"("googleId");

-- 外部キー制約
ALTER TABLE "Estimate" ADD CONSTRAINT "Estimate_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Estimate" ADD CONSTRAINT "Estimate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EstimateItem" ADD CONSTRAINT "EstimateItem_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "Estimate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EstimateItem" ADD CONSTRAINT "EstimateItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- インデックス
CREATE INDEX IF NOT EXISTS "Estimate_clientId_idx" ON "Estimate"("clientId");
CREATE INDEX IF NOT EXISTS "Estimate_userId_idx" ON "Estimate"("userId");
CREATE INDEX IF NOT EXISTS "EstimateItem_estimateId_idx" ON "EstimateItem"("estimateId");
CREATE INDEX IF NOT EXISTS "EstimateItem_itemId_idx" ON "EstimateItem"("itemId");

-- 初期データ
INSERT INTO "User" ("id", "email", "name", "role") 
VALUES ('test-user-1', 'test@example.com', 'テストユーザー', 'ESTIMATOR')
ON CONFLICT ("email") DO NOTHING;

INSERT INTO "Client" ("id", "name", "email", "phone", "address") 
VALUES ('sample-client-1', 'サンプル顧客', 'sample@example.com', '03-1234-5678', '東京都渋谷区')
ON CONFLICT DO NOTHING;

INSERT INTO "Item" ("id", "name", "category", "unit", "unitPrice") VALUES
('item-1', '芝張り工事', '造園工事', '㎡', 2500),
('item-2', '植栽工事（低木）', '造園工事', '本', 1500),
('item-3', '土壌改良', '土工事', '㎡', 800)
ON CONFLICT DO NOTHING; 