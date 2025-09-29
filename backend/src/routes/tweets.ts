import { Router } from 'express'
import { body, validationResult, query } from 'express-validator'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { authenticate, AuthRequest, optionalAuth } from '../middleware/auth'
import { createError } from '../middleware/errorHandler'
import { prisma } from '../config/database'
import { CreateTweetDto, PaginationQuery } from '../types'

const router = Router()

// Helper: parse mentions from content
const extractMentions = (text: string): string[] => {
  const set = new Set<string>()
  const regex = /@([a-zA-Z0-9_]{1,20})/g
  let m
  while ((m = regex.exec(text)) !== null) {
    set.add(m[1])
  }
  return Array.from(set)
}

// Create tweet (supports normal, reply, and quote tweet)
router.post('/', authenticate, [
  body('content')
    .isLength({ min: 1, max: 280 })
    .withMessage('Tweet content must be between 1 and 280 characters'),
  body('replyToTweetId')
    .optional()
    .isUUID()
    .withMessage('Invalid tweet ID for reply')
    .bail(),
  body('retweetId')
    .optional()
    .isUUID()
    .withMessage('Invalid tweet ID for quote')
], async (req: AuthRequest, res: any, next: any) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw createError(errors.array()[0].msg, 400)
    }

    const { content, replyToTweetId, retweetId } = req.body as any
    const userId = req.user!.id

    // If replying to a tweet, verify it exists and get replyToUserId
    let replyToUserId: string | undefined
    if (replyToTweetId) {
      const parentTweet = await prisma.tweet.findUnique({
        where: { id: replyToTweetId },
        select: { userId: true, isDeleted: true }
      })

      if (!parentTweet || parentTweet.isDeleted) {
        throw createError('Tweet not found', 404)
      }

      replyToUserId = parentTweet.userId
    }

    // If quoting a tweet, verify it exists
    if (retweetId) {
      const original = await prisma.tweet.findUnique({
        where: { id: retweetId, isDeleted: false },
        select: { id: true, userId: true }
      })
      if (!original) {
        throw createError('Original tweet not found', 404)
      }
    }

    // Create tweet
    const tweet = await prisma.tweet.create({
      data: {
        userId,
        content,
        replyToTweetId,
        replyToUserId,
        retweetId: retweetId || undefined
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            isVerified: true
          }
        },
        media: true,
        originalTweet: {
          include: {
            user: {
              select: { id: true, username: true, fullName: true, avatarUrl: true, isVerified: true }
            },
            media: true
          }
        },
        _count: {
          select: {
            likes: true,
            retweets: true,
            replies: true
          }
        }
      }
    })

    // Update user's tweet count
    await prisma.user.update({
      where: { id: userId },
      data: { tweetsCount: { increment: 1 } }
    })

    // If replying, increment parent tweet's reply count
    if (replyToTweetId) {
      await prisma.tweet.update({
        where: { id: replyToTweetId },
        data: { repliesCount: { increment: 1 } }
      })
    }

    // If quoting, increment original tweet's retweet count as a combined metric
    if (retweetId) {
      await prisma.tweet.update({ where: { id: retweetId }, data: { retweetsCount: { increment: 1 } } })
    }

    // Notifications
    // Reply notification
    if (replyToUserId && replyToUserId !== userId) {
      await prisma.notification.create({
        data: { userId: replyToUserId, type: 'REPLY', actorId: userId, tweetId: tweet.id }
      })
    }
    // Mention notifications
    const mentions = extractMentions(content)
    if (mentions.length) {
      const users = await prisma.user.findMany({
        where: { username: { in: mentions } },
        select: { id: true, username: true }
      })
      await Promise.all(
        users
          .filter(u => u.id !== userId)
          .map(u =>
            prisma.notification.create({ data: { userId: u.id, type: 'MENTION', actorId: userId, tweetId: tweet.id } })
          )
      )
    }

    res.status(201).json({
      success: true,
      message: 'Tweet created successfully',
      data: tweet
    })
  } catch (error) {
    next(error)
  }
})

// Get tweet by ID moved near the bottom to avoid conflicts with specific routes

// Get user's tweets
router.get('/user/:username', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('type')
    .optional()
    .isIn(['tweets', 'replies', 'media', 'likes'])
    .withMessage('Type must be tweets, replies, media, or likes')
], async (req: any, res: any, next: any) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw createError(errors.array()[0].msg, 400)
    }

    const { username } = req.params
    const { page = 1, limit = 20, type = 'tweets' } = req.query
    const pageNum = Math.max(1, Number(page) || 1)
    const limitNum = Math.max(1, Math.min(100, Number(limit) || 20))

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true, isPrivate: true }
    })

    if (!user) {
      throw createError('User not found', 404)
    }

    let whereClause: any = { userId: user.id, isDeleted: false }
    let includeClause: any = {
      user: {
        select: {
          id: true,
          username: true,
          fullName: true,
          avatarUrl: true,
          isVerified: true
        }
      },
      media: true,
      _count: {
        select: {
          likes: true,
          retweets: true,
          replies: true
        }
      }
    }

    switch (type) {
      case 'replies':
        whereClause.replyToTweetId = { not: null }
        break
      case 'media':
        includeClause.media = { where: { fileType: { not: null } } }
        break
      case 'likes':
        // For likes, we need to query through the Like model
        const [likedTweets, total] = await Promise.all([
          prisma.like.findMany({
            where: { userId: user.id },
            include: {
              tweet: {
                include: includeClause,
                where: { isDeleted: false }
              }
            },
            skip: (pageNum - 1) * limitNum,
            take: limitNum,
            orderBy: { createdAt: 'desc' }
          }),
          prisma.like.count({ where: { userId: user.id } })
        ])

        return res.json({
          success: true,
          data: likedTweets.map((like: any) => like.tweet),
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum)
          }
        })
    }

    const [tweets, total] = await Promise.all([
      prisma.tweet.findMany({
        where: whereClause,
        include: includeClause,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.tweet.count({ where: whereClause })
    ])

    res.json({
      success: true,
      data: tweets,
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

// Get timeline/feed
router.get('/timeline', authenticate, [
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

    const userId = req.user!.id
    const { page = 1, limit = 20 } = req.query as any
    const pageNum = Math.max(1, Number(page) || 1)
    const limitNum = Math.max(1, Math.min(100, Number(limit) || 20))

    // Get users that the current user follows
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true }
    })

    const followingIds = following.map((f: any) => f.followingId)
    followingIds.push(userId) // Include user's own tweets

    const [tweets, total] = await Promise.all([
      prisma.tweet.findMany({
        where: {
          userId: { in: followingIds },
          isDeleted: false
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
              isVerified: true
            }
          },
          media: true,
          originalTweet: {
            include: {
              user: { select: { id: true, username: true, fullName: true, avatarUrl: true, isVerified: true } },
              media: true
            }
          },
          parentTweet: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  fullName: true,
                  avatarUrl: true,
                  isVerified: true
                }
              }
            }
          },
          _count: {
            select: {
              likes: true,
              retweets: true,
              replies: true
            }
          }
        },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.tweet.count({
        where: {
          userId: { in: followingIds },
          isDeleted: false
        }
      })
    ])

    // Check if current user liked each tweet
    const tweetsWithLikeStatus = await Promise.all(
      tweets.map(async (tweet: any) => {
        const like = await prisma.like.findUnique({
          where: {
            userId_tweetId: {
              userId: userId,
              tweetId: tweet.id
            }
          }
        })
        return { ...tweet, isLiked: !!like }
      })
    )

    res.json({
      success: true,
      data: tweetsWithLikeStatus,
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

// Get replies for a tweet
router.get('/:id/replies', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req: any, res: any, next: any) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw createError(errors.array()[0].msg, 400)
    }
    const { id } = req.params
    const { page = 1, limit = 20 } = req.query
    const pageNum = Math.max(1, Number(page) || 1)
    const limitNum = Math.max(1, Math.min(100, Number(limit) || 20))
    const [replies, total] = await Promise.all([
      prisma.tweet.findMany({
        where: { replyToTweetId: id, isDeleted: false },
        include: {
          user: { select: { id: true, username: true, fullName: true, avatarUrl: true, isVerified: true } },
          media: true,
          _count: { select: { likes: true, retweets: true, replies: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum
      }),
      prisma.tweet.count({ where: { replyToTweetId: id, isDeleted: false } })
    ])
    res.json({
      success: true,
      data: replies,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) }
    })
  } catch (error) {
    next(error)
  }
})

// --- Media upload for a tweet ---
const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
    cb(null, name)
  }
})

const maxSize = Number(process.env.MAX_FILE_SIZE || 10 * 1024 * 1024) // 10MB default
const upload = multer({
  storage,
  limits: { fileSize: maxSize, files: 4 },
  fileFilter: (_req, file, cb) => {
    const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    const videoTypes = ['video/mp4', 'video/webm']
    if (imageTypes.includes(file.mimetype) || videoTypes.includes(file.mimetype)) cb(null, true)
    else cb(new Error('Unsupported file type'))
  }
})

router.post('/:id/media', authenticate, upload.array('files', 4), async (req: AuthRequest, res: any, next: any) => {
  try {
    const { id } = req.params
    const userId = req.user!.id
    const tweet = await prisma.tweet.findUnique({ where: { id }, select: { userId: true, isDeleted: true } })
    if (!tweet || tweet.isDeleted) throw createError('Tweet not found', 404)
    if (tweet.userId !== userId) throw createError('Not allowed to attach media to this tweet', 403)

    const files = (req.files as Express.Multer.File[]) || []
    if (files.length === 0) throw createError('No files uploaded', 400)

    // Validate rule: max 4 images OR 1 video/gif
    const images = files.filter(f => f.mimetype.startsWith('image/') && f.mimetype !== 'image/gif')
    const gifs = files.filter(f => f.mimetype === 'image/gif')
    const videos = files.filter(f => f.mimetype.startsWith('video/'))
    if (videos.length + gifs.length > 1) throw createError('Only one video or GIF allowed', 400)
    if ((videos.length > 0 || gifs.length > 0) && files.length > 1) throw createError('Cannot mix video/GIF with other files', 400)
    if (images.length > 4) throw createError('Up to 4 images allowed', 400)

    const basePath = '/uploads'
    const created = await Promise.all(
      files.map(file => {
        const ext = path.extname(file.filename).toLowerCase()
        let fileType: 'image' | 'video' | 'gif' = 'image'
        if (file.mimetype === 'image/gif' || ext === '.gif') fileType = 'gif'
        else if (file.mimetype.startsWith('video/')) fileType = 'video'
        return prisma.media.create({
          data: {
            tweetId: id,
            fileUrl: path.posix.join(basePath, file.filename),
            fileType,
            fileSize: file.size
          }
        })
      })
    )

    res.status(201).json({ success: true, message: 'Media uploaded', data: created })
  } catch (error) {
    next(error)
  }
})

// Like/Unlike tweet
router.post('/:id/like', authenticate, async (req: AuthRequest, res: any, next: any) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    // Check if tweet exists
    const tweet = await prisma.tweet.findUnique({
      where: { id, isDeleted: false },
      select: { userId: true, likesCount: true }
    })

    if (!tweet) {
      throw createError('Tweet not found', 404)
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_tweetId: {
          userId: userId,
          tweetId: id
        }
      }
    })

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { id: existingLike.id }
      })

      await prisma.tweet.update({
        where: { id },
        data: { likesCount: { decrement: 1 } }
      })

      res.json({
        success: true,
        message: 'Tweet unliked successfully'
      })
    } else {
      // Like
      await prisma.like.create({
        data: {
          userId: userId,
          tweetId: id
        }
      })

      await prisma.tweet.update({
        where: { id },
        data: { likesCount: { increment: 1 } }
      })

      // Create notification for tweet author (if not liking own tweet)
      if (tweet.userId !== userId) {
        await prisma.notification.create({
          data: {
            userId: tweet.userId,
            type: 'LIKE',
            actorId: userId,
            tweetId: id
          }
        })
      }

      res.json({
        success: true,
        message: 'Tweet liked successfully'
      })
    }
  } catch (error) {
    next(error)
  }
})

// Retweet/Unretweet
router.post('/:id/retweet', authenticate, async (req: AuthRequest, res: any, next: any) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    // Check if original tweet exists
    const originalTweet = await prisma.tweet.findUnique({
      where: { id, isDeleted: false },
      select: { userId: true, retweetsCount: true }
    })

    if (!originalTweet) {
      throw createError('Tweet not found', 404)
    }

    // Check if already retweeted
    const existingRetweet = await prisma.tweet.findFirst({
      where: {
        userId: userId,
        retweetId: id,
        isDeleted: false
      }
    })

    if (existingRetweet) {
      // Unretweet
      await prisma.tweet.update({
        where: { id: existingRetweet.id },
        data: { isDeleted: true }
      })

      await prisma.tweet.update({
        where: { id },
        data: { retweetsCount: { decrement: 1 } }
      })

      res.json({
        success: true,
        message: 'Retweet removed successfully'
      })
    } else {
      // Retweet
      await prisma.tweet.create({
        data: {
          userId: userId,
          content: '',
          retweetId: id
        }
      })

      await prisma.tweet.update({
        where: { id },
        data: { retweetsCount: { increment: 1 } }
      })

      // Create notification for original tweet author (if not retweeting own tweet)
      if (originalTweet.userId !== userId) {
        await prisma.notification.create({
          data: {
            userId: originalTweet.userId,
            type: 'RETWEET',
            actorId: userId,
            tweetId: id
          }
        })
      }

      res.json({
        success: true,
        message: 'Tweet retweeted successfully'
      })
    }
  } catch (error) {
    next(error)
  }
})

// Delete tweet
router.delete('/:id', authenticate, async (req: AuthRequest, res: any, next: any) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    // Check if tweet exists and user owns it
    const tweet = await prisma.tweet.findUnique({
      where: { id },
      select: { userId: true, isDeleted: true }
    })

    if (!tweet || tweet.isDeleted) {
      throw createError('Tweet not found', 404)
    }

    if (tweet.userId !== userId) {
      throw createError('You can only delete your own tweets', 403)
    }

    // Soft delete
    await prisma.tweet.update({
      where: { id },
      data: { isDeleted: true }
    })

    // Update user's tweet count
    await prisma.user.update({
      where: { id: userId },
      data: { tweetsCount: { decrement: 1 } }
    })

    res.json({
      success: true,
      message: 'Tweet deleted successfully'
    })
  } catch (error) {
    next(error)
  }
})

// Get tweet by ID (placed after specific routes to avoid matching conflicts)
router.get('/:id', optionalAuth, async (req: any, res: any, next: any) => {
  try {
    const { id } = req.params
    const currentUserId = req.user?.id

    const tweet = await prisma.tweet.findUnique({
      where: { id, isDeleted: false },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            isVerified: true,
            isPrivate: true
          }
        },
        media: true,
        originalTweet: {
          include: {
            user: { select: { id: true, username: true, fullName: true, avatarUrl: true, isVerified: true } },
            media: true
          }
        },
        parentTweet: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatarUrl: true,
                isVerified: true
              }
            }
          }
        },
        _count: {
          select: {
            likes: true,
            retweets: true,
            replies: true
          }
        }
      }
    })

    if (!tweet) {
      throw createError('Tweet not found', 404)
    }

    // Check if current user liked this tweet
    let isLiked = false
    if (currentUserId) {
      const like = await prisma.like.findUnique({
        where: {
          userId_tweetId: {
            userId: currentUserId,
            tweetId: id
          }
        }
      })
      isLiked = !!like
    }

    // Increment view count
    await prisma.tweet.update({
      where: { id },
      data: { viewsCount: { increment: 1 } }
    })

    res.json({
      success: true,
      data: {
        ...tweet,
        isLiked
      }
    })
  } catch (error) {
    next(error)
  }
})

export { router as tweetRoutes }
