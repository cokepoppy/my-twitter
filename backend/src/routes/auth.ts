import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from '../config/database'
import crypto from 'crypto'
import https from 'https'
import { URL } from 'url'
import { authenticate, AuthRequest } from '../middleware/auth'
import { createError } from '../middleware/errorHandler'
import { RegisterUserDto, LoginUserDto, User } from '../types'

const router = Router()

// Register
router.post('/register', [
  body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('fullName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Full name must be less than 50 characters')
], async (req: any, res: any, next: any) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw createError(errors.array()[0].msg, 400)
    }

    const { username, email, password, fullName }: RegisterUserDto = req.body

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    })

    if (existingUser) {
      throw createError('Username or email already exists', 409)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash: hashedPassword,
        fullName: fullName || username
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        bio: true,
        location: true,
        website: true,
        avatarUrl: true,
        headerUrl: true,
        isVerified: true,
        isPrivate: true,
        followersCount: true,
        followingCount: true,
        tweetsCount: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    })
  } catch (error) {
    next(error)
  }
})

// Login
router.post('/login', [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], async (req: any, res: any, next: any) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw createError(errors.array()[0].msg, 400)
    }

    const { email, password }: LoginUserDto = req.body

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      throw createError('Invalid credentials', 401)
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
    if (!isPasswordValid) {
      throw createError('Invalid credentials', 401)
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      bio: user.bio,
      location: user.location,
      website: user.website,
      avatarUrl: user.avatarUrl,
      headerUrl: user.headerUrl,
      isVerified: user.isVerified,
      isPrivate: user.isPrivate,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      tweetsCount: user.tweetsCount,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token
      }
    })
  } catch (error) {
    next(error)
  }
})

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res: any, next: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        bio: true,
        location: true,
        website: true,
        avatarUrl: true,
        headerUrl: true,
        isVerified: true,
        isPrivate: true,
        followersCount: true,
        followingCount: true,
        tweetsCount: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      throw createError('User not found', 404)
    }

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    next(error)
  }
})

// Refresh token
router.post('/refresh', authenticate, async (req: AuthRequest, res: any, next: any) => {
  try {
    const token = jwt.sign(
      { id: req.user!.id, username: req.user!.username, email: req.user!.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      data: { token }
    })
  } catch (error) {
    next(error)
  }
})

// Logout (client-side token removal)
router.post('/logout', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  })
})

// Auth configuration (for frontend to detect feature availability)
router.get('/config', (req, res) => {
  const googleEnabled = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
  res.json({ success: true, data: { googleEnabled } })
})

// --- Google OAuth ---
// Start Google OAuth flow
router.get('/google', async (req, res, next) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID
    if (!clientId) {
      const frontend = process.env.FRONTEND_URL || 'http://localhost:3000'
      const redirect = `${frontend.replace(/\/$/, '')}/login-v2?error=google_disabled`
      return res.redirect(redirect)
    }

    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/auth/google/callback`
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      prompt: 'select_account',
      access_type: 'offline',
      include_granted_scopes: 'true'
    })

    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    if (process.env.NODE_ENV !== 'production') {
      console.log('Google OAuth start', {
        host: req.get('host'),
        protocol: req.protocol,
        redirectUri,
        hasClientId: !!clientId
      })
    }
    res.redirect(url)
  } catch (error) {
    try {
      const frontend = process.env.FRONTEND_URL || 'http://localhost:3000'
      const redirect = `${frontend.replace(/\/$/, '')}/login-v2?error=google_login_failed`
      return res.redirect(redirect)
    } catch (_) {
      next(error)
    }
  }
})

// Google OAuth callback
router.get('/google/callback', async (req: any, res: any, next: any) => {
  try {
    const code = req.query.code as string
    if (!code) {
      throw createError('Missing authorization code', 400)
    }

    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    if (!clientId || !clientSecret) {
      throw createError('Google OAuth is not configured', 500)
    }

    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/auth/google/callback`

    const tokenJson: any = await postForm('https://oauth2.googleapis.com/token', {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    })
    const idToken = tokenJson.id_token as string | undefined

    let email: string | undefined
    let name: string | undefined
    let picture: string | undefined

    // Try decode id_token first
    if (idToken) {
      try {
        const payloadPart = idToken.split('.')[1]
        // base64url -> base64
        const b64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (payloadPart.length % 4)) % 4)
        const payloadJson = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'))
        email = payloadJson.email
        name = payloadJson.name
        picture = payloadJson.picture
      } catch (_) {
        // fallback below
      }
    }

    // Fallback to userinfo endpoint if email not found
    if (!email && tokenJson.access_token) {
      const info: any = await getJson('https://www.googleapis.com/oauth2/v3/userinfo', {
        Authorization: `Bearer ${tokenJson.access_token}`
      })
      email = info.email
      name = info.name || info.given_name || info.email?.split('@')[0]
      picture = info.picture
    }

    if (!email) {
      throw createError('Failed to obtain Google account email', 400)
    }

    // Find or create user by email
    let user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      // Generate a unique username from email local part
      const base = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 20) || 'user'
      let candidate = base
      let suffix = 1
      // Ensure uniqueness
      while (await prisma.user.findUnique({ where: { username: candidate } })) {
        const add = String(suffix++)
        candidate = (base + add).slice(0, 20)
      }

      // Random password since Google users won't use it
      const randomPwd = crypto.randomBytes(16).toString('hex')
      const passwordHash = await bcrypt.hash(randomPwd, 10)

      user = await prisma.user.create({
        data: {
          username: candidate,
          email,
          passwordHash,
          fullName: name || candidate,
          avatarUrl: picture || undefined,
        }
      })
    }

    // Create our JWT
    const appToken = jwt.sign(
      { id: (user as any).id, username: (user as any).username, email: (user as any).email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    const frontend = process.env.FRONTEND_URL || 'http://localhost:3000'
    const redirect = `${frontend.replace(/\/$/, '')}/auth/callback?token=${encodeURIComponent(appToken)}`
    res.redirect(redirect)
  } catch (error: any) {
    // Log for troubleshooting during development
    console.error('Google OAuth callback error:', error?.message || error)
    // On error, navigate back to login-v2 with a generic error message
    const frontend = process.env.FRONTEND_URL || 'http://localhost:3000'
    const debug = process.env.NODE_ENV !== 'production' && error?.message ? `&debug=${encodeURIComponent(error.message)}` : ''
    const redirect = `${frontend.replace(/\/$/, '')}/login-v2?error=google_login_failed${debug}`
    try {
      res.redirect(redirect)
    } catch (_) {
      next(error)
    }
  }
})

// Helpers: minimal HTTPS client to avoid fetch dependency
function getProxyAgent() {
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy
  if (!proxy) return undefined
  try {
    // Lazy require to avoid build-time issues if not installed
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { HttpsProxyAgent } = require('https-proxy-agent')
    return new HttpsProxyAgent(proxy)
  } catch (e) {
    console.warn('Proxy agent not available, install https-proxy-agent to enable proxy support')
    return undefined
  }
}

function postForm(urlStr: string, data: Record<string, string>): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr)
    const body = new URLSearchParams(data).toString()
    const agent = getProxyAgent()
    const req = https.request(
      {
        method: 'POST',
        hostname: url.hostname,
        path: url.pathname + url.search,
        port: url.port || 443,
        agent,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(body)
        }
      },
      res => {
        let chunks: Buffer[] = []
        res.on('data', d => chunks.push(Buffer.isBuffer(d) ? d : Buffer.from(d)))
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8')
          try {
            const json = JSON.parse(text)
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              resolve(json)
            } else {
              reject(new Error(json.error_description || json.error || `HTTP ${res.statusCode}`))
            }
          } catch (e) {
            reject(new Error(`Invalid JSON from ${urlStr}`))
          }
        })
      }
    )
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

function getJson(urlStr: string, headers: Record<string, string> = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr)
    const agent = getProxyAgent()
    const req = https.request(
      {
        method: 'GET',
        hostname: url.hostname,
        path: url.pathname + url.search,
        port: url.port || 443,
        agent,
        headers
      },
      res => {
        let chunks: Buffer[] = []
        res.on('data', d => chunks.push(Buffer.isBuffer(d) ? d : Buffer.from(d)))
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8')
          try {
            const json = JSON.parse(text)
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              resolve(json)
            } else {
              reject(new Error(json.error_description || json.error || `HTTP ${res.statusCode}`))
            }
          } catch (e) {
            reject(new Error(`Invalid JSON from ${urlStr}`))
          }
        })
      }
    )
    req.on('error', reject)
    req.end()
  })
}

export { router as authRoutes }
