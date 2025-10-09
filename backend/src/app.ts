import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import path from 'path'

import { errorHandler } from './middleware/errorHandler'
import { notFoundHandler } from './middleware/notFoundHandler'
import { authRoutes } from './routes/auth'
import { userRoutes } from './routes/users'
import { tweetRoutes } from './routes/tweets'
import { followRoutes } from './routes/follows'
import { notificationRoutes } from './routes/notifications'
import { messageRoutes } from './routes/messages'
import { searchRoutes } from './routes/search'

export const createApp = () => {
  const app = express()

  // Build CORS allowlist from env
  const rawOrigins =
    process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:3000'
  const allowlist = rawOrigins
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => s.replace(/\/$/, ''))

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
  })

  app.use(helmet())
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow non-browser or same-origin requests without Origin header
        if (!origin) return callback(null, true)
        const normalized = origin.replace(/\/$/, '')
        if (allowlist.includes(normalized)) return callback(null, true)
        return callback(new Error('Not allowed by CORS'))
      },
      credentials: true,
    })
  )
  app.use(compression())
  app.use(morgan('combined'))
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true }))
  app.use(limiter)

  const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads')
  app.use('/uploads', express.static(uploadDir))

  app.use('/api/auth', authRoutes)
  app.use('/api/users', userRoutes)
  app.use('/api/tweets', tweetRoutes)
  app.use('/api/follows', followRoutes)
  app.use('/api/notifications', notificationRoutes)
  app.use('/api/messages', messageRoutes)
  app.use('/api/search', searchRoutes)

  app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() })
  })

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
import 'dotenv/config'
