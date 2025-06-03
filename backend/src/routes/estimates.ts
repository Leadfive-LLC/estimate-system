import express from "express"
import { PrismaClient } from "@prisma/client"
import { auth, AuthenticatedRequest } from '../middleware/auth'

const router = express.Router()
const prisma = new PrismaClient()

// 見積一覧取得
router.get("/", auth as any, (async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user?.id
    const { status } = req.query
    
    const where: any = {
      userId: userId
    }
    if (status && typeof status === 'string') {
      where.status = status
    }

    const estimates = await prisma.estimate.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        user: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: { items: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })
    
    res.json(estimates)
  } catch (error) {
    console.error("Get estimates error:", error)
    res.status(500).json({ error: "Failed to fetch estimates" })
  }
}) as any)

// 見積詳細取得
router.get("/:id", auth as any, (async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    const estimate = await prisma.estimate.findFirst({
      where: {
        id: id,
        userId: userId
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                category: true,
                unit: true,
                description: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    if (!estimate) {
      return res.status(404).json({ message: 'Estimate not found' })
    }

    res.json(estimate)
  } catch (error) {
    console.error('Error fetching estimate detail:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}) as any)

// 見積作成
router.post("/", auth as any, (async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user?.id
    const { 
      title, 
      clientId, 
      description, 
      validUntil, 
      notes, 
      status, 
      totalAmount, 
      items 
    } = req.body

    if (!title || !clientId || !items || items.length === 0) {
      return res.status(400).json({ message: 'Required fields are missing' })
    }

    const estimate = await prisma.estimate.create({
      data: {
        title,
        clientId,
        userId: userId!,
        description,
        validUntil: validUntil ? new Date(validUntil) : null,
        notes,
        status: status || 'DRAFT',
        totalAmount,
        items: {
          create: items.map((item: any) => ({
            itemId: item.itemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
            notes: item.notes
          }))
        }
      },
      include: {
        client: true,
        items: {
          include: {
            item: true
          }
        }
      }
    })

    res.status(201).json(estimate)
  } catch (error) {
    console.error('Error creating estimate:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}) as any)

// 見積更新
router.put("/:id", auth as any, (async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { title, clientId, status, validUntil, notes, items } = req.body

    const estimate = await prisma.$transaction(async (tx) => {
      // 見積更新
      const updatedEstimate = await tx.estimate.update({
        where: { id: req.params.id },
        data: {
          title,
          clientId,
          status,
          validUntil: validUntil ? new Date(validUntil) : null,
          notes
        }
      })

      // 既存の見積項目を削除
      await tx.estimateItem.deleteMany({
        where: { estimateId: req.params.id }
      })

      // 新しい見積項目を作成
      if (items && items.length > 0) {
        await tx.estimateItem.createMany({
          data: items.map((item: any) => ({
            estimateId: req.params.id,
            itemId: item.itemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
            notes: item.notes
          }))
        })
      }

      return updatedEstimate
    })

    // 更新された見積を取得
    const result = await prisma.estimate.findUnique({
      where: { id: req.params.id },
      include: {
        client: true,
        items: {
          include: {
            item: true
          }
        }
      }
    })

    res.json(result)
  } catch (error) {
    console.error("Update estimate error:", error)
    res.status(500).json({ error: "Failed to update estimate" })
  }
}) as any)

// 見積削除
router.delete("/:id", auth as any, (async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    await prisma.estimate.delete({
      where: { id: req.params.id }
    })

    res.json({ message: "Estimate deleted successfully" })
  } catch (error) {
    console.error("Delete estimate error:", error)
    res.status(500).json({ error: "Failed to delete estimate" })
  }
}) as any)

export default router
