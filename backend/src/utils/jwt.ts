import jwt from "jsonwebtoken"

const JWT_SECRET = "estimate-system-secret-key-2025-railway-production"

export const generateToken = (userId: string) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" })
}

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET) as { userId: string }
}
