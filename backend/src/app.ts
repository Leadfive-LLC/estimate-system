import express from "express"
import cors from "cors"
import { PrismaClient } from "@prisma/client"
import { execSync } from "child_process"
import authRoutes from "./routes/auth"
import clientRoutes from "./routes/clients"
import itemRoutes from "./routes/items"
import estimateRoutes from "./routes/estimates"

// Railway環境での環境変数設定
if (!process.env.DATABASE_URL) {
  // 開発環境ではSQLite、本番環境では環境変数が必要
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ DATABASE_URL environment variable is required in production');
    process.exit(1);
  } else {
    process.env.DATABASE_URL = "file:./dev.db";
  }
} else {
  // DATABASE_URLの形式を修正（RailwayでPostgreSQL URLが正しくない場合）
  let dbUrl = process.env.DATABASE_URL;
  
  // postgres:// を postgresql:// に変換
  if (dbUrl.startsWith('postgres://')) {
    dbUrl = dbUrl.replace('postgres://', 'postgresql://');
    process.env.DATABASE_URL = dbUrl;
    console.log('🔧 Converted postgres:// to postgresql://');
  }
  
  // URLの形式確認
  if (!dbUrl.startsWith('postgresql://') && process.env.NODE_ENV === 'production') {
    console.error('❌ DATABASE_URL must start with postgresql:// in production');
    console.error('📝 Current DATABASE_URL format:', dbUrl.substring(0, 20) + '...');
    process.exit(1);
  }
}

console.log('🔧 Environment:', process.env.NODE_ENV);
console.log('🔧 Database URL format:', process.env.DATABASE_URL ? 
  process.env.DATABASE_URL.substring(0, 15) + '...' : 'Not set');

const app = express()
const PORT = process.env.PORT || 3001
const prisma = new PrismaClient()

// CORS設定
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://estimate-system-frontend.vercel.app'
    ];
    
    // すべてのVercelドメインを許可
    if (!origin || 
        allowedOrigins.includes(origin) || 
        /^https:\/\/.*\.vercel\.app$/.test(origin) ||
        /^http:\/\/localhost:\d+$/.test(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // 開発中は全て許可
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  maxAge: 86400 // 24時間
}));

app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} from origin: ${origin || 'no-origin'}`);
  
  // VercelのプレビューURLも含めて全て許可
  if (origin && (/^https:\/\/.*\.vercel\.app$/.test(origin) || /^http:\/\/localhost:\d+$/.test(origin))) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    console.log('Handling preflight request for:', req.path);
    return res.status(200).end();
  }
  
  next();
});

app.use(express.json())

// Preflight request handling
app.options('*', cors())

// 強制マイグレーション実行
async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    
    // 本番環境でPrismaマイグレーションを強制実行
    if (process.env.NODE_ENV === 'production') {
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      console.log('✅ Migrations completed successfully');
    }
    
    // データベース接続テスト
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // テーブル存在確認
    const userCount = await prisma.user.count();
    console.log(`✅ Database tables verified - User count: ${userCount}`);
    
  } catch (error) {
    console.error('❌ Migration or database connection failed:', error);
    
    // マイグレーションが失敗した場合、直接SQLを実行
    try {
      console.log('🔄 Attempting direct SQL execution...');
      await runDirectSQL();
    } catch (sqlError) {
      console.error('❌ Direct SQL execution failed:', sqlError);
      throw sqlError;
    }
  }
}

// 直接SQL実行（バックアップ方法）
async function runDirectSQL() {
  try {
    // 既にUserテーブルが存在するかチェック
    const userCount = await prisma.user.count();
    console.log(`✅ User table exists with ${userCount} records`);
    return; // テーブルが既に存在する場合はスキップ
  } catch (error) {
    console.log('🔄 User table does not exist, creating...');
  }

  try {
    // Userテーブル作成
    await prisma.$executeRawUnsafe(`
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
      )
    `);

    // インデックス作成（分割実行）
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "User_googleId_key" ON "User"("googleId")`);
    
    // テストユーザー作成
    await prisma.$executeRawUnsafe(`
      INSERT INTO "User" ("id", "email", "name", "role") 
      VALUES ('test-user-1', 'test@example.com', 'テストユーザー', 'ESTIMATOR')
      ON CONFLICT ("email") DO NOTHING
    `);
    
    console.log('✅ Direct SQL execution completed');
  } catch (sqlError) {
    console.log('⚠️ Some SQL operations failed, but User table may already exist:', sqlError);
    // エラーがあってもアプリケーションを続行（テーブルが既に存在する可能性）
  }
}

// Root endpoint with API documentation
app.get("/", (req, res) => {
  res.json({
    name: "Estimate System API",
    version: "1.0.0",
    status: "running",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      clients: "/api/clients",
      items: "/api/items",
      estimates: "/api/estimates"
    },
    documentation: "https://github.com/Leadfive-LLC/estimate-system"
  })
})

// Routes
app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ 
      status: "OK", 
      message: "Estimate System API is running", 
      auth: "ready",
      database: "connected"
    })
  } catch (error) {
    res.status(503).json({ 
      status: "ERROR", 
      message: "Database connection failed",
      database: "disconnected"
    })
  }
})

app.use("/api/auth", authRoutes)
app.use("/api/clients", clientRoutes)
app.use("/api/items", itemRoutes)
app.use("/api/estimates", estimateRoutes)

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

// Initialize database then start server
runMigrations().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
    console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth/google`)
  })
})
