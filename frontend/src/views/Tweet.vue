<template>
  <div>
    <!-- Tweet Detail header (sticky) -->
    <div class="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-[color:var(--twitter-border)]">
      <div class="flex items-center gap-3 px-4 py-3">
        <button @click="$router.back()" aria-label="Back" class="p-2 rounded-full hover:bg-gray-100">
          <svg viewBox="0 0 24 24" class="w-6 h-6 text-black" fill="currentColor"><path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z"/></svg>
        </button>
        <h1 class="text-xl font-bold">Post</h1>
      </div>
    </div>

    <div class="px-4 py-3 border-b border-[color:var(--twitter-border)]">
      <!-- Main Tweet -->
      <div>
        <div class="flex items-start gap-3">
          <img
            :src="tweet?.user.avatarUrl || 'https://via.placeholder.com/48'"
            :alt="tweet?.user.username"
            class="h-12 w-12 rounded-full"
          />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1 text-[15px] leading-5">
              <h3 class="font-semibold text-gray-900">{{ tweet?.user.fullName }}</h3>
              <span class="text-gray-500">@{{ tweet?.user.username }} · {{ formatDate(tweet?.createdAt) }}</span>
            </div>
            <div v-if="tweet?.replyToTweetId && (tweet as any).parentTweet && (tweet as any).parentTweet.user" class="text-sm text-gray-600 mb-1">
              Replying to
              <router-link :to="`/profile/${(tweet as any).parentTweet.user.username}`" class="text-twitter-blue hover:underline">
                @{{ (tweet as any).parentTweet.user.username }}
              </router-link>
            </div>
            <p class="text-gray-900 mt-2 whitespace-pre-wrap break-words leading-6 text-[17px]">{{ tweet?.content }}</p>
            <!-- Quote original tweet preview -->
            <div v-if="tweet?.retweetId && (tweet as any).originalTweet" class="mt-3 border rounded-xl p-3 bg-gray-50">
              <div class="text-sm text-gray-700">
                <span class="font-semibold">@{{ (tweet as any).originalTweet.user?.username }}</span>
              </div>
              <div class="text-sm whitespace-pre-wrap break-words">{{ (tweet as any).originalTweet.content }}</div>
            </div>

            <!-- Tweet Media -->
            <div v-if="tweet?.media && tweet.media.length > 0" class="mt-3">
              <div v-if="tweet.media.some((m:any)=>m.fileType==='video')" class="overflow-hidden rounded-2xl border border-[color:var(--twitter-border)]">
                <video :src="tweet.media.find((m:any)=>m.fileType==='video')?.fileUrl" controls class="w-full max-h-[560px] bg-black"></video>
              </div>
              <TweetMedia
                v-else
                :media="tweet.media.filter((m: any) => m.fileType !== 'video').map((m:any)=>m.fileUrl)"
              />
            </div>

            <!-- Tweet Stats -->
            <div class="mt-3 pt-3 flex items-center gap-6 text-sm text-gray-500 border-t border-[color:var(--twitter-border)]">
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
            <div class="mt-2 flex items-center justify-between border-t border-[color:var(--twitter-border)] pt-2 max-w-[520px] text-gray-500">
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
      <div class="px-4 py-3 border-b border-[color:var(--twitter-border)]">
        <div class="flex items-start gap-3">
          <img :src="currentUser?.avatarUrl || 'https://via.placeholder.com/40'" :alt="currentUser?.username" class="h-10 w-10 rounded-full" />
          <div class="flex-1">
            <textarea v-model="replyContent" placeholder="Post your reply" rows="3" maxlength="280" class="w-full resize-none focus:outline-none placeholder-gray-500"></textarea>
            <div class="flex items-center justify-end gap-3 mt-2">
              <span class="text-sm text-gray-500">{{ replyContent.length }}/280</span>
              <button @click="postReply" :disabled="!replyContent.trim()" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1.5 px-4 rounded-full disabled:opacity-50">Reply</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Replies -->
      <div>
        <div
          v-for="reply in replies"
          :key="reply.id"
          class="px-4 py-3 border-b border-[color:var(--twitter-border)]"
        >
          <div class="flex items-start gap-3">
            <img
              :src="reply.user.avatarUrl || 'https://via.placeholder.com/40'"
              :alt="reply.user.username"
              class="h-10 w-10 rounded-full"
            />
            <div class="flex-1">
            <div class="flex items-center gap-1 text-[15px] leading-5 mb-1">
              <h3 class="font-semibold text-gray-900">{{ reply.user.fullName }}</h3>
                <span class="text-gray-500">@{{ reply.user.username }} · {{ formatDate(reply.createdAt) }}</span>
              </div>
              <div class="text-sm text-gray-600 mb-1">
                Replying to
                <router-link v-if="tweet" :to="`/profile/${tweet.user.username}`" class="text-twitter-blue hover:underline">
                  @{{ tweet.user.username }}
                </router-link>
              </div>
              <p class="text-gray-900 mb-3">{{ reply.content }}</p>
              <div class="flex items-center justify-between text-gray-500 max-w-[520px]">
                <button class="group flex items-center gap-1" @click="onReplyClick(reply)">
                  <span class="p-2 rounded-full group-hover:bg-blue-50">
                    <svg class="w-4 h-4 text-gray-500 group-hover:text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M20 8H4v11h16V8zM7 6h10V5a1 1 0 00-1-1H8a1 1 0 00-1 1v1z"/></svg>
                  </span>
                  <span class="text-xs group-hover:text-blue-500">{{ reply.repliesCount || 0 }}</span>
                </button>
                <div class="relative">
                  <button class="group flex items-center gap-1" @click.stop="toggleRetweetMenuReply(reply)">
                    <span class="p-2 rounded-full group-hover:bg-green-50">
                      <svg class="w-4 h-4" :class="reply.isRetweeted ? 'text-green-600' : 'text-gray-500 group-hover:text-green-600'" viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h11v3h-2v5H7l2.5-2.5L7 10l-4 4V7h4z"/></svg>
                    </span>
                    <span class="text-xs" :class="reply.isRetweeted ? 'text-green-600' : 'group-hover:text-green-600'">{{ reply.retweetsCount || 0 }}</span>
                  </button>
                  <div v-if="retweetMenuFor === reply.id" class="absolute z-20 mt-1 w-36 bg-white border rounded-xl shadow-lg">
                    <button @click.stop="retweetReply(reply)" class="w-full text-left px-4 py-2 hover:bg-gray-100">Retweet</button>
                    <button @click.stop="onQuoteClick(reply)" class="w-full text-left px-4 py-2 hover:bg-gray-100">Quote</button>
                  </div>
                </div>
                <button class="group flex items-center gap-1" @click="toggleLikeReply(reply)">
                  <span class="p-2 rounded-full group-hover:bg-pink-50">
                    <svg class="w-4 h-4" :class="reply.isLiked ? 'text-pink-500' : 'text-gray-500 group-hover:text-pink-500'" viewBox="0 0 24 24" fill="currentColor"><path d="M12.1 8.64l-.1.1-.11-.11C9.14 5.9 4.6 7.24 4.6 10.8c0 2.35 2.58 4.38 6.55 8.05l.75.67.75-.67c3.97-3.67 6.55-5.7 6.55-8.05 0-3.56-4.54-4.9-7.4-2.16z"/></svg>
                  </span>
                  <span class="text-xs" :class="reply.isLiked ? 'text-pink-500' : 'group-hover:text-pink-500'">{{ reply.likesCount || 0 }}</span>
                </button>
                <button class="group flex items-center gap-1" @click="shareReply(reply)">
                  <span class="p-2 rounded-full group-hover:bg-blue-50">
                    <svg class="w-4 h-4 text-gray-500 group-hover:text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"/></svg>
                  </span>
                </button>
                <button class="group flex items-center gap-1" @click="toggleBookmarkReply(reply)">
                  <span class="p-2 rounded-full group-hover:bg-yellow-50">
                    <svg class="w-4 h-4" :class="reply.isBookmarked ? 'text-yellow-600' : 'text-gray-500 group-hover:text-yellow-600'" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"/></svg>
                  </span>
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
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import type { Tweet } from '@/types'
import TweetMedia from '@/components/TweetMedia.vue'

const route = useRoute()
const authStore = useAuthStore()

const tweet = ref<Tweet | null>(null)
const replies = ref<Tweet[]>([])
const replyContent = ref('')
const retweetMenuFor = ref<any | null>(null)
const bookmarks = ref<Set<string>>(new Set())

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

const postReply = async () => {
  if (!replyContent.value.trim() || !currentUser) return
  try {
    const res = await axios.post('/api/tweets', {
      content: replyContent.value.trim(),
      replyToTweetId: route.params.id
    })
    const created = res.data?.data
    if (created) {
      replies.value.unshift(created)
      replyContent.value = ''
      if (tweet.value) tweet.value.repliesCount += 1
    }
  } catch (e) {
    // ignore for now; could show toast
  }
}

onMounted(async () => {
  const tweetId = route.params.id as string
  loadBookmarks()
  try {
    const [tRes, rRes] = await Promise.all([
      axios.get(`/api/tweets/${tweetId}`),
      axios.get(`/api/tweets/${tweetId}/replies`, { params: { page: 1, limit: 20 } })
    ])
    tweet.value = tRes.data?.data
    replies.value = (rRes.data?.data || []).map((r: any) => ({ ...r, isBookmarked: bookmarks.value.has(String(r.id)) }))
  } catch (e) {
    // ignore errors
  }
})

// Actions for replies
const toggleRetweetMenuReply = (reply: any) => {
  retweetMenuFor.value = retweetMenuFor.value === reply.id ? null : reply.id
}

const retweetReply = async (reply: any) => {
  try {
    await axios.post(`/api/tweets/${reply.id}/retweet`)
    reply.isRetweeted = !reply.isRetweeted
    const cur = Number(reply.retweetsCount || 0)
    reply.retweetsCount = cur + (reply.isRetweeted ? 1 : -1)
  } catch (_) {
    // noop
  } finally {
    retweetMenuFor.value = null
  }
}

const toggleLikeReply = async (reply: any) => {
  try {
    await axios.post(`/api/tweets/${reply.id}/like`)
    reply.isLiked = !reply.isLiked
    const cur = Number(reply.likesCount || 0)
    reply.likesCount = cur + (reply.isLiked ? 1 : -1)
  } catch (_) {
    // noop
  }
}

const shareReply = async (reply: any) => {
  const url = `${window.location.origin}/tweet/${reply.id}`
  try {
    await navigator.clipboard.writeText(url)
  } catch (_) {
    window.prompt('Copy link to reply:', url)
  }
}

const onReplyClick = (reply: any) => {
  // navigate to reply detail
  window.location.href = `/tweet/${reply.id}`
}

const loadBookmarks = () => {
  try {
    const raw = localStorage.getItem('bookmarks')
    const arr = raw ? JSON.parse(raw) : []
    bookmarks.value = new Set(arr)
  } catch (_) {
    bookmarks.value = new Set()
  }
}
const saveBookmarks = () => {
  try { localStorage.setItem('bookmarks', JSON.stringify(Array.from(bookmarks.value))) } catch (_) {}
}
const toggleBookmarkReply = (reply: any) => {
  const id = String(reply.id)
  if (bookmarks.value.has(id)) {
    bookmarks.value.delete(id)
    reply.isBookmarked = false
  } else {
    bookmarks.value.add(id)
    reply.isBookmarked = true
  }
  saveBookmarks()
}
</script>
