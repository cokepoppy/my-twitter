import { Router } from 'express'
import { body, validationResult, query } from 'express-validator'
import { authenticate, AuthRequest, optionalAuth } from '../middleware/auth'
import { createError } from '../middleware/errorHandler'
import { prisma } from '../config/database'
import { CreateTweetDto, PaginationQuery } from '../types'

const router = Router()

// Create tweet
router.post('/', authenticate, [
  body('content')
    .isLength({ min: 1, max: 280 })
    .withMessage('Tweet content must be between 1 and 280 characters'),
  body('replyToTweetId')
    .optional()
    .isUUID()
    .withMessage('Invalid tweet ID for reply')
], async (req: AuthRequest, res: any, next: any) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw createError(errors.array()[0].msg, 400)
    }

    const { content, replyToTweetId }: CreateTweetDto = req.body
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

    // Create tweet
    const tweet = await prisma.tweet.create({
      data: {
        userId,
        content,
        replyToTweetId,
        replyToUserId
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

    res.status(201).json({
      success: true,
      message: 'Tweet created successfully',
      data: tweet
    })
  } catch (error) {
    next(error)
  }
})

// Get tweet by ID
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
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' }
          }),
          prisma.like.count({ where: { userId: user.id } })
        ])

        return res.json({
          success: true,
          data: likedTweets.map((like: any) => like.tweet),
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / limit)
          }
        })
    }

    const [tweets, total] = await Promise.all([
      prisma.tweet.findMany({
        where: whereClause,
        include: includeClause,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.tweet.count({ where: whereClause })
    ])

    res.json({
      success: true,
      data: tweets,
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
        skip: (page - 1) * limit,
        take: limit,
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

export { router as tweetRoutes }