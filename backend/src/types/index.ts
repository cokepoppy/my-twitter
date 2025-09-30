export interface User {
  id: string
  username: string
  email: string
  fullName: string
  bio?: string
  location?: string
  website?: string
  avatarUrl?: string
  headerUrl?: string
  birthDate?: Date
  isVerified: boolean
  isPrivate: boolean
  followersCount: number
  followingCount: number
  tweetsCount: number
  createdAt: Date
  updatedAt: Date
}

export interface Tweet {
  id: string
  userId: string
  content: string
  replyToTweetId?: string
  replyToUserId?: string
  retweetId?: string
  viewsCount: number
  likesCount: number
  retweetsCount: number
  repliesCount: number
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Media {
  id: string
  tweetId: string
  fileUrl: string
  fileType: 'image' | 'video' | 'gif'
  fileSize: number
  width?: number
  height?: number
  duration?: number
  thumbnailUrl?: string
  createdAt: Date
}

export interface Follow {
  id: string
  followerId: string
  followingId: string
  createdAt: Date
}

export interface Like {
  id: string
  userId: string
  tweetId: string
  createdAt: Date
}

export interface Notification {
  id: string
  userId: string
  type: 'LIKE' | 'FOLLOW' | 'REPLY' | 'RETWEET' | 'MENTION' | 'FOLLOW_REQUEST' | 'FOLLOW_REQUEST_APPROVED'
  actorId: string
  tweetId?: string
  isRead: boolean
  createdAt: Date
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  isRead: boolean
  createdAt: Date
}

export interface Conversation {
  id: string
  user1Id: string
  user2Id: string
  lastMessageId?: string
  createdAt: Date
  updatedAt: Date
}

// Request/Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form types
export interface RegisterUserDto {
  username: string
  email: string
  password: string
  fullName?: string
}

export interface LoginUserDto {
  email: string
  password: string
}

export interface CreateTweetDto {
  content: string
  replyToTweetId?: string
}

export interface UpdateUserDto {
  fullName?: string
  bio?: string
  location?: string
  website?: string
  isPrivate?: boolean
}

export interface ChangePasswordDto {
  currentPassword: string
  newPassword: string
}

// Query types
export interface PaginationQuery {
  page?: number
  limit?: number
}

export interface TweetQuery extends PaginationQuery {
  userId?: string
  type?: 'tweets' | 'replies' | 'media' | 'likes'
}

export interface UserQuery extends PaginationQuery {
  search?: string
}

export interface SearchQuery extends PaginationQuery {
  q: string
  type?: 'users' | 'tweets' | 'all'
}

// Socket types
export interface SocketUser {
  id: string
  username: string
  socketId: string
}

export interface SocketMessage {
  type: 'new_tweet' | 'new_like' | 'new_retweet' | 'new_follow' | 'new_notification' | 'new_message'
  data: any
  to?: string // userId or roomId
}
