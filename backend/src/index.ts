import { createServer } from 'http'
import { Server } from 'socket.io'
import { initializeSocket } from './services/socketService'
import { createApp } from './app'

const app = createApp()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
})

// Initialize Socket.IO
initializeSocket(io)

// Make io accessible to routes
app.set('io', io)

const PORT = process.env.PORT || 8000

server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`)
  console.log(`📡 Socket.IO server is ready`)
})

export { app, io }
import 'dotenv/config'
