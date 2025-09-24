import { Server, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import { prisma } from '../config/database'

interface AuthenticatedSocket extends Socket {
  user?: {
    id: string
    username: string
    email: string
  }
}

// Extend the Socket.IO Server type to include custom methods
declare module 'socket.io' {
  interface Server {
    sendNotification: (userId: string, notification: any) => void;
    sendTweetUpdate: (tweetId: string, updateType: string, data: any) => void;
  }
}

const onlineUsers = new Map<string, string>() // userId -> socketId

export const initializeSocket = (io: Server) => {
  // Authentication middleware
  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token

      if (!token) {
        return next(new Error('Authentication error'))
      }

      if (!process.env.JWT_SECRET) {
        return next(new Error('JWT secret is not configured'))
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET) as any
      socket.user = decoded
      next()
    } catch (error) {
      next(new Error('Authentication error'))
    }
  })

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.user?.username} connected`)

    if (socket.user) {
      // Store user's socket ID
      onlineUsers.set(socket.user.id, socket.id)

      // Join user to their personal room for notifications
      socket.join(`user:${socket.user.id}`)

      // Broadcast user online status
      socket.broadcast.emit('user:online', {
        userId: socket.user.id,
        username: socket.user.username
      })
    }

    // Handle joining tweet rooms for real-time updates
    socket.on('tweet:join', (tweetId: string) => {
      socket.join(`tweet:${tweetId}`)
    })

    // Handle leaving tweet rooms
    socket.on('tweet:leave', (tweetId: string) => {
      socket.leave(`tweet:${tweetId}`)
    })

    // Handle joining conversation rooms for messaging
    socket.on('conversation:join', (userId: string) => {
      const roomId = [socket.user?.id, userId].sort().join('-')
      socket.join(`conversation:${roomId}`)
    })

    // Handle sending messages in real-time
    socket.on('message:send', async (data: { receiverId: string; content: string }) => {
      try {
        if (!socket.user) return

        const { receiverId, content } = data

        // Create message in database
        const message = await prisma.message.create({
          data: {
            senderId: socket.user.id,
            receiverId,
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

        // Get room ID
        const roomId = [socket.user.id, receiverId].sort().join('-')

        // Emit message to conversation room
        io.to(`conversation:${roomId}`).emit('message:new', message)

        // Send notification to receiver if they're in their personal room
        const receiverSocketId = onlineUsers.get(receiverId)
        if (receiverSocketId) {
          io.to(`user:${receiverId}`).emit('notification:new', {
            type: 'message',
            message: 'New message received',
            data: message
          })
        }
      } catch (error) {
        console.error('Error sending message:', error)
        socket.emit('error', { message: 'Failed to send message' })
      }
    })

    // Handle typing indicators
    socket.on('typing:start', (data: { receiverId: string }) => {
      const { receiverId } = data
      const roomId = [socket.user?.id, receiverId].sort().join('-')

      socket.to(`conversation:${roomId}`).emit('user:typing', {
        userId: socket.user?.id,
        username: socket.user?.username,
        isTyping: true
      })
    })

    socket.on('typing:stop', (data: { receiverId: string }) => {
      const { receiverId } = data
      const roomId = [socket.user?.id, receiverId].sort().join('-')

      socket.to(`conversation:${roomId}`).emit('user:typing', {
        userId: socket.user?.id,
        username: socket.user?.username,
        isTyping: false
      })
    })

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.user?.username} disconnected`)

      if (socket.user) {
        // Remove from online users
        onlineUsers.delete(socket.user.id)

        // Broadcast user offline status
        socket.broadcast.emit('user:offline', {
          userId: socket.user.id,
          username: socket.user.username
        })
      }
    })
  })

  // Helper function to send notifications
  io.sendNotification = (userId: string, notification: any) => {
    io.to(`user:${userId}`).emit('notification:new', notification)
  }

  // Helper function to send real-time tweet updates
  io.sendTweetUpdate = (tweetId: string, updateType: string, data: any) => {
    io.to(`tweet:${tweetId}`).emit(`tweet:${updateType}`, data)
  }

  return io
}

// Export helper functions for use in routes
export const getOnlineUsers = () => Array.from(onlineUsers.keys())

export const isUserOnline = (userId: string) => onlineUsers.has(userId)

export const sendNotificationToUser = (io: Server, userId: string, notification: any) => {
  io.to(`user:${userId}`).emit('notification:new', notification)
}

export const sendTweetUpdate = (io: Server, tweetId: string, updateType: string, data: any) => {
  io.to(`tweet:${tweetId}`).emit(`tweet:${updateType}`, data)
}