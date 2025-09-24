# Twitter Clone 技术实施方案

## 技术栈选择

### 前端技术栈
- **Vue 3.4+** - 主框架，使用 Composition API
- **TypeScript** - 类型安全
- **Pinia** - 状态管理
- **Vue Router** - 路由管理
- **TailwindCSS** - UI框架
- **Headless UI** - 无障碍组件
- **Axios** - HTTP客户端
- **Socket.io-client** - 实时通信

### 后端技术栈
- **Node.js 20+** - 运行时环境
- **Express.js** - Web框架
- **TypeScript** - 类型安全
- **Prisma** - ORM
- **MySQL 8.0** - 主数据库
- **Redis** - 缓存和队列
- **Socket.io** - 实时通信
- **JWT** - 认证
- **Bcrypt** - 密码加密
- **Multer** - 文件上传

### 开发工具
- **Vite** - 构建工具
- **ESLint** - 代码规范
- **Prettier** - 代码格式化
- **Husky** - Git hooks
- **Docker** - 容器化
- **Jest** - 测试框架

## 项目结构

```
my-twitter/
├── frontend/                 # Vue3前端
│   ├── src/
│   │   ├── components/      # 公共组件
│   │   │   ├── common/     # 通用组件
│   │   │   ├── layout/     # 布局组件
│   │   │   └── tweet/      # 推文相关组件
│   │   ├── views/          # 页面组件
│   │   ├── stores/         # Pinia状态管理
│   │   ├── utils/          # 工具函数
│   │   ├── assets/         # 静态资源
│   │   ├── api/            # API接口
│   │   ├── types/          # TypeScript类型
│   │   └── plugins/        # 插件配置
│   ├── public/
│   └── package.json
├── backend/                 # Express后端
│   ├── src/
│   │   ├── controllers/    # 控制器
│   │   ├── models/         # 数据模型
│   │   ├── routes/         # 路由
│   │   ├── middleware/     # 中间件
│   │   ├── services/       # 业务逻辑
│   │   ├── utils/          # 工具函数
│   │   └── types/          # TypeScript类型
│   ├── config/             # 配置文件
│   ├── prisma/             # 数据库模式
│   └── package.json
├── database/               # 数据库相关
│   ├── migrations/         # 数据库迁移
│   └── seeds/             # 种子数据
├── docker/                # Docker配置
└── docs/                  # 文档
```

## 数据库设计

### 用户表 (users)
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    bio TEXT,
    location VARCHAR(100),
    website VARCHAR(255),
    avatar_url VARCHAR(255),
    header_url VARCHAR(255),
    birth_date DATE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_private BOOLEAN DEFAULT FALSE,
    followers_count INT DEFAULT 0,
    following_count INT DEFAULT 0,
    tweets_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 推文表 (tweets)
```sql
CREATE TABLE tweets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    reply_to_tweet_id BIGINT,
    reply_to_user_id BIGINT,
    retweet_id BIGINT,
    views_count INT DEFAULT 0,
    likes_count INT DEFAULT 0,
    retweets_count INT DEFAULT 0,
    replies_count INT DEFAULT 0,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (reply_to_tweet_id) REFERENCES tweets(id),
    FOREIGN KEY (reply_to_user_id) REFERENCES users(id),
    FOREIGN KEY (retweet_id) REFERENCES tweets(id)
);
```

### 关注关系表 (follows)
```sql
CREATE TABLE follows (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    follower_id BIGINT NOT NULL,
    following_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (follower_id) REFERENCES users(id),
    FOREIGN KEY (following_id) REFERENCES users(id),
    UNIQUE KEY unique_follow (follower_id, following_id)
);
```

### 点赞表 (likes)
```sql
CREATE TABLE likes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    tweet_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (tweet_id) REFERENCES tweets(id),
    UNIQUE KEY unique_like (user_id, tweet_id)
);
```

### 媒体文件表 (media)
```sql
CREATE TABLE media (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tweet_id BIGINT NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    file_type ENUM('image', 'video', 'gif') NOT NULL,
    file_size INT NOT NULL,
    width INT,
    height INT,
    duration INT,
    thumbnail_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tweet_id) REFERENCES tweets(id)
);
```

## API 设计

### 认证相关
```typescript
// POST /api/auth/register
interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

// POST /api/auth/login
interface LoginRequest {
  email: string;
  password: string;
}

// POST /api/auth/refresh
interface RefreshRequest {
  refreshToken: string;
}
```

### 用户相关
```typescript
// GET /api/users/profile/:username
// PUT /api/users/profile
// GET /api/users/:userId/followers
// GET /api/users/:userId/following
// POST /api/users/:userId/follow
// DELETE /api/users/:userId/follow
```

### 推文相关
```typescript
// POST /api/tweets
interface CreateTweetRequest {
  content: string;
  media?: File[];
  replyToTweetId?: number;
}

// GET /api/tweets/feed
// GET /api/tweets/:tweetId
// PUT /api/tweets/:tweetId
// DELETE /api/tweets/:tweetId
// POST /api/tweets/:tweetId/like
// DELETE /api/tweets/:tweetId/like
// POST /api/tweets/:tweetId/retweet
// DELETE /api/tweets/:tweetId/retweet
```

### 搜索相关
```typescript
// GET /api/search/users
// GET /api/search/tweets
// GET /api/search/trends
```

## 核心功能实现

### 1. 用户认证系统
```typescript
// backend/src/middleware/auth.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  user?: { id: number; username: string; email: string };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded as { id: number; username: string; email: string };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

### 2. 推文发布系统
```typescript
// backend/src/controllers/tweetController.ts
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { uploadMedia } from '../services/mediaService';

export const createTweet = async (req: Request, res: Response) => {
  try {
    const { content, replyToTweetId } = req.body;
    const userId = req.user!.id;

    // 验证内容
    if (!content || content.length > 280) {
      return res.status(400).json({ error: 'Content must be between 1 and 280 characters' });
    }

    // 创建推文
    const tweet = await prisma.tweets.create({
      data: {
        userId,
        content,
        replyToTweetId,
        replyToUserId: replyToTweetId ? (await prisma.tweets.findUnique({
          where: { id: replyToTweetId },
          select: { userId: true }
        }))?.userId : null
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true
          }
        },
        media: true
      }
    });

    // 处理媒体文件
    if (req.files && Array.isArray(req.files)) {
      const mediaFiles = await uploadMedia(req.files, tweet.id);
      await prisma.media.createMany({
        data: mediaFiles
      });
    }

    // 实时推送推文
    io.emit('newTweet', tweet);

    res.json(tweet);
  } catch (error) {
    console.error('Error creating tweet:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

### 3. 实时通知系统
```typescript
// backend/src/services/notificationService.ts
import { prisma } from '../config/database';
import { io } from '../config/socket';

export const sendNotification = async (
  userId: number,
  type: 'like' | 'follow' | 'reply' | 'retweet',
  actorId: number,
  tweetId?: number
) => {
  try {
    const notification = await prisma.notifications.create({
      data: {
        userId,
        type,
        actorId,
        tweetId,
        isRead: false
      },
      include: {
        actor: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true
          }
        },
        tweet: {
          select: {
            id: true,
            content: true
          }
        }
      }
    });

    // 发送实时通知
    io.to(`user:${userId}`).emit('notification', notification);

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};
```

### 4. 缓存策略
```typescript
// backend/src/services/cacheService.ts
import Redis from 'ioredis';
import { prisma } from '../config/database';

const redis = new Redis(process.env.REDIS_URL!);

export const cacheUser = async (userId: number, user: any) => {
  await redis.setex(`user:${userId}`, 3600, JSON.stringify(user));
};

export const getCachedUser = async (userId: number) => {
  const cached = await redis.get(`user:${userId}`);
  if (cached) {
    return JSON.parse(cached);
  }
  return null;
};

export const cacheTweetFeed = async (userId: number, tweets: any[]) => {
  await redis.setex(`feed:${userId}`, 300, JSON.stringify(tweets));
};

export const getCachedTweetFeed = async (userId: number) => {
  const cached = await redis.get(`feed:${userId}`);
  if (cached) {
    return JSON.parse(cached);
  }
  return null;
};
```

## 前端组件设计

### 1. 推文组件
```vue
<!-- frontend/src/components/tweet/TweetCard.vue -->
<template>
  <div class="border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors">
    <div class="flex space-x-3">
      <div class="flex-shrink-0">
        <img :src="tweet.user.avatarUrl" :alt="tweet.user.username"
             class="w-12 h-12 rounded-full object-cover">
      </div>
      <div class="flex-1">
        <div class="flex items-center space-x-1 mb-1">
          <span class="font-bold text-gray-900">{{ tweet.user.fullName }}</span>
          <span class="text-gray-500">@{{ tweet.user.username }}</span>
          <span class="text-gray-500">·</span>
          <span class="text-gray-500">{{ formatDate(tweet.createdAt) }}</span>
        </div>

        <div class="text-gray-900 mb-3">
          {{ tweet.content }}
        </div>

        <div v-if="tweet.media && tweet.media.length > 0" class="mb-3">
          <div class="grid grid-cols-2 gap-2">
            <div v-for="media in tweet.media" :key="media.id"
                 class="relative rounded-lg overflow-hidden">
              <img v-if="media.fileType === 'image'"
                   :src="media.fileUrl"
                   :alt="`Media ${media.id}`"
                   class="w-full h-full object-cover">
              <div v-else class="w-full h-48 bg-gray-200 flex items-center justify-center">
                <span class="text-gray-500">{{ media.fileType }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between max-w-md">
          <button @click="handleReply" class="flex items-center space-x-1 text-gray-500 hover:text-blue-500">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            <span class="text-sm">{{ tweet.repliesCount }}</span>
          </button>

          <button @click="handleRetweet" class="flex items-center space-x-1 text-gray-500 hover:text-green-500">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            <span class="text-sm">{{ tweet.retweetsCount }}</span>
          </button>

          <button @click="handleLike" class="flex items-center space-x-1 text-gray-500 hover:text-red-500">
            <svg class="w-5 h-5" :class="{ 'text-red-500 fill-current': tweet.isLiked }"
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
            <span class="text-sm">{{ tweet.likesCount }}</span>
          </button>

          <button class="flex items-center space-x-1 text-gray-500 hover:text-blue-500">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Tweet } from '@/types/tweet';

interface Props {
  tweet: Tweet;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'reply', tweet: Tweet): void;
  (e: 'retweet', tweet: Tweet): void;
  (e: 'like', tweet: Tweet): void;
}>();

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      return `${diffMinutes}m`;
    }
    return `${diffHours}h`;
  }

  return `${diffDays}d`;
};

const handleReply = () => {
  emit('reply', props.tweet);
};

const handleRetweet = () => {
  emit('retweet', props.tweet);
};

const handleLike = () => {
  emit('like', props.tweet);
};
</script>
```

### 2. 推文编辑器组件
```vue
<!-- frontend/src/components/tweet/TweetEditor.vue -->
<template>
  <div class="border-b border-gray-200 p-4">
    <div class="flex space-x-3">
      <div class="flex-shrink-0">
        <img :src="currentUser.avatarUrl" :alt="currentUser.username"
             class="w-12 h-12 rounded-full object-cover">
      </div>
      <div class="flex-1">
        <textarea
          v-model="content"
          :placeholder="placeholder"
          class="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          :rows="3"
          maxlength="280"
          @input="updateCharCount"
        ></textarea>

        <div class="flex items-center justify-between mt-3">
          <div class="flex items-center space-x-2">
            <button class="text-blue-500 hover:text-blue-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </button>

            <button class="text-blue-500 hover:text-blue-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </button>

            <button class="text-blue-500 hover:text-blue-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </button>

            <button class="text-blue-500 hover:text-blue-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </button>
          </div>

          <div class="flex items-center space-x-3">
            <span class="text-sm text-gray-500">{{ charCount }}/280</span>
            <button
              @click="handleSubmit"
              :disabled="!canSubmit"
              class="px-4 py-2 bg-blue-500 text-white rounded-full font-bold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              发布
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useTweetStore } from '@/stores/tweet';

interface Props {
  placeholder?: string;
  replyTo?: number;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '有什么新鲜事？'
});

const authStore = useAuthStore();
const tweetStore = useTweetStore();

const content = ref('');
const charCount = ref(0);

const currentUser = computed(() => authStore.user);

const canSubmit = computed(() => {
  return content.value.trim().length > 0 && content.value.length <= 280;
});

const updateCharCount = () => {
  charCount.value = content.value.length;
};

const handleSubmit = async () => {
  if (!canSubmit.value) return;

  try {
    await tweetStore.createTweet({
      content: content.value,
      replyToTweetId: props.replyTo
    });

    content.value = '';
    charCount.value = 0;
  } catch (error) {
    console.error('Error creating tweet:', error);
  }
};
</script>
```

## 部署配置

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://localhost:8000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mysql://root:password@mysql:3306/twitter
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=your-secret-key
    depends_on:
      - mysql
      - redis

  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=twitter
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - frontend
      - backend

volumes:
  mysql_data:
  redis_data:
```

### Nginx配置
```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:3000;
    }

    upstream backend {
        server backend:8000;
    }

    server {
        listen 80;
        server_name localhost;

        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /api {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /socket.io {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

## 开发流程

### 1. 环境搭建
```bash
# 克隆项目
git clone <repository-url>
cd my-twitter

# 安装依赖
npm install

# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install

# 启动开发环境
npm run dev
```

### 2. 开发规范
- 使用ESLint和Prettier进行代码规范
- 使用TypeScript进行类型检查
- 使用Git hooks进行提交检查
- 编写单元测试和集成测试

### 3. 版本控制
- 使用Git进行版本控制
- 使用语义化版本号
- 使用分支管理策略（Git Flow）

### 4. CI/CD
- 使用GitHub Actions进行自动化构建
- 使用Docker进行容器化部署
- 使用自动化测试确保代码质量

## 总结

这个技术实施方案提供了一个完整的Twitter克隆项目的技术栈选择、架构设计、数据库设计、API设计、核心功能实现和部署配置。通过使用Vue3、TailwindCSS、Express、MySQL和Redis等现代技术栈，可以构建一个功能完整、性能优良、可扩展的社交媒体平台。

关键特点：
- 现代化的技术栈
- 完整的数据库设计
- 实时通信功能
- 缓存优化策略
- 容器化部署
- 完善的开发流程

该方案为项目的成功实施提供了坚实的技术基础和清晰的实施路径。