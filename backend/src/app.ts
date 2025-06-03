import express from "express"
import cors from "cors"
import { PrismaClient } from "@prisma/client"
import authRoutes from "./routes/auth"
import clientRoutes from "./routes/clients"
import itemRoutes from "./routes/items"
import estimateRoutes from "./routes/estimates"

const app = express()
const PORT = process.env.PORT || 3001
const prisma = new PrismaClient()

// CORS設定
app.use(cors({
  origin: ['http://localhost:3000', 'https://estimate-system-frontend.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000',
    'https://estimate-system-frontend.vercel.app'
  ];

  console.log(`Incoming request from origin: ${origin}`);
  
  if (!origin || allowedOrigins.includes(origin) || /^https:\/\/.*\.vercel\.app$/.test(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    console.log('Handling preflight request');
    return res.status(200).end();
  }
  
  next();
});

app.use(express.json())

// Preflight request handling
app.options('*', cors())

// Database connection test
async function initializeDatabase() {
  try {
    await prisma.$connect()
    console.log("✅ Database connected successfully")
    
    // Generate Prisma client if needed
    await prisma.$executeRaw`PRAGMA journal_mode=WAL;`
    console.log("📊 Database initialized")
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    process.exit(1)
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
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
    console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth/google`)
  })
})
