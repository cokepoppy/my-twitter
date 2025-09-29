export interface User {
  id: number
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
  id: number
  userId: number
  content: string
  replyToTweetId?: number
  replyToUserId?: number
  retweetId?: number
  viewsCount: number
  likesCount: number
  retweetsCount: number
  repliesCount: number
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Media {
  id: number
  tweetId: number
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
  id: number
  followerId: number
  followingId: number
  createdAt: Date
}

export interface Like {
  id: number
  userId: number
  tweetId: number
  createdAt: Date
}

export interface Notification {
  id: number
  userId: number
  type: 'like' | 'follow' | 'reply' | 'retweet' | 'follow_request' | 'follow_request_approved'
  actorId: number
  tweetId?: number
  isRead: boolean
  createdAt: Date
}

export interface Message {
  id: number
  senderId: number
  receiverId: number
  content: string
  isRead: boolean
  createdAt: Date
}

export interface Conversation {
  id: number
  user1Id: number
  user2Id: number
  lastMessageId?: number
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
  replyToTweetId?: number
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
  userId?: number
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
  id: number
  username: string
  socketId: string
}

export interface SocketMessage {
  type: 'new_tweet' | 'new_like' | 'new_retweet' | 'new_follow' | 'new_notification' | 'new_message'
  data: any
  to?: string | number // userId or roomId
}
