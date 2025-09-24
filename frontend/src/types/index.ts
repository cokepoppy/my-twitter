// User types
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
  followersCount: number
  followingCount: number
  tweetsCount: number
  isVerified: boolean
  isPrivate: boolean
  createdAt: string
  updatedAt: string
}

// Tweet types
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
  createdAt: string
  updatedAt: string
  user: User
  media?: Media[]
  isLiked?: boolean
  isRetweeted?: boolean
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
  createdAt: string
}

// Follow types
export interface Follow {
  id: number
  followerId: number
  followingId: number
  createdAt: string
  follower: User
  following: User
}

// Like types
export interface Like {
  id: number
  userId: number
  tweetId: number
  createdAt: string
  user: User
  tweet: Tweet
}

// Notification types
export interface Notification {
  id: number
  userId: number
  type: 'like' | 'follow' | 'reply' | 'retweet'
  actorId: number
  tweetId?: number
  isRead: boolean
  createdAt: string
  actor: User
  tweet?: Tweet
}

// Message types
export interface Message {
  id: number
  senderId: number
  receiverId: number
  content: string
  isRead: boolean
  createdAt: string
  sender: User
  receiver: User
}

// Conversation types
export interface Conversation {
  id: number
  user1Id: number
  user2Id: number
  lastMessageId?: number
  createdAt: string
  updatedAt: string
  user1: User
  user2: User
  lastMessage?: Message
}

// Trend types
export interface Trend {
  id: number
  title: string
  category?: string
  tweetCount: number
  location?: string
  createdAt: string
}

// API Response types
export interface ApiResponse<T> {
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
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  username: string
  email: string
  password: string
  fullName?: string
}

export interface CreateTweetForm {
  content: string
  replyToTweetId?: number
}

export interface UpdateProfileForm {
  fullName?: string
  bio?: string
  location?: string
  website?: string
}

// Search types
export interface SearchResult {
  users: User[]
  tweets: Tweet[]
  trends: Trend[]
}

// Socket types
export interface SocketMessage {
  type: 'new_tweet' | 'new_like' | 'new_retweet' | 'new_follow' | 'new_notification'
  data: any
}