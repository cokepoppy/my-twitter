import { Router } from 'express'
import { body, validationResult, query } from 'express-validator'
import { authenticate, AuthRequest } from '../middleware/auth'
import { createError } from '../middleware/errorHandler'
import { prisma } from '../config/database'

const router = Router()

// Follow/Unfollow user
router.post('/:username/follow', authenticate, async (req: AuthRequest, res: any, next: any) => {
  try {
    const { username } = req.params
    const followerId = req.user!.id

    // Find user to follow
    const userToFollow = await prisma.user.findUnique({
      where: { username },
      select: { id: true, isPrivate: true }
    })

    if (!userToFollow) {
      throw createError('User not found', 404)
    }

    if (userToFollow.id === followerId) {
      throw createError('You cannot follow yourself', 400)
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: followerId,
          followingId: userToFollow.id
        }
      }
    })

    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({
        where: { id: existingFollow.id }
      })

      // Update follower counts
      await prisma.user.update({
        where: { id: followerId },
        data: { followingCount: { decrement: 1 } }
      })

      await prisma.user.update({
        where: { id: userToFollow.id },
        data: { followersCount: { decrement: 1 } }
      })

      res.json({
        success: true,
        message: 'Unfollowed successfully',
        data: { isFollowing: false }
      })
    } else {
      // Follow
      await prisma.follow.create({
        data: {
          followerId: followerId,
          followingId: userToFollow.id
        }
      })

      // Update follower counts
      await prisma.user.update({
        where: { id: followerId },
        data: { followingCount: { increment: 1 } }
      })

      await prisma.user.update({
        where: { id: userToFollow.id },
        data: { followersCount: { increment: 1 } }
      })

      // Create notification
      await prisma.notification.create({
        data: {
          userId: userToFollow.id,
          type: 'FOLLOW',
          actorId: followerId
        }
      })

      res.json({
        success: true,
        message: 'Followed successfully',
        data: { isFollowing: true }
      })
    }
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
    const { page = 1, limit = 20 } = req.query as any
    const pageNum = Math.max(1, Number(page) || 1)
    const limitNum = Math.max(1, Math.min(100, Number(limit) || 20))

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
              isVerified: true,
              followersCount: true,
              followingCount: true
            }
          }
        },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
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
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
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
    const { page = 1, limit = 20 } = req.query as any
    const pageNum = Math.max(1, Number(page) || 1)
    const limitNum = Math.max(1, Math.min(100, Number(limit) || 20))

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
              isVerified: true,
              followersCount: true,
              followingCount: true
            }
          }
        },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
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
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    next(error)
  }
})

// Get follow suggestions
router.get('/suggestions', authenticate, [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Limit must be between 1 and 20')
], async (req: AuthRequest, res: any, next: any) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw createError(errors.array()[0].msg, 400)
    }

    const userId = req.user!.id
    const { limit = 10 } = req.query

    // Get users that the current user follows
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true }
    })

    const followingIds = following.map((f: any) => f.followingId)
    followingIds.push(userId) // Exclude self

    // Get suggestions based on followers of people you follow
    const suggestions = await prisma.user.findMany({
      where: {
        id: { notIn: followingIds },
        isPrivate: false
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        isVerified: true,
        followersCount: true,
        followingCount: true
      },
      take: Number(limit),
      orderBy: { followersCount: 'desc' }
    })

    res.json({
      success: true,
      data: suggestions
    })
  } catch (error) {
    next(error)
  }
})

// Check if user follows another user
router.get('/:username/follows', authenticate, async (req: AuthRequest, res: any, next: any) => {
  try {
    const { username } = req.params
    const currentUserId = req.user!.id

    const userToCheck = await prisma.user.findUnique({
      where: { username },
      select: { id: true }
    })

    if (!userToCheck) {
      throw createError('User not found', 404)
    }

    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: userToCheck.id
        }
      }
    })

    res.json({
      success: true,
      data: { isFollowing: !!follow }
    })
  } catch (error) {
    next(error)
  }
})

export { router as followRoutes }
