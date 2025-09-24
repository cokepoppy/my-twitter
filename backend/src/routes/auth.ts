import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from '../config/database'
import { authenticate, AuthRequest } from '../middleware/auth'
import { createError } from '../middleware/errorHandler'
import { RegisterUserDto, LoginUserDto, User } from '../types'

const router = Router()

// Register
router.post('/register', [
  body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('fullName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Full name must be less than 50 characters')
], async (req: any, res: any, next: any) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw createError(errors.array()[0].msg, 400)
    }

    const { username, email, password, fullName }: RegisterUserDto = req.body

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    })

    if (existingUser) {
      throw createError('Username or email already exists', 409)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash: hashedPassword,
        fullName: fullName || username
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        bio: true,
        location: true,
        website: true,
        avatarUrl: true,
        headerUrl: true,
        isVerified: true,
        isPrivate: true,
        followersCount: true,
        followingCount: true,
        tweetsCount: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    })
  } catch (error) {
    next(error)
  }
})

// Login
router.post('/login', [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], async (req: any, res: any, next: any) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw createError(errors.array()[0].msg, 400)
    }

    const { email, password }: LoginUserDto = req.body

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      throw createError('Invalid credentials', 401)
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
    if (!isPasswordValid) {
      throw createError('Invalid credentials', 401)
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      bio: user.bio,
      location: user.location,
      website: user.website,
      avatarUrl: user.avatarUrl,
      headerUrl: user.headerUrl,
      isVerified: user.isVerified,
      isPrivate: user.isPrivate,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      tweetsCount: user.tweetsCount,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token
      }
    })
  } catch (error) {
    next(error)
  }
})

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res: any, next: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        bio: true,
        location: true,
        website: true,
        avatarUrl: true,
        headerUrl: true,
        isVerified: true,
        isPrivate: true,
        followersCount: true,
        followingCount: true,
        tweetsCount: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      throw createError('User not found', 404)
    }

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    next(error)
  }
})

// Refresh token
router.post('/refresh', authenticate, async (req: AuthRequest, res: any, next: any) => {
  try {
    const token = jwt.sign(
      { id: req.user!.id, username: req.user!.username, email: req.user!.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      data: { token }
    })
  } catch (error) {
    next(error)
  }
})

// Logout (client-side token removal)
router.post('/logout', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  })
})

export { router as authRoutes }