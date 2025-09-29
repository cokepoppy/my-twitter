<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Profile Header -->
    <div class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <button @click="$router.back()" class="mr-4">
              <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
            </button>
            <h1 class="text-xl font-bold text-gray-900">{{ user?.fullName || 'Profile' }}</h1>
          </div>
          <div>
            <button v-if="isOwnProfile" class="twitter-button text-sm">
              Edit Profile
            </button>
            <FollowButton
              v-else
              :username="route.params.username as string"
              :initial-is-following="followStatus.isFollowing"
              :initial-requested="followStatus.requested"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Profile Info -->
    <div class="bg-white">
      <div class="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600"></div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-end pb-4 -mt-16">
          <img
            :src="user?.avatarUrl || 'https://via.placeholder.com/150'"
            :alt="user?.username"
            class="w-32 h-32 rounded-full border-4 border-white shadow-lg"
          />
          <div class="ml-6 pb-2">
            <h2 class="text-2xl font-bold text-gray-900">{{ user?.fullName }}</h2>
            <p class="text-gray-600">@{{ user?.username }}</p>
          </div>
        </div>

        <div class="border-t border-gray-200">
          <div class="py-4">
            <p class="text-gray-900">{{ user?.bio || 'No bio available' }}</p>
            <div class="mt-2 flex items-center text-sm text-gray-600 space-x-4">
              <span v-if="user?.location">📍 {{ user.location }}</span>
              <span v-if="user?.website">🔗 {{ user.website }}</span>
              <span>📅 Joined {{ formatDate(user?.createdAt) }}</span>
            </div>
          </div>

          <div class="flex items-center space-x-6 border-t border-gray-200 py-4">
            <div class="flex items-center space-x-1">
              <span class="font-bold text-gray-900">{{ user?.followingCount || 0 }}</span>
              <span class="text-gray-600">Following</span>
            </div>
            <div class="flex items-center space-x-1">
              <span class="font-bold text-gray-900">{{ user?.followersCount || 0 }}</span>
              <span class="text-gray-600">Followers</span>
            </div>
            <div class="flex items-center space-x-1">
              <span class="font-bold text-gray-900">{{ user?.tweetsCount || 0 }}</span>
              <span class="text-gray-600">Tweets</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tweet Tabs -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex space-x-8">
          <button class="py-4 px-1 border-b-2 border-twitter-blue text-sm font-medium text-twitter-blue">
            Tweets
          </button>
          <button class="py-4 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
            Tweets & replies
          </button>
          <button class="py-4 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
            Media
          </button>
          <button class="py-4 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
            Likes
          </button>
        </div>
      </div>
    </div>

    <!-- User Tweets -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="space-y-4">
        <div
          v-for="tweet in userTweets"
          :key="tweet.id"
          class="bg-white shadow rounded-lg p-6"
        >
          <div class="flex items-start space-x-3">
            <img
              :src="tweet.user.avatarUrl || 'https://via.placeholder.com/48'"
              :alt="tweet.user.username"
              class="h-12 w-12 rounded-full"
            />
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-1">
                <h3 class="font-semibold text-gray-900">{{ tweet.user.fullName }}</h3>
                <span class="text-gray-500">@{{ tweet.user.username }}</span>
                <span class="text-gray-500">·</span>
                <span class="text-gray-500">{{ formatDate(tweet.createdAt) }}</span>
              </div>
              <p class="text-gray-900 mb-3">{{ tweet.content }}</p>
              <div class="flex items-center space-x-6">
                <button class="flex items-center space-x-1 text-gray-500 hover:text-twitter-blue">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                  </svg>
                  <span class="text-sm">{{ tweet.repliesCount || 0 }}</span>
                </button>
                <button class="flex items-center space-x-1 text-gray-500 hover:text-green-500">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  <span class="text-sm">{{ tweet.retweetsCount || 0 }}</span>
                </button>
                <button class="flex items-center space-x-1 text-gray-500 hover:text-red-500">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                  <span class="text-sm">{{ tweet.likesCount || 0 }}</span>
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
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import FollowButton from '@/components/FollowButton.vue'
import type { User, Tweet, FollowStatus } from '@/types'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()

const auth = useAuthStore()
const user = ref<User | null>(null)
const userTweets = ref<Tweet[]>([])
const followStatus = ref<FollowStatus>({ isFollowing: false, requested: false })
const isOwnProfile = computed(() => auth.user && user.value && auth.user.username === user.value.username)

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

onMounted(async () => {
  const username = route.params.username as string
  try {
    const [profileRes, statusRes] = await Promise.all([
      axios.get(`/api/users/profile/${encodeURIComponent(username)}`),
      axios.get(`/api/follows/${encodeURIComponent(username)}/follows`)
    ])

    user.value = profileRes.data?.data
    followStatus.value = statusRes.data?.data

    // TODO: fetch user tweets API when available
    userTweets.value = []
  } catch (e) {
    // handle error
  }
})
</script>
