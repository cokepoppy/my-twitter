import { createServer } from 'http'
import { Server } from 'socket.io'
import { initializeSocket } from './services/socketService'
import { createApp } from './app'

const app = createApp()
const server = createServer(app)
// Socket.IO CORS allowlist (array)
const socketOriginsRaw =
  process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:3000'
const socketOrigins = socketOriginsRaw
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)
  .map(s => s.replace(/\/$/, ''))

const io = new Server(server, {
  cors: {
    origin: socketOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
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
