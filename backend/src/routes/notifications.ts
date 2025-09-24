import { Router } from 'express'
import { query, validationResult } from 'express-validator'
import { authenticate, AuthRequest } from '../middleware/auth'
import { createError } from '../middleware/errorHandler'
import { prisma } from '../config/database'

const router = Router()

// Get user notifications
router.get('/', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('type')
    .optional()
    .isIn(['all', 'like', 'follow', 'reply', 'retweet', 'mention'])
    .withMessage('Invalid notification type')
], async (req: AuthRequest, res: any, next: any) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw createError(errors.array()[0].msg, 400)
    }

    const userId = req.user!.id
    const { page = 1, limit = 20, type = 'all' } = req.query

    let whereClause: any = { userId }

    if (type !== 'all') {
      whereClause.type = type.toString().toUpperCase()
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        include: {
          actor: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
              isVerified: true
            }
          },
          tweet: {
            select: {
              id: true,
              content: true,
              createdAt: true,
              user: {
                select: {
                  id: true,
                  username: true,
                  fullName: true,
                  avatarUrl: true
                }
              }
            }
          }
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.notification.count({ where: whereClause }),
      prisma.notification.count({
        where: { userId, isRead: false }
      })
    ])

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      },
      unreadCount
    })
  } catch (error) {
    next(error)
  }
})

// Mark notification as read
router.put('/:id/read', authenticate, async (req: AuthRequest, res: any, next: any) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    const notification = await prisma.notification.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!notification) {
      throw createError('Notification not found', 404)
    }

    if (notification.userId !== userId) {
      throw createError('You can only mark your own notifications as read', 403)
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    })

    res.json({
      success: true,
      message: 'Notification marked as read'
    })
  } catch (error) {
    next(error)
  }
})

// Mark all notifications as read
router.put('/mark-all-read', authenticate, async (req: AuthRequest, res: any, next: any) => {
  try {
    const userId = req.user!.id

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    })

    res.json({
      success: true,
      message: 'All notifications marked as read'
    })
  } catch (error) {
    next(error)
  }
})

// Get unread notification count
router.get('/unread-count', authenticate, async (req: AuthRequest, res: any, next: any) => {
  try {
    const userId = req.user!.id

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false }
    })

    res.json({
      success: true,
      data: { unreadCount }
    })
  } catch (error) {
    next(error)
  }
})

// Delete notification
router.delete('/:id', authenticate, async (req: AuthRequest, res: any, next: any) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    const notification = await prisma.notification.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!notification) {
      throw createError('Notification not found', 404)
    }

    if (notification.userId !== userId) {
      throw createError('You can only delete your own notifications', 403)
    }

    await prisma.notification.delete({
      where: { id }
    })

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    })
  } catch (error) {
    next(error)
  }
})

export { router as notificationRoutes }