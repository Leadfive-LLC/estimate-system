import express from "express"
import cors from "cors"
import authRoutes from "./routes/auth"
import clientRoutes from "./routes/clients"
import itemRoutes from "./routes/items"
import estimateRoutes from "./routes/estimates"

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

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
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Estimate System API is running", auth: "ready" })
})
app.use("/api/auth", authRoutes)
app.use("/api/clients", clientRoutes)
app.use("/api/items", itemRoutes)
app.use("/api/estimates", estimateRoutes)

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
  console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth/google`)
})
