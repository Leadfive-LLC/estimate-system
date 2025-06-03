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

// 単価マスタ一覧取得（全項目取得、フィルタリングはフロントエンドで実行）
router.get("/", authenticate, async (req: any, res: any) => {
  try {
    const { category } = req.query
    
    const where: any = {}
    if (category && category !== 'all') {
      where.category = category
    }

    const items = await prisma.item.findMany({
      where,
      orderBy: [
        { category: "asc" },
        { name: "asc" }
      ]
    })
    
    res.json(items)
  } catch (error) {
    console.error("Get items error:", error)
    res.status(500).json({ error: "Failed to fetch items" })
  }
})

// カテゴリ一覧取得
router.get("/categories", authenticate, async (req: any, res: any) => {
  try {
    const categories = await prisma.item.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" }
    })
    
    res.json(categories.map(c => c.category))
  } catch (error) {
    console.error("Get categories error:", error)
    res.status(500).json({ error: "Failed to fetch categories" })
  }
})

// 単価マスタ詳細取得
router.get("/:id", authenticate, async (req: any, res: any) => {
  try {
    const item = await prisma.item.findUnique({
      where: { id: req.params.id }
    })

    if (!item) {
      return res.status(404).json({ error: "Item not found" })
    }

    res.json(item)
  } catch (error) {
    console.error("Get item error:", error)
    res.status(500).json({ error: "Failed to fetch item" })
  }
})

// 単価マスタ作成
router.post("/", authenticate, async (req: any, res: any) => {
  try {
    const { 
      name, 
      category, 
      specification,
      unit, 
      purchasePrice,
      markupRate,
      unitPrice, 
      description 
    } = req.body

    if (!name || !category || unitPrice === undefined) {
      return res.status(400).json({ error: "Name, category, and unitPrice are required" })
    }

    const item = await prisma.item.create({
      data: {
        name,
        category,
        specification,
        unit,
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
        markupRate: markupRate ? parseFloat(markupRate) : 1.5,
        unitPrice: parseFloat(unitPrice),
        description
      }
    })

    res.status(201).json(item)
  } catch (error) {
    console.error("Create item error:", error)
    res.status(500).json({ error: "Failed to create item" })
  }
})

// 単価マスタ更新
router.put("/:id", authenticate, async (req: any, res: any) => {
  try {
    const { 
      name, 
      category, 
      specification,
      unit, 
      purchasePrice,
      markupRate,
      unitPrice, 
      description,
      isActive
    } = req.body

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (category !== undefined) updateData.category = category
    if (specification !== undefined) updateData.specification = specification
    if (unit !== undefined) updateData.unit = unit
    if (purchasePrice !== undefined) updateData.purchasePrice = purchasePrice ? parseFloat(purchasePrice) : null
    if (markupRate !== undefined) updateData.markupRate = parseFloat(markupRate)
    if (unitPrice !== undefined) updateData.unitPrice = parseFloat(unitPrice)
    if (description !== undefined) updateData.description = description
    if (isActive !== undefined) updateData.isActive = isActive

    const item = await prisma.item.update({
      where: { id: req.params.id },
      data: updateData
    })

    res.json(item)
  } catch (error) {
    console.error("Update item error:", error)
    res.status(500).json({ error: "Failed to update item" })
  }
})

// 単価マスタ削除（論理削除）
router.delete("/:id", authenticate, async (req: any, res: any) => {
  try {
    const item = await prisma.item.update({
      where: { id: req.params.id },
      data: { isActive: false }
    })

    res.json({ message: "Item deleted successfully" })
  } catch (error) {
    console.error("Delete item error:", error)
    res.status(500).json({ error: "Failed to delete item" })
  }
})

export default router
