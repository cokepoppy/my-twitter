<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-900">Notifications</h1>
          </div>
          <div class="flex items-center space-x-4">
            <button class="text-gray-600 hover:text-gray-900">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Notification Filters -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex space-x-8">
          <button
            @click="activeFilter = 'all'"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm',
              activeFilter === 'all'
                ? 'border-twitter-blue text-twitter-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            All
          </button>
          <button
            @click="activeFilter = 'mentions'"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm',
              activeFilter === 'mentions'
                ? 'border-twitter-blue text-twitter-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            Mentions
          </button>
          <button
            @click="activeFilter = 'verified'"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm',
              activeFilter === 'verified'
                ? 'border-twitter-blue text-twitter-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            Verified
          </button>
        </div>
      </div>
    </div>

    <!-- Notifications List -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="bg-white shadow rounded-lg">
        <div v-if="filteredNotifications.length === 0" class="p-12 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
          <p class="mt-1 text-sm text-gray-500">
            You're all caught up! Check back later for new notifications.
          </p>
        </div>

        <div v-else class="divide-y divide-gray-200">
          <div
            v-for="notification in filteredNotifications"
            :key="notification.id"
            :class="[
              'p-6 hover:bg-gray-50 cursor-pointer transition-colors',
              !notification.isRead ? 'bg-blue-50' : ''
            ]"
            @click="markAsRead(notification)"
          >
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0">
                <img
                  :src="notification.actor.avatarUrl || 'https://via.placeholder.com/40'"
                  :alt="notification.actor.username"
                  class="h-10 w-10 rounded-full"
                />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <p class="text-sm text-gray-900">
                    <span class="font-semibold">{{ notification.actor.fullName }}</span>
                    <span class="text-gray-500">@{{ notification.actor.username }}</span>
                    <span class="text-gray-400">· {{ formatDate(notification.createdAt) }}</span>
                  </p>
                  <div v-if="!notification.isRead" class="flex-shrink-0">
                    <div class="h-2 w-2 bg-twitter-blue rounded-full"></div>
                  </div>
                </div>
                <p class="mt-1 text-sm text-gray-600">
                  {{ getNotificationMessage(notification) }}
                </p>
                <div v-if="notification.tweet" class="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p class="text-sm text-gray-900">{{ notification.tweet.content }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Notification } from '@/types'

const activeFilter = ref('all')
const notifications = ref<Notification[]>([])

const filteredNotifications = computed(() => {
  if (activeFilter.value === 'all') {
    return notifications.value
  }
  return notifications.value.filter(notification => {
    // For demo purposes, we'll filter based on type
    if (activeFilter.value === 'mentions') {
      return notification.type === 'reply'
    }
    if (activeFilter.value === 'verified') {
      return notification.actor.isVerified
    }
    return true
  })
})

const getNotificationMessage = (notification: Notification) => {
  switch (notification.type) {
    case 'like':
      return 'liked your tweet'
    case 'follow':
      return 'started following you'
    case 'reply':
      return 'replied to your tweet'
    case 'retweet':
      return 'retweeted your tweet'
    default:
      return 'interacted with your content'
  }
}

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

const markAsRead = (notification: Notification) => {
  notification.isRead = true
}

onMounted(() => {
  // Mock notifications data
  notifications.value = [
    {
      id: 1,
      userId: 1,
      type: 'like',
      actorId: 2,
      tweetId: 1,
      isRead: false,
      createdAt: new Date(Date.now() - 300000).toISOString(),
      actor: {
        id: 2,
        username: 'janedoe',
        fullName: 'Jane Smith',
        avatarUrl: null,
        isVerified: true,
      } as any,
      tweet: {
        id: 1,
        content: 'Just launched my new project! 🚀 Check it out and let me know what you think!',
      } as any,
    },
    {
      id: 2,
      userId: 1,
      type: 'follow',
      actorId: 3,
      isRead: false,
      createdAt: new Date(Date.now() - 600000).toISOString(),
      actor: {
        id: 3,
        username: 'bobsmith',
        fullName: 'Bob Johnson',
        avatarUrl: null,
        isVerified: false,
      } as any,
    },
    {
      id: 3,
      userId: 1,
      type: 'reply',
      actorId: 4,
      tweetId: 1,
      isRead: true,
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      actor: {
        id: 4,
        username: 'alicebrown',
        fullName: 'Alice Brown',
        avatarUrl: null,
        isVerified: true,
      } as any,
      tweet: {
        id: 1,
        content: 'Just launched my new project! 🚀 Check it out and let me know what you think!',
      } as any,
    },
    {
      id: 4,
      userId: 1,
      type: 'retweet',
      actorId: 5,
      tweetId: 1,
      isRead: true,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      actor: {
        id: 5,
        username: 'charliedev',
        fullName: 'Charlie Dev',
        avatarUrl: null,
        isVerified: false,
      } as any,
      tweet: {
        id: 1,
        content: 'Just launched my new project! 🚀 Check it out and let me know what you think!',
      } as any,
    },
    {
      id: 5,
      userId: 1,
      type: 'like',
      actorId: 6,
      tweetId: 2,
      isRead: false,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      actor: {
        id: 6,
        username: 'davidlee',
        fullName: 'David Lee',
        avatarUrl: null,
        isVerified: true,
      } as any,
      tweet: {
        id: 2,
        content: 'Beautiful day for coding! ☀️ Working on some new features for my Twitter clone.',
      } as any,
    },
  ]
})
</script>