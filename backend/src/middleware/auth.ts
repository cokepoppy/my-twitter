import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { createError } from './errorHandler'

export interface AuthRequest extends Request {
  user?: {
    id: number
    username: string
    email: string
    iat?: number
    exp?: number
  }
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('No token provided', 401)
    }

    const token = authHeader.split(' ')[1]

    if (!process.env.JWT_SECRET) {
      throw createError('JWT secret is not configured', 500)
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any
    req.user = decoded
    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw createError('Invalid token', 401)
    } else if (error instanceof jwt.TokenExpiredError) {
      throw createError('Token expired', 401)
    }
    next(error)
  }
}

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]

      if (process.env.JWT_SECRET) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as any
        req.user = decoded
      }
    }
    next()
  } catch (error) {
    // Continue without user info for optional auth
    next()
  }
}