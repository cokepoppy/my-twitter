import { Router } from 'express'
import { body, validationResult, query } from 'express-validator'
import { authenticate, AuthRequest, optionalAuth } from '../middleware/auth'
import { createError } from '../middleware/errorHandler'
import { prisma } from '../config/database'
import { UpdateUserDto, ChangePasswordDto, PaginationQuery } from '../types'
import bcrypt from 'bcrypt'

const router = Router()

// Get user profile
router.get('/profile/:username', optionalAuth, async (req: any, res: any, next: any) => {
  try {
    const { username } = req.params
    const currentUserId = req.user?.id

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
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

    // Check if current user follows this user
    let isFollowing = false
    if (currentUserId && currentUserId !== user.id) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: user.id
          }
        }
      })
      isFollowing = !!follow
    }

    res.json({
      success: true,
      data: {
        ...user,
        isFollowing
      }
    })
  } catch (error) {
    next(error)
  }
})

// Update user profile
router.put('/profile', authenticate, [
  body('fullName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Full name must be less than 50 characters'),
  body('bio')
    .optional()
    .isLength({ max: 160 })
    .withMessage('Bio must be less than 160 characters'),
  body('location')
    .optional()
    .isLength({ max: 30 })
    .withMessage('Location must be less than 30 characters'),
  body('website')
    .optional()
    .isURL()
    .withMessage('Website must be a valid URL')
], async (req: AuthRequest, res: any, next: any) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw createError(errors.array()[0].msg, 400)
    }

    const { fullName, bio, location, website }: UpdateUserDto = req.body
    const userId = req.user!.id

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(fullName && { fullName }),
        ...(bio !== undefined && { bio }),
        ...(location !== undefined && { location }),
        ...(website !== undefined && { website })
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

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    })
  } catch (error) {
    next(error)
  }
})

// Change password
router.put('/password', authenticate, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
], async (req: AuthRequest, res: any, next: any) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw createError(errors.array()[0].msg, 400)
    }

    const { currentPassword, newPassword }: ChangePasswordDto = req.body
    const userId = req.user!.id

    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true }
    })

    if (!user) {
      throw createError('User not found', 404)
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isPasswordValid) {
      throw createError('Current password is incorrect', 400)
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword }
    })

    res.json({
      success: true,
      message: 'Password changed successfully'
    })
  } catch (error) {
    next(error)
  }
})

// Get user's followers
router.get('/:username/followers', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
], async (req: any, res: any, next: any) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw createError(errors.array()[0].msg, 400)
    }

    const { username } = req.params
    const { page = 1, limit = 20 }: PaginationQuery = req.query

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true }
    })

    if (!user) {
      throw createError('User not found', 404)
    }

    const [followers, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followingId: user.id },
        include: {
          follower: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
              isVerified: true
            }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.follow.count({
        where: { followingId: user.id }
      })
    ])

    res.json({
      success: true,
      data: followers.map((follow: any) => follow.follower),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    next(error)
  }
})

// Get user's following
router.get('/:username/following', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
], async (req: any, res: any, next: any) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw createError(errors.array()[0].msg, 400)
    }

    const { username } = req.params
    const { page = 1, limit = 20 }: PaginationQuery = req.query

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true }
    })

    if (!user) {
      throw createError('User not found', 404)
    }

    const [following, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followerId: user.id },
        include: {
          following: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
              isVerified: true
            }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.follow.count({
        where: { followerId: user.id }
      })
    ])

    res.json({
      success: true,
      data: following.map((follow: any) => follow.following),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    next(error)
  }
})

// Search users
router.get('/search', [
  query('q')
    .notEmpty()
    .withMessage('Search query is required'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
], async (req: any, res: any, next: any) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw createError(errors.array()[0].msg, 400)
    }

    const { q, page = 1, limit = 20 } = req.query

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: [
            {
              username: {
                contains: q as string,
                mode: 'insensitive'
              }
            },
            {
              fullName: {
                contains: q as string,
                mode: 'insensitive'
              }
            }
          ]
        },
        select: {
          id: true,
          username: true,
          fullName: true,
          avatarUrl: true,
          isVerified: true,
          followersCount: true
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { followersCount: 'desc' }
      }),
      prisma.user.count({
        where: {
          OR: [
            {
              username: {
                contains: q as string,
                mode: 'insensitive'
              }
            },
            {
              fullName: {
                contains: q as string,
                mode: 'insensitive'
              }
            }
          ]
        }
      })
    ])

    res.json({
      success: true,
      data: users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    next(error)
  }
})

export { router as userRoutes }