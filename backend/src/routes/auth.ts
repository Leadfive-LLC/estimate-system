import express, { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
import { generateToken, verifyToken } from "../utils/jwt"

const router = express.Router()
const prisma = new PrismaClient()

// 認証状態確認
router.get("/me", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true
      }
    })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json(user)
  } catch (error) {
    res.status(401).json({ error: "Invalid token" })
  }
})

// Google OAuth (簡易実装 - 開発用)
router.get("/google", (req: Request, res: Response) => {
  res.json({ 
    message: "Google OAuth endpoint - In production, this would redirect to Google OAuth",
    note: "For development, use the test login endpoint"
  })
})

// 開発用テストログイン
router.post("/test-login", async (req: Request, res: Response) => {
  try {
    console.log("Test login request received:", req.body);
    
    const { email, name } = req.body

    if (!email || !name) {
      console.log("Missing email or name");
      return res.status(400).json({ error: "Email and name are required" })
    }

    console.log("Searching for user with email:", email);
    
    // ユーザーを作成または取得
    let user = await prisma.user.findUnique({
      where: { email }
    })

    console.log("User found:", user ? "Yes" : "No");

    if (!user) {
      console.log("Creating new user");
      user = await prisma.user.create({
        data: {
          email,
          name,
          role: "ESTIMATOR"
        }
      })
      console.log("User created:", user.id);
    }

    console.log("Generating token for user:", user.id);
    const token = generateToken(user.id)
    
    console.log("Login successful for user:", user.email);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role
      }
    })
  } catch (error) {
    console.error("Test login error:", error)
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(500).json({ 
      error: "Login failed",
      details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : "Unknown error" : undefined
    })
  }
})

// ログアウト
router.post("/logout", (req: Request, res: Response) => {
  // JWTはステートレスなので、クライアント側でトークンを削除するだけ
  res.json({ message: "Logged out successfully" })
})

export default router
