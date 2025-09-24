<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-900">Explore</h1>
          </div>
        </div>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="bg-white border-b border-gray-200 p-4">
      <div class="max-w-2xl mx-auto">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search Twitter"
            class="w-full px-4 py-3 pl-12 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-twitter-blue focus:bg-white"
          />
          <svg class="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Sidebar -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Trends Section -->
          <div class="bg-white shadow rounded-lg">
            <div class="p-6 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Trends for you</h2>
            </div>
            <div class="divide-y divide-gray-200">
              <div
                v-for="trend in trends"
                :key="trend.id"
                class="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-gray-500">{{ trend.category }}</p>
                    <p class="font-semibold text-gray-900">{{ trend.title }}</p>
                    <p class="text-sm text-gray-500">{{ trend.tweetsCount }} tweets</p>
                  </div>
                  <button class="text-gray-400 hover:text-gray-600">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Who to Follow Section -->
          <div class="bg-white shadow rounded-lg">
            <div class="p-6 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Who to follow</h2>
            </div>
            <div class="divide-y divide-gray-200">
              <div
                v-for="user in suggestedUsers"
                :key="user.id"
                class="p-6 hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <img
                      :src="user.avatarUrl || 'https://via.placeholder.com/48'"
                      :alt="user.username"
                      class="h-12 w-12 rounded-full"
                    />
                    <div>
                      <div class="flex items-center space-x-1">
                        <h3 class="font-semibold text-gray-900">{{ user.fullName }}</h3>
                        <span v-if="user.isVerified" class="text-blue-500">
                          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                          </svg>
                        </span>
                      </div>
                      <p class="text-gray-600">@{{ user.username }}</p>
                    </div>
                  </div>
                  <button class="twitter-button text-sm py-2 px-4">
                    Follow
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Popular Tweets Section -->
          <div class="bg-white shadow rounded-lg">
            <div class="p-6 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Popular tweets</h2>
            </div>
            <div class="divide-y divide-gray-200">
              <div
                v-for="tweet in popularTweets"
                :key="tweet.id"
                class="p-6 hover:bg-gray-50 transition-colors"
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
                        <span class="text-sm">{{ tweet.repliesCount }}</span>
                      </button>
                      <button class="flex items-center space-x-1 text-gray-500 hover:text-green-500">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        <span class="text-sm">{{ tweet.retweetsCount }}</span>
                      </button>
                      <button class="flex items-center space-x-1 text-gray-500 hover:text-red-500">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                        </svg>
                        <span class="text-sm">{{ tweet.likesCount }}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Sidebar -->
        <div class="space-y-6">
          <!-- Topics to Follow -->
          <div class="bg-white shadow rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Topics to follow</h3>
            <div class="space-y-3">
              <div
                v-for="topic in topics"
                :key="topic.id"
                class="flex items-center justify-between"
              >
                <div>
                  <p class="font-semibold text-gray-900">{{ topic.name }}</p>
                  <p class="text-sm text-gray-500">{{ topic.followersCount }} followers</p>
                </div>
                <button class="twitter-button text-sm py-1 px-3">
                  Follow
                </button>
              </div>
            </div>
          </div>

          <!-- Suggested Content -->
          <div class="bg-white shadow rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Recommended for you</h3>
            <div class="space-y-3">
              <div
                v-for="item in recommendedItems"
                :key="item.id"
                class="border-l-4 border-twitter-blue pl-4"
              >
                <h4 class="font-semibold text-gray-900">{{ item.title }}</h4>
                <p class="text-sm text-gray-600">{{ item.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Tweet, User } from '@/types'

const searchQuery = ref('')

const trends = ref([
  { id: 1, category: 'Technology', title: 'Vue 3.4', tweetsCount: '12.5K' },
  { id: 2, category: 'Sports', title: 'World Cup', tweetsCount: '45.2K' },
  { id: 3, category: 'Entertainment', title: 'New Movie Release', tweetsCount: '8.9K' },
  { id: 4, category: 'Technology', title: 'JavaScript', tweetsCount: '23.1K' },
  { id: 5, category: 'News', title: 'Breaking News', tweetsCount: '15.7K' },
])

const suggestedUsers = ref([
  { id: 1, username: 'johndoe', fullName: 'John Doe', avatarUrl: null, isVerified: true },
  { id: 2, username: 'janedoe', fullName: 'Jane Smith', avatarUrl: null, isVerified: false },
  { id: 3, username: 'bobsmith', fullName: 'Bob Johnson', avatarUrl: null, isVerified: true },
  { id: 4, username: 'alicebrown', fullName: 'Alice Brown', avatarUrl: null, isVerified: false },
  { id: 5, username: 'charliedev', fullName: 'Charlie Dev', avatarUrl: null, isVerified: true },
])

const popularTweets = ref([
  {
    id: 1,
    content: 'Just launched my new project! 🚀 Check it out and let me know what you think! #vuejs #javascript #webdev',
    user: { id: 1, username: 'johndoe', fullName: 'John Doe', avatarUrl: null } as User,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    repliesCount: 25,
    retweetsCount: 89,
    likesCount: 234,
  },
  {
    id: 2,
    content: 'Beautiful day for coding! ☀️ Working on some new features for my Twitter clone. Building with Vue3 and TypeScript.',
    user: { id: 2, username: 'janedoe', fullName: 'Jane Smith', avatarUrl: null } as User,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    repliesCount: 12,
    retweetsCount: 34,
    likesCount: 156,
  },
  {
    id: 3,
    content: 'The future of web development is looking bright! 🌟 Excited about all the new technologies and frameworks coming out.',
    user: { id: 3, username: 'bobsmith', fullName: 'Bob Johnson', avatarUrl: null } as User,
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    repliesCount: 45,
    retweetsCount: 128,
    likesCount: 567,
  },
])

const topics = ref([
  { id: 1, name: 'Web Development', followersCount: '1.2M' },
  { id: 2, name: 'JavaScript', followersCount: '2.8M' },
  { id: 3, name: 'Vue.js', followersCount: '890K' },
  { id: 4, name: 'Technology', followersCount: '5.6M' },
  { id: 5, name: 'Programming', followersCount: '3.4M' },
])

const recommendedItems = ref([
  {
    id: 1,
    title: 'Vue 3.4 Released',
    description: 'Check out the latest features and improvements in Vue 3.4'
  },
  {
    id: 2,
    title: 'TypeScript 5.0',
    description: 'New TypeScript version with enhanced developer experience'
  },
  {
    id: 3,
    title: 'Tailwind CSS 3.3',
    description: 'Latest updates to the utility-first CSS framework'
  }
])

const formatDate = (dateString: string) => {
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
</script>