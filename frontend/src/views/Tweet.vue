<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Tweet Detail -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <button @click="$router.back()" class="mr-4">
              <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
            </button>
            <h1 class="text-xl font-bold text-gray-900">Tweet</h1>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Main Tweet -->
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <div class="flex items-start space-x-3">
          <img
            :src="tweet?.user.avatarUrl || 'https://via.placeholder.com/48'"
            :alt="tweet?.user.username"
            class="h-12 w-12 rounded-full"
          />
          <div class="flex-1">
            <div class="flex items-center space-x-2 mb-1">
              <h3 class="font-semibold text-gray-900">{{ tweet?.user.fullName }}</h3>
              <span class="text-gray-500">@{{ tweet?.user.username }}</span>
              <span class="text-gray-500">·</span>
              <span class="text-gray-500">{{ formatDate(tweet?.createdAt) }}</span>
            </div>
            <p class="text-gray-900 mb-4">{{ tweet?.content }}</p>

            <!-- Tweet Media -->
            <div v-if="tweet?.media && tweet.media.length > 0" class="mb-4">
              <div class="grid grid-cols-2 gap-2">
                <div v-for="media in tweet.media" :key="media.id" class="rounded-lg overflow-hidden">
                  <img
                    v-if="media.fileType === 'image'"
                    :src="media.fileUrl"
                    :alt="`Media ${media.id}`"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-32 bg-gray-200 flex items-center justify-center">
                    <span class="text-gray-500">{{ media.fileType }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tweet Stats -->
            <div class="flex items-center space-x-6 text-sm text-gray-500 mb-4">
              <div class="flex items-center space-x-1">
                <span class="font-semibold text-gray-900">{{ tweet?.retweetsCount || 0 }}</span>
                <span>Retweets</span>
              </div>
              <div class="flex items-center space-x-1">
                <span class="font-semibold text-gray-900">{{ tweet?.likesCount || 0 }}</span>
                <span>Likes</span>
              </div>
            </div>

            <!-- Tweet Actions -->
            <div class="flex items-center justify-between border-t border-gray-200 pt-4">
              <button class="flex items-center space-x-2 text-gray-500 hover:text-twitter-blue">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                <span class="text-sm">{{ tweet?.repliesCount || 0 }}</span>
              </button>
              <button class="flex items-center space-x-2 text-gray-500 hover:text-green-500">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                <span class="text-sm">{{ tweet?.retweetsCount || 0 }}</span>
              </button>
              <button class="flex items-center space-x-2 text-gray-500 hover:text-red-500">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
                <span class="text-sm">{{ tweet?.likesCount || 0 }}</span>
              </button>
              <button class="flex items-center space-x-2 text-gray-500 hover:text-twitter-blue">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Reply Section -->
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <div class="flex items-start space-x-3">
          <img
            :src="currentUser?.avatarUrl || 'https://via.placeholder.com/40'"
            :alt="currentUser?.username"
            class="h-10 w-10 rounded-full"
          />
          <div class="flex-1">
            <textarea
              v-model="replyContent"
              placeholder="Tweet your reply"
              class="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-twitter-blue"
              rows="3"
              maxlength="280"
            ></textarea>
            <div class="flex items-center justify-between mt-3">
              <div class="flex items-center space-x-2">
                <button class="text-twitter-blue hover:text-blue-600">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </button>
                <button class="text-twitter-blue hover:text-blue-600">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </button>
              </div>
              <div class="flex items-center space-x-3">
                <span class="text-sm text-gray-500">{{ replyContent.length }}/280</span>
                <button
                  @click="postReply"
                  :disabled="!replyContent.trim()"
                  class="twitter-button text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Replies -->
      <div class="space-y-4">
        <h2 class="text-lg font-semibold text-gray-900">Replies</h2>
        <div
          v-for="reply in replies"
          :key="reply.id"
          class="bg-white shadow rounded-lg p-6"
        >
          <div class="flex items-start space-x-3">
            <img
              :src="reply.user.avatarUrl || 'https://via.placeholder.com/40'"
              :alt="reply.user.username"
              class="h-10 w-10 rounded-full"
            />
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-1">
                <h3 class="font-semibold text-gray-900">{{ reply.user.fullName }}</h3>
                <span class="text-gray-500">@{{ reply.user.username }}</span>
                <span class="text-gray-500">·</span>
                <span class="text-gray-500">{{ formatDate(reply.createdAt) }}</span>
              </div>
              <p class="text-gray-900 mb-3">{{ reply.content }}</p>
              <div class="flex items-center space-x-6">
                <button class="flex items-center space-x-1 text-gray-500 hover:text-twitter-blue">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                  </svg>
                  <span class="text-xs">{{ reply.repliesCount || 0 }}</span>
                </button>
                <button class="flex items-center space-x-1 text-gray-500 hover:text-green-500">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  <span class="text-xs">{{ reply.retweetsCount || 0 }}</span>
                </button>
                <button class="flex items-center space-x-1 text-gray-500 hover:text-red-500">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                  <span class="text-xs">{{ reply.likesCount || 0 }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { Tweet, User } from '@/types'

const route = useRoute()
const authStore = useAuthStore()

const tweet = ref<Tweet | null>(null)
const replies = ref<Tweet[]>([])
const replyContent = ref('')

const currentUser = authStore.user

const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffTime / (1000 * 60))
      return `${diffMinutes}m`
    }
    return `${diffHours}h`
  }

  return `${diffDays}d`
}

const postReply = () => {
  if (!replyContent.value.trim() || !currentUser) return

  const newReply: Tweet = {
    id: Date.now(),
    userId: currentUser.id,
    content: replyContent.value,
    replyToTweetId: Number(route.params.id),
    replyToUserId: tweet.value?.userId,
    viewsCount: 0,
    likesCount: 0,
    retweetsCount: 0,
    repliesCount: 0,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: currentUser,
    media: [],
    isLiked: false,
    isRetweeted: false
  }

  replies.value.unshift(newReply)
  replyContent.value = ''

  // Update main tweet reply count
  if (tweet.value) {
    tweet.value.repliesCount += 1
  }
}

onMounted(() => {
  const tweetId = Number(route.params.id)

  // Mock tweet data
  tweet.value = {
    id: tweetId,
    userId: 1,
    content: 'Just launched my new project! 🚀 Check it out and let me know what you think! Building this with Vue 3, TypeScript, and Tailwind CSS. The development process has been amazing, and I\'m excited to share it with the community. #vuejs #javascript #webdev #coding',
    replyToTweetId: undefined,
    replyToUserId: undefined,
    retweetId: undefined,
    viewsCount: 1250,
    likesCount: 234,
    retweetsCount: 89,
    repliesCount: 25,
    isDeleted: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    user: {
      id: 1,
      username: 'johndoe',
      email: 'john@example.com',
      fullName: 'John Doe',
      bio: 'Software developer and tech enthusiast',
      location: 'San Francisco, CA',
      website: 'https://johndoe.com',
      avatarUrl: null,
      headerUrl: null,
      followersCount: 1250,
      followingCount: 856,
      tweetsCount: 342,
      isVerified: true,
      isPrivate: false,
      createdAt: new Date('2020-01-15').toISOString(),
      updatedAt: new Date().toISOString()
    },
    media: [],
    isLiked: false,
    isRetweeted: false
  }

  // Mock replies
  replies.value = [
    {
      id: 1,
      userId: 2,
      content: 'Congratulations! This looks amazing! 🎉',
      replyToTweetId: tweetId,
      replyToUserId: 1,
      viewsCount: 125,
      likesCount: 12,
      retweetsCount: 2,
      repliesCount: 0,
      isDeleted: false,
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      updatedAt: new Date(Date.now() - 1800000).toISOString(),
      user: {
        id: 2,
        username: 'janedoe',
        email: 'jane@example.com',
        fullName: 'Jane Smith',
        bio: 'Frontend developer',
        location: 'New York, NY',
        website: 'https://janesmith.com',
        avatarUrl: null,
        headerUrl: null,
        followersCount: 890,
        followingCount: 567,
        tweetsCount: 234,
        isVerified: true,
        isPrivate: false,
        createdAt: new Date('2020-03-20').toISOString(),
        updatedAt: new Date().toISOString()
      },
      media: [],
      isLiked: false,
      isRetweeted: false
    },
    {
      id: 2,
      userId: 3,
      content: 'Great work! I love the design. When can we expect the full release?',
      replyToTweetId: tweetId,
      replyToUserId: 1,
      viewsCount: 98,
      likesCount: 8,
      retweetsCount: 1,
      repliesCount: 0,
      isDeleted: false,
      createdAt: new Date(Date.now() - 1200000).toISOString(),
      updatedAt: new Date(Date.now() - 1200000).toISOString(),
      user: {
        id: 3,
        username: 'bobsmith',
        email: 'bob@example.com',
        fullName: 'Bob Johnson',
        bio: 'Full-stack developer',
        location: 'Austin, TX',
        website: 'https://bobsmith.com',
        avatarUrl: null,
        headerUrl: null,
        followersCount: 678,
        followingCount: 445,
        tweetsCount: 189,
        isVerified: false,
        isPrivate: false,
        createdAt: new Date('2020-05-10').toISOString(),
        updatedAt: new Date().toISOString()
      },
      media: [],
      isLiked: false,
      isRetweeted: false
    }
  ]
})
</script>