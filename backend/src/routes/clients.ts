import express from "express"
import { PrismaClient } from "@prisma/client"
import { verifyToken } from "../utils/jwt"

const router = express.Router()
const prisma = new PrismaClient()

// 認証ミドルウェア
const authenticate = (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    req.userId = decoded.userId
    next()
  } catch (error) {
    res.status(401).json({ error: "Invalid token" })
  }
}

// 顧客一覧取得
router.get("/", authenticate, async (req: any, res: any) => {
  try {
    const clients = await prisma.client.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" }
    })
    res.json(clients)
  } catch (error) {
    console.error("Get clients error:", error)
    res.status(500).json({ error: "Failed to fetch clients" })
  }
})

// 顧客詳細取得
router.get("/:id", authenticate, async (req: any, res: any) => {
  try {
    const client = await prisma.client.findUnique({
      where: { id: req.params.id },
      include: {
        estimates: {
          orderBy: { createdAt: "desc" }
        }
      }
    })

    if (!client) {
      return res.status(404).json({ error: "Client not found" })
    }

    res.json(client)
  } catch (error) {
    console.error("Get client error:", error)
    res.status(500).json({ error: "Failed to fetch client" })
  }
})

// 顧客作成
router.post("/", authenticate, async (req: any, res: any) => {
  try {
    const { name, email, phone, address, notes } = req.body

    if (!name) {
      return res.status(400).json({ error: "Name is required" })
    }

    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        address,
        notes
      }
    })

    res.status(201).json(client)
  } catch (error) {
    console.error("Create client error:", error)
    res.status(500).json({ error: "Failed to create client" })
  }
})

// 顧客更新
router.put("/:id", authenticate, async (req: any, res: any) => {
  try {
    const { name, email, phone, address, notes } = req.body

    const client = await prisma.client.update({
      where: { id: req.params.id },
      data: {
        name,
        email,
        phone,
        address,
        notes
      }
    })

    res.json(client)
  } catch (error) {
    console.error("Update client error:", error)
    res.status(500).json({ error: "Failed to update client" })
  }
})

// 顧客削除（論理削除）
router.delete("/:id", authenticate, async (req: any, res: any) => {
  try {
    const client = await prisma.client.update({
      where: { id: req.params.id },
      data: { isActive: false }
    })

    res.json({ message: "Client deleted successfully" })
  } catch (error) {
    console.error("Delete client error:", error)
    res.status(500).json({ error: "Failed to delete client" })
  }
})

export default router
