import { Router } from 'express'
import { query, validationResult } from 'express-validator'
import { optionalAuth } from '../middleware/auth'
import { createError } from '../middleware/errorHandler'
import { prisma } from '../config/database'

const router = Router()

// Global search
router.get('/', [
  query('q')
    .notEmpty()
    .withMessage('Search query is required'),
  query('type')
    .optional()
    .isIn(['all', 'users', 'tweets'])
    .withMessage('Type must be all, users, or tweets'),
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

    const { q, type = 'all', page = 1, limit = 20 } = req.query
    const currentUserId = req.user?.id
    const searchQuery = q as string

    const results: any = { users: [], tweets: [] }

    if (type === 'all' || type === 'users') {
      // Search users
      const [users, totalUsers] = await Promise.all([
        prisma.user.findMany({
          where: {
            OR: [
              {
                username: {
                  contains: searchQuery,
                  mode: 'insensitive'
                }
              },
              {
                fullName: {
                  contains: searchQuery,
                  mode: 'insensitive'
                }
              }
            ],
            isPrivate: false // Only search public users
          },
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            isVerified: true,
            followersCount: true,
            followingCount: true,
            bio: true
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
                  contains: searchQuery,
                  mode: 'insensitive'
                }
              },
              {
                fullName: {
                  contains: searchQuery,
                  mode: 'insensitive'
                }
              }
            ],
            isPrivate: false
          }
        })
      ])

      // Check follow status for each user
      const usersWithFollowStatus = await Promise.all(
        users.map(async (user: any) => {
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
          return { ...user, isFollowing }
        })
      )

      results.users = usersWithFollowStatus
      results.totalUsers = totalUsers
    }

    if (type === 'all' || type === 'tweets') {
      // Get users that current user follows (for timeline context)
      let followingIds: string[] = []
      if (currentUserId) {
        const following = await prisma.follow.findMany({
          where: { followerId: currentUserId },
          select: { followingId: true }
        })
        followingIds = following.map((f: any) => f.followingId)
        followingIds.push(currentUserId) // Include own tweets
      }

      // Search tweets
      const [tweets, totalTweets] = await Promise.all([
        prisma.tweet.findMany({
          where: {
            content: {
              contains: searchQuery,
              mode: 'insensitive'
            },
            isDeleted: false,
            // If not authenticated, only show public tweets
            ...(currentUserId ? {} : {
              user: { isPrivate: false }
            })
          },
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
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.tweet.count({
          where: {
            content: {
              contains: searchQuery,
              mode: 'insensitive'
            },
            isDeleted: false,
            ...(currentUserId ? {} : {
              user: { isPrivate: false }
            })
          }
        })
      ])

      // Check like status for each tweet
      const tweetsWithLikeStatus = await Promise.all(
        tweets.map(async (tweet: any) => {
          let isLiked = false
          if (currentUserId) {
            const like = await prisma.like.findUnique({
              where: {
                userId_tweetId: {
                  userId: currentUserId,
                  tweetId: tweet.id
                }
              }
            })
            isLiked = !!like
          }
          return { ...tweet, isLiked }
        })
      )

      results.tweets = tweetsWithLikeStatus
      results.totalTweets = totalTweets
    }

    res.json({
      success: true,
      data: results,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: type === 'all' ? Math.max(results.totalUsers || 0, results.totalTweets || 0) :
              type === 'users' ? results.totalUsers : results.totalTweets,
        totalPages: type === 'all' ?
          Math.ceil(Math.max(results.totalUsers || 0, results.totalTweets || 0) / limit) :
          type === 'users' ?
          Math.ceil((results.totalUsers || 0) / limit) :
          Math.ceil((results.totalTweets || 0) / limit)
      }
    })
  } catch (error) {
    next(error)
  }
})

// Search trending topics
router.get('/trending', async (req: any, res: any, next: any) => {
  try {
    // Get trending hashtags (simplified implementation)
    // In a real implementation, you'd extract hashtags from tweets and count them

    // For now, return some mock trending topics
    const trendingTopics = [
      { hashtag: '#technology', count: 15420, trend: 'up' },
      { hashtag: '#programming', count: 12300, trend: 'up' },
      { hashtag: '#webdev', count: 8900, trend: 'stable' },
      { hashtag: '#javascript', count: 7600, trend: 'up' },
      { hashtag: '#coding', count: 6500, trend: 'down' }
    ]

    res.json({
      success: true,
      data: trendingTopics
    })
  } catch (error) {
    next(error)
  }
})

// Search suggestions (autocomplete)
router.get('/suggestions', [
  query('q')
    .notEmpty()
    .withMessage('Search query is required'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Limit must be between 1 and 10')
], async (req: any, res: any, next: any) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw createError(errors.array()[0].msg, 400)
    }

    const { q, limit = 5 } = req.query
    const searchQuery = q as string

    // Search users for autocomplete
    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            username: {
              startsWith: searchQuery,
              mode: 'insensitive'
            }
          },
          {
            fullName: {
              contains: searchQuery,
              mode: 'insensitive'
            }
          }
        ],
        isPrivate: false
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        isVerified: true
      },
      take: Number(limit),
      orderBy: { followersCount: 'desc' }
    })

    // Search hashtags (simplified)
    const hashtags = [
      `#${searchQuery}technology`,
      `#${searchQuery}programming`,
      `#${searchQuery}webdev`
    ].slice(0, 3)

    res.json({
      success: true,
      data: {
        users,
        hashtags
      }
    })
  } catch (error) {
    next(error)
  }
})

// Advanced search with filters
router.post('/advanced', [
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

    const { query: searchQuery, filters } = req.body
    const { page = 1, limit = 20 } = req.query as any
    const currentUserId = req.user?.id

    if (!searchQuery) {
      throw createError('Search query is required', 400)
    }

    let whereClause: any = {
      content: {
        contains: searchQuery,
        mode: 'insensitive'
      },
      isDeleted: false
    }

    // Apply filters
    if (filters) {
      if (filters.fromUser) {
        whereClause.userId = filters.fromUser
      }

      if (filters.dateFrom) {
        whereClause.createdAt = {
          gte: new Date(filters.dateFrom)
        }
      }

      if (filters.dateTo) {
        whereClause.createdAt = {
          ...whereClause.createdAt,
          lte: new Date(filters.dateTo)
        }
      }

      if (filters.hasMedia) {
        whereClause.media = {
          some: {}
        }
      }

      if (filters.isReply !== undefined) {
        whereClause.replyToTweetId = filters.isReply ? { not: null } : null
      }

      if (filters.minLikes) {
        whereClause.likesCount = {
          gte: filters.minLikes
        }
      }

      if (filters.minRetweets) {
        whereClause.retweetsCount = {
          gte: filters.minRetweets
        }
      }
    }

    // Filter by private accounts if not authenticated
    if (!currentUserId) {
      whereClause.user = { isPrivate: false }
    }

    const [tweets, total] = await Promise.all([
      prisma.tweet.findMany({
        where: whereClause,
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
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.tweet.count({ where: whereClause })
    ])

    // Check like status for each tweet
    const tweetsWithLikeStatus = await Promise.all(
      tweets.map(async (tweet: any) => {
        let isLiked = false
        if (currentUserId) {
          const like = await prisma.like.findUnique({
            where: {
              userId_tweetId: {
                userId: currentUserId,
                tweetId: tweet.id
              }
            }
          })
          isLiked = !!like
        }
        return { ...tweet, isLiked }
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

export { router as searchRoutes }