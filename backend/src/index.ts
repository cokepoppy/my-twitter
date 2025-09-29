import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import { createServer } from 'http'
import { Server } from 'socket.io'
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

import { initializeSocket } from './services/socketService'

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
})

// Initialize Socket.IO
initializeSocket(io)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(compression())
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(limiter)

// Static uploads
const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads')
app.use('/uploads', express.static(uploadDir))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/tweets', tweetRoutes)
app.use('/api/follows', followRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/search', searchRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Error handling
app.use(notFoundHandler)
app.use(errorHandler)

// Make io accessible to routes
app.set('io', io)

const PORT = process.env.PORT || 8000

server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`)
  console.log(`📡 Socket.IO server is ready`)
})

export { app, io }
