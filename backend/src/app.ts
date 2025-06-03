import express from "express"
import cors from "cors"
import { PrismaClient } from "@prisma/client"
import authRoutes from "./routes/auth"
import clientRoutes from "./routes/clients"
import itemRoutes from "./routes/items"
import estimateRoutes from "./routes/estimates"

const app = express()
const PORT = 3001
const prisma = new PrismaClient()

// CORS設定
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://estimate-system-frontend.vercel.app'
    ];
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin matches allowed patterns
    const isAllowed = allowedOrigins.includes(origin) || 
                     /^https:\/\/.*\.vercel\.app$/.test(origin);
    
    console.log(`CORS check: ${origin} -> ${isAllowed ? 'ALLOWED' : 'BLOCKED'}`);
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use(express.json())

// Preflight request handling
app.options('*', cors(corsOptions))

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
