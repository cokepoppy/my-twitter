<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-900">Messages</h1>
          </div>
          <div class="flex items-center space-x-4">
            <button class="twitter-button text-sm">
              New Message
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Conversations List -->
        <div class="lg:col-span-1">
          <div class="bg-white shadow rounded-lg">
            <div class="p-4 border-b border-gray-200">
              <div class="relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search messages"
                  class="w-full px-4 py-2 pl-10 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-twitter-blue focus:bg-white"
                />
                <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
            <div class="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              <div
                v-for="conversation in filteredConversations"
                :key="conversation.id"
                :class="[
                  'p-4 cursor-pointer transition-colors',
                  selectedConversation?.id === conversation.id
                    ? 'bg-twitter-blue bg-opacity-10'
                    : 'hover:bg-gray-50'
                ]"
                @click="selectConversation(conversation)"
              >
                <div class="flex items-center space-x-3">
                  <div class="flex-shrink-0 relative">
                    <img
                      :src="conversation.otherUser.avatarUrl || 'https://via.placeholder.com/48'"
                      :alt="conversation.otherUser.username"
                      class="h-12 w-12 rounded-full"
                    />
                    <div
                      v-if="conversation.otherUser.isOnline"
                      class="absolute bottom-0 right-0 h-3 w-3 bg-green-400 rounded-full border-2 border-white"
                    ></div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <h3 class="font-semibold text-gray-900 truncate">
                        {{ conversation.otherUser.fullName }}
                      </h3>
                      <span class="text-xs text-gray-500">
                        {{ formatDate(conversation.lastMessage?.createdAt) }}
                      </span>
                    </div>
                    <p class="text-sm text-gray-600 truncate">
                      {{ conversation.lastMessage?.content || 'No messages yet' }}
                    </p>
                    <div v-if="conversation.unreadCount > 0" class="flex items-center mt-1">
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-twitter-blue text-white">
                        {{ conversation.unreadCount }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat Area -->
        <div class="lg:col-span-2">
          <div class="bg-white shadow rounded-lg h-96 lg:h-[600px] flex flex-col">
            <div v-if="!selectedConversation" class="flex-1 flex items-center justify-center">
              <div class="text-center">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">Select a conversation</h3>
                <p class="mt-1 text-sm text-gray-500">
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            </div>

            <div v-else class="flex-1 flex flex-col">
              <!-- Chat Header -->
              <div class="border-b border-gray-200 p-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <img
                      :src="selectedConversation.otherUser.avatarUrl || 'https://via.placeholder.com/40'"
                      :alt="selectedConversation.otherUser.username"
                      class="h-10 w-10 rounded-full"
                    />
                    <div>
                      <h3 class="font-semibold text-gray-900">
                        {{ selectedConversation.otherUser.fullName }}
                      </h3>
                      <p class="text-sm text-gray-600">
                        @{{ selectedConversation.otherUser.username }}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <button class="text-gray-400 hover:text-gray-600">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                      </svg>
                    </button>
                    <button class="text-gray-400 hover:text-gray-600">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Messages -->
              <div class="flex-1 overflow-y-auto p-4 space-y-4">
                <div
                  v-for="message in selectedConversation.messages"
                  :key="message.id"
                  :class="[
                    'flex',
                    message.senderId === currentUserId ? 'justify-end' : 'justify-start'
                  ]"
                >
                  <div
                    :class="[
                      'max-w-xs lg:max-w-md',
                      message.senderId === currentUserId
                        ? 'bg-twitter-blue text-white'
                        : 'bg-gray-100 text-gray-900'
                    ]"
                    class="rounded-lg px-4 py-2"
                  >
                    <p class="text-sm">{{ message.content }}</p>
                    <p
                      :class="[
                        'text-xs mt-1',
                        message.senderId === currentUserId ? 'text-blue-100' : 'text-gray-500'
                      ]"
                    >
                      {{ formatTime(message.createdAt) }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Message Input -->
              <div class="border-t border-gray-200 p-4">
                <div class="flex items-center space-x-2">
                  <input
                    v-model="newMessage"
                    type="text"
                    placeholder="Type a message..."
                    class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-twitter-blue focus:border-transparent"
                    @keyup.enter="sendMessage"
                  />
                  <button
                    @click="sendMessage"
                    :disabled="!newMessage.trim()"
                    class="twitter-button disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
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
import type { Conversation, Message, User } from '@/types'

const searchQuery = ref('')
const selectedConversation = ref<Conversation | null>(null)
const newMessage = ref('')
const currentUserId = ref(1) // Mock current user ID

const conversations = ref<Conversation[]>([])

const filteredConversations = computed(() => {
  if (!searchQuery.value) {
    return conversations.value
  }
  return conversations.value.filter(conversation =>
    conversation.otherUser.fullName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    conversation.otherUser.username.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const selectConversation = (conversation: Conversation) => {
  selectedConversation.value = conversation
  // Mark messages as read
  conversation.unreadCount = 0
}

const sendMessage = () => {
  if (!newMessage.value.trim() || !selectedConversation.value) return

  const message: Message = {
    id: Date.now(),
    senderId: currentUserId.value,
    receiverId: selectedConversation.value.otherUser.id,
    content: newMessage.value,
    isRead: false,
    createdAt: new Date().toISOString(),
    sender: {} as User,
    receiver: {} as User
  }

  selectedConversation.value.messages.push(message)
  selectedConversation.value.lastMessage = message
  selectedConversation.value.updatedAt = new Date().toISOString()

  newMessage.value = ''
}

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

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

onMounted(() => {
  // Mock conversations data
  conversations.value = [
    {
      id: 1,
      user1Id: 1,
      user2Id: 2,
      lastMessageId: 1,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 300000).toISOString(),
      user1: {
        id: 1,
        username: 'currentuser',
        fullName: 'Current User',
        avatarUrl: null,
      } as User,
      user2: {
        id: 2,
        username: 'janedoe',
        fullName: 'Jane Smith',
        avatarUrl: null,
        isOnline: true,
      } as User,
      lastMessage: {
        id: 1,
        senderId: 2,
        receiverId: 1,
        content: 'Hey! How are you doing?',
        isRead: false,
        createdAt: new Date(Date.now() - 300000).toISOString(),
      } as Message,
      messages: [
        {
          id: 1,
          senderId: 2,
          receiverId: 1,
          content: 'Hey! How are you doing?',
          isRead: false,
          createdAt: new Date(Date.now() - 300000).toISOString(),
        } as Message,
        {
          id: 2,
          senderId: 1,
          receiverId: 2,
          content: 'I\'m doing great! Thanks for asking. How about you?',
          isRead: true,
          createdAt: new Date(Date.now() - 240000).toISOString(),
        } as Message,
      ],
      unreadCount: 1,
    },
    {
      id: 2,
      user1Id: 1,
      user2Id: 3,
      lastMessageId: 3,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
      user1: {
        id: 1,
        username: 'currentuser',
        fullName: 'Current User',
        avatarUrl: null,
      } as User,
      user2: {
        id: 3,
        username: 'bobsmith',
        fullName: 'Bob Johnson',
        avatarUrl: null,
        isOnline: false,
      } as User,
      lastMessage: {
        id: 3,
        senderId: 3,
        receiverId: 1,
        content: 'Let\'s catch up sometime this week!',
        isRead: true,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      } as Message,
      messages: [
        {
          id: 3,
          senderId: 3,
          receiverId: 1,
          content: 'Let\'s catch up sometime this week!',
          isRead: true,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        } as Message,
        {
          id: 4,
          senderId: 1,
          receiverId: 3,
          content: 'Sounds good! How about Friday?',
          isRead: true,
          createdAt: new Date(Date.now() - 3300000).toISOString(),
        } as Message,
      ],
      unreadCount: 0,
    },
    {
      id: 3,
      user1Id: 1,
      user2Id: 4,
      lastMessageId: 5,
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      updatedAt: new Date(Date.now() - 7200000).toISOString(),
      user1: {
        id: 1,
        username: 'currentuser',
        fullName: 'Current User',
        avatarUrl: null,
      } as User,
      user2: {
        id: 4,
        username: 'alicebrown',
        fullName: 'Alice Brown',
        avatarUrl: null,
        isOnline: true,
      } as User,
      lastMessage: {
        id: 5,
        senderId: 1,
        receiverId: 4,
        content: 'Thanks for the help with the project!',
        isRead: true,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      } as Message,
      messages: [
        {
          id: 5,
          senderId: 1,
          receiverId: 4,
          content: 'Thanks for the help with the project!',
          isRead: true,
          createdAt: new Date(Date.now() - 7200000).toISOString(),
        } as Message,
      ],
      unreadCount: 0,
    },
  ]
})
</script>