import { Router } from 'express'
import { body, validationResult, query } from 'express-validator'
import { authenticate, AuthRequest } from '../middleware/auth'
import { createError } from '../middleware/errorHandler'
import { prisma } from '../config/database'

const router = Router()

// Get user conversations
router.get('/conversations', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
], async (req: AuthRequest, res: any, next: any) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw createError(errors.array()[0].msg, 400)
    }

    const userId = req.user!.id
    const { page = 1, limit = 20 } = req.query as any

    // Get conversations where user is involved
    const conversations = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            isVerified: true
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            isVerified: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      distinct: ['senderId', 'receiverId']
    })

    // Group by conversation and get last message
    const conversationMap = new Map()
    conversations.forEach((message: any) => {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId
      const key = [userId, otherUserId].sort().join('-')

      if (!conversationMap.has(key)) {
        conversationMap.set(key, message)
      }
    })

    const conversationsList = Array.from(conversationMap.values())
    const total = conversationsList.length
    const startIndex = (page - 1) * limit
    const paginatedConversations = conversationsList.slice(startIndex, startIndex + limit)

    // Get unread counts for each conversation
    const conversationsWithUnread = await Promise.all(
      paginatedConversations.map(async (conversation) => {
        const otherUserId = conversation.senderId === userId ? conversation.receiverId : conversation.senderId
        const unreadCount = await prisma.message.count({
          where: {
            senderId: otherUserId,
            receiverId: userId,
            isRead: false
          }
        })
        return {
          ...conversation,
          unreadCount,
          otherUser: conversation.senderId === userId ? conversation.receiver : conversation.sender
        }
      })
    )

    res.json({
      success: true,
      data: conversationsWithUnread,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error) {
    next(error)
  }
})

// Get messages with a specific user
router.get('/:username', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
], async (req: AuthRequest, res: any, next: any) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw createError(errors.array()[0].msg, 400)
    }

    const { username } = req.params
    const userId = req.user!.id
    const { page = 1, limit = 50 } = req.query

    // Find the other user
    const otherUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true }
    })

    if (!otherUser) {
      throw createError('User not found', 404)
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: {
          OR: [
            {
              senderId: userId,
              receiverId: otherUser.id
            },
            {
              senderId: otherUser.id,
              receiverId: userId
            }
          ]
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
              isVerified: true
            }
          },
          receiver: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
              isVerified: true
            }
          }
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.message.count({
        where: {
          OR: [
            {
              senderId: userId,
              receiverId: otherUser.id
            },
            {
              senderId: otherUser.id,
              receiverId: userId
            }
          ]
        }
      })
    ])

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        senderId: otherUser.id,
        receiverId: userId,
        isRead: false
      },
      data: { isRead: true }
    })

    res.json({
      success: true,
      data: messages.reverse(), // Return in chronological order
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error) {
    next(error)
  }
})

// Send message
router.post('/:username', [
  body('content')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message content must be between 1 and 1000 characters')
], async (req: AuthRequest, res: any, next: any) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw createError(errors.array()[0].msg, 400)
    }

    const { username } = req.params
    const { content } = req.body
    const senderId = req.user!.id

    // Find the recipient
    const recipient = await prisma.user.findUnique({
      where: { username },
      select: { id: true, isPrivate: true }
    })

    if (!recipient) {
      throw createError('User not found', 404)
    }

    if (recipient.id === senderId) {
      throw createError('You cannot send messages to yourself', 400)
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId: recipient.id,
        content
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            isVerified: true
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            isVerified: true
          }
        }
      }
    })

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    })
  } catch (error) {
    next(error)
  }
})

// Mark messages as read
router.put('/:username/read', authenticate, async (req: AuthRequest, res: any, next: any) => {
  try {
    const { username } = req.params
    const userId = req.user!.id

    const otherUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true }
    })

    if (!otherUser) {
      throw createError('User not found', 404)
    }

    await prisma.message.updateMany({
      where: {
        senderId: otherUser.id,
        receiverId: userId,
        isRead: false
      },
      data: { isRead: true }
    })

    res.json({
      success: true,
      message: 'Messages marked as read'
    })
  } catch (error) {
    next(error)
  }
})

// Delete message
router.delete('/:id', authenticate, async (req: AuthRequest, res: any, next: any) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    const message = await prisma.message.findUnique({
      where: { id },
      select: { senderId: true, receiverId: true }
    })

    if (!message) {
      throw createError('Message not found', 404)
    }

    if (message.senderId !== userId && message.receiverId !== userId) {
      throw createError('You can only delete messages you are involved in', 403)
    }

    await prisma.message.delete({
      where: { id }
    })

    res.json({
      success: true,
      message: 'Message deleted successfully'
    })
  } catch (error) {
    next(error)
  }
})

// Get unread message count
router.get('/unread/count', authenticate, async (req: AuthRequest, res: any, next: any) => {
  try {
    const userId = req.user!.id

    const unreadCount = await prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false
      }
    })

    res.json({
      success: true,
      data: { unreadCount }
    })
  } catch (error) {
    next(error)
  }
})

export { router as messageRoutes }