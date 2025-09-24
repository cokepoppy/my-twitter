<template>
  <div class="min-h-screen bg-white text-[15px]">
    <div class="mx-auto flex max-w-[1265px]">
      <!-- Left navigation -->
      <aside class="hidden md:block w-[275px] sticky top-0 self-start h-screen px-3 py-2">
        <div class="p-2">
          <router-link to="/" class="flex items-center justify-center w-12 h-12 rounded-full hover:bg-gray-100 transition">
            <svg viewBox="0 0 24 24" class="w-7 h-7 text-black" fill="currentColor" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </router-link>
        </div>
        <nav class="mt-1 space-y-1">
          <router-link to="/" class="flex items-center w-fit space-x-4 px-4 py-3 rounded-full hover:bg-gray-100 transition" :class="{ 'font-bold': $route.path === '/' }">
            <svg class="w-6 h-6 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M21.59 7.15L12.52 1.16a1 1 0 00-1.04 0L2.41 7.15a1 1 0 00-.41.76v13.18c0 .5.42.91.93.91H9.14c.51 0 .93-.41.93-.91v-7.08h3.9v7.08c0 .5.42.91.93.91h6.16c.51 0 .93-.41.93-.91V7.91a1 1 0 00-.41-.76z"/></svg>
            <span class="text-xl">Home</span>
          </router-link>
          <router-link to="/explore" class="flex items-center w-fit space-x-4 px-4 py-3 rounded-full hover:bg-gray-100 transition">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M10.25 3.75a6.5 6.5 0 100 13 6.5 6.5 0 000-13zm8.28 13.72l3.97 3.97-1.41 1.41-3.97-3.97a8.5 8.5 0 111.41-1.41z"/></svg>
            <span class="text-xl">Explore</span>
          </router-link>
          <router-link to="/notifications" class="flex items-center w-fit space-x-4 px-4 py-3 rounded-full hover:bg-gray-100 transition">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M20 16H4l1-7a7 7 0 0114 0l1 7zm-8 6a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>
            <span class="text-xl">Notifications</span>
          </router-link>
          <router-link to="/messages" class="flex items-center w-fit space-x-4 px-4 py-3 rounded-full hover:bg-gray-100 transition">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M3 4h18a2 2 0 012 2v12a2 2 0 01-2 2H3a2 2 0 01-2-2V6a2 2 0 012-2zm9 7l9-5H3l9 5zm0 2l-9-5v10h18V8l-9 5z"/></svg>
            <span class="text-xl">Messages</span>
          </router-link>
          <router-link to="/bookmarks" class="flex items-center w-fit space-x-4 px-4 py-3 rounded-full hover:bg-gray-100 transition">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M6 2h12a1 1 0 011 1v18l-7-4-7 4V3a1 1 0 011-1z"/></svg>
            <span class="text-xl">Bookmarks</span>
          </router-link>
          <router-link to="/lists" class="flex items-center w-fit space-x-4 px-4 py-3 rounded-full hover:bg-gray-100 transition">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v2H4V6zm0 5h10v2H4v-2zm0 5h16v2H4v-2z"/></svg>
            <span class="text-xl">Lists</span>
          </router-link>
          <router-link to="/communities" class="flex items-center w-fit space-x-4 px-4 py-3 rounded-full hover:bg-gray-100 transition">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zM2 20a8 8 0 0116 0v2H2v-2zm20-4h-2a6 6 0 00-6-6v-2a8 8 0 018 8z"/></svg>
            <span class="text-xl">Communities</span>
          </router-link>
          <router-link to="/premium" class="flex items-center w-fit space-x-4 px-4 py-3 rounded-full hover:bg-gray-100 transition">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 7h7l-5.5 4.1L18 21l-6-4-6 4 1.5-7.9L2 9h7z"/></svg>
            <span class="text-xl">Premium</span>
          </router-link>
          <button type="button" class="flex items-center w-fit space-x-4 px-4 py-3 rounded-full hover:bg-gray-100 transition">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z"/></svg>
            <span class="text-xl">More</span>
          </button>
        </nav>
        <div class="mt-4 pr-4">
          <button class="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-full transition">Post</button>
        </div>
        <div class="absolute bottom-3 left-3 right-3">
          <div class="flex items-center justify-between px-3 py-2 rounded-full hover:bg-gray-100 cursor-pointer transition">
            <div class="flex items-center gap-3">
              <Avatar :src="authStore.user?.avatarUrl" :alt="authStore.user?.username || 'avatar'" :size="40" />
              <div class="hidden xl:block">
                <div class="font-semibold text-gray-900 leading-tight">{{ authStore.user?.fullName || 'Guest' }}</div>
                <div class="text-gray-500">@{{ authStore.user?.username || 'guest' }}</div>
              </div>
            </div>
            <svg class="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="currentColor"><path d="M3 12c0-1.66 3.13-3 7-3s7 1.34 7 3-3.13 3-7 3-7-1.34-7-3zm0 3c0 1.66 3.13 3 7 3s7-1.34 7-3m0 3c0 1.66-3.13 3-7 3s-7-1.34-7-3"/></svg>
          </div>
        </div>
      </aside>

      <!-- Main and Right -->
      <div class="flex w-full">
        <!-- Main timeline -->
        <main class="w-full md:max-w-[600px] border-x border-[color:var(--twitter-border)] min-h-screen pb-16 md:pb-0">
          <div class="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-[color:var(--twitter-border)]">
            <div class="flex items-center justify-between px-4 py-3">
              <h1 class="text-xl font-bold">Home</h1>
              <svg class="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3c-6.62-.1-10.38 2.42-13.05 6.03C7.29 12.61 6 17.33 6 22h2c0-1.01.07-2.01.19-3H12c4.1 0 7.48-3.08 7.94-7.05C22.79 10.15 23.17 6.36 23 3zM4 9V6H1V4h3V1h2v3h3v2H6v3H4z"/></svg>
            </div>
            <div class="flex">
              <button class="flex-1 py-3 text-center font-medium border-b-4 border-black">For you</button>
              <button class="flex-1 py-3 text-center text-gray-500 hover:bg-gray-50">Following</button>
            </div>
          </div>

          <!-- Composer -->
          <div id="composer" class="border-b border-[color:var(--twitter-border)] px-4 py-3">
            <div class="flex gap-3">
              <Avatar :src="authStore.user?.avatarUrl" :alt="authStore.user?.username || 'avatar'" :size="48" />
              <div class="flex-1">
                <textarea v-model="tweetContent" class="w-full text-xl placeholder-gray-500 resize-none focus:outline-none mb-2" placeholder="What is happening?!" rows="3" maxlength="280"></textarea>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2 text-blue-500">
                    <button class="p-2 rounded-full hover:bg-blue-50" title="Media"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M21 5H3a2 2 0 00-2 2v10a2 2 0 002 2h18a2 2 0 002-2V7a2 2 0 00-2-2zm-1 11l-4.5-6-3.5 4.67L9 12l-5 7h16z"/></svg></button>
                    <button class="p-2 rounded-full hover:bg-blue-50" title="GIF"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3 5h18v14H3V5zm4 9h2v-1H8V8H6v6h1zm4-6v6h2v-2h1v-2h-1V9h2V8h-4zm6 0v6h2V8h-2z"/></svg></button>
                    <button class="p-2 rounded-full hover:bg-blue-50" title="Poll"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M7 11h2v7H7v-7zm4-4h2v11h-2V7zm4 6h2v5h-2v-5z"/></svg></button>
                    <button class="p-2 rounded-full hover:bg-blue-50" title="Emoji"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-4 8a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm8 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM7.07 14.93a6 6 0 009.86 0l-1.41-1.41a4 4 0 01-7.04 0l-1.41 1.41z"/></svg></button>
                    <button class="p-2 rounded-full hover:bg-blue-50" title="Schedule"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5a3 3 0 00-3 3v12a3 3 0 003 3h14a3 3 0 003-3V7a3 3 0 00-3-3zm1 15a1 1 0 01-1 1H5a1 1 0 01-1-1V10h16v9z"/></svg></button>
                    <button class="p-2 rounded-full hover:bg-blue-50" title="Location"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/></svg></button>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-sm text-gray-500">{{ 280 - tweetContent.length }}</span>
                    <button @click="postTweet" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full disabled:opacity-50" :disabled="!tweetContent.trim()">Post</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Feed -->
          <div>
            <div v-for="tweet in tweets" :key="tweet.id" class="border-b border-[color:var(--twitter-border)] px-4 py-3 hover:bg-gray-50 transition">
              <div class="flex gap-3">
                <Avatar :src="tweet.user?.avatarUrl" :alt="tweet.user?.username || 'avatar'" :size="48" />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-1 text-[15px] leading-5">
                    <span class="font-bold hover:underline cursor-pointer truncate">{{ tweet.user?.fullName || 'User' }}</span>
                    <svg v-if="tweet.user?.verified" viewBox="0 0 24 24" class="w-4 h-4 text-blue-500" fill="currentColor" aria-hidden="true"><path d="M12 2l2.39 2.39 3.39-.39-.39 3.39L20 10l-2.61 2.61.39 3.39-3.39-.39L12 18l-2.39-2.39-3.39.39.39-3.39L4 10l2.61-2.61-.39-3.39 3.39.39L12 2z"/></svg>
                    <span class="text-gray-500 truncate">@{{ tweet.user?.username || 'user' }} · {{ formatDate(tweet.createdAt) }}</span>
                    <button class="ml-auto p-1 rounded-full hover:bg-gray-100">
                      <svg class="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z"/></svg>
                    </button>
                  </div>
                  <div class="mt-1 whitespace-pre-wrap break-words leading-5">{{ tweet.content }}</div>
                  <TweetMedia v-if="tweet.media && tweet.media.length" :media="tweet.media" />
                  <div class="mt-1 text-gray-500 text-[13px]" v-if="tweet.viewsCount">{{ tweet.viewsCount }} views</div>
                  <div class="mt-1 flex items-center justify-between text-gray-500 max-w-[520px]">
                    <button class="group flex items-center gap-1">
                      <span class="p-2 rounded-full group-hover:bg-blue-50">
                        <svg class="w-5 h-5 text-gray-500 group-hover:text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M20 8H4v11h16V8zM7 6h10V5a1 1 0 00-1-1H8a1 1 0 00-1 1v1z"/></svg>
                      </span>
                      <span class="text-sm group-hover:text-blue-500">{{ tweet.repliesCount || 0 }}</span>
                    </button>
                    <button class="group flex items-center gap-1">
                      <span class="p-2 rounded-full group-hover:bg-green-50">
                        <svg class="w-5 h-5 text-gray-500 group-hover:text-green-600" viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h11v3h-2v5H7l2.5-2.5L7 10l-4 4V7h4z"/></svg>
                      </span>
                      <span class="text-sm group-hover:text-green-600">{{ tweet.retweetsCount || 0 }}</span>
                    </button>
                    <button class="group flex items-center gap-1">
                      <span class="p-2 rounded-full group-hover:bg-pink-50">
                        <svg class="w-5 h-5 text-gray-500 group-hover:text-pink-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12.1 8.64l-.1.1-.11-.11C9.14 5.9 4.6 7.24 4.6 10.8c0 2.35 2.58 4.38 6.55 8.05l.75.67.75-.67c3.97-3.67 6.55-5.7 6.55-8.05 0-3.56-4.54-4.9-7.4-2.16z"/></svg>
                      </span>
                      <span class="text-sm group-hover:text-pink-500">{{ tweet.likesCount || 0 }}</span>
                    </button>
                    <button class="group flex items-center gap-1">
                      <span class="p-2 rounded-full group-hover:bg-blue-50">
                        <svg class="w-5 h-5 text-gray-500 group-hover:text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M17.53 7.47l-5-5-5 5 1.06 1.06L11 6.12V18h2V6.12l2.41 2.41 1.12-1.06z"/></svg>
                      </span>
                    </button>
                    <button class="group flex items-center gap-1">
                      <span class="p-2 rounded-full group-hover:bg-blue-50">
                        <svg class="w-5 h-5 text-gray-500 group-hover:text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5v14m-7-7h14"/></svg>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <!-- Right sidebar -->
        <aside class="hidden lg:block w-[350px] ml-6 py-3">
          <div class="sticky top-0 bg-white/80 backdrop-blur pb-3">
            <div class="relative">
              <input type="text" placeholder="Search" class="w-full bg-gray-100 rounded-full py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="currentColor"><path d="M10.25 3.75a6.5 6.5 0 100 13 6.5 6.5 0 000-13zm8.28 13.72l3.97 3.97-1.41 1.41-3.97-3.97a8.5 8.5 0 111.41-1.41z"/></svg>
            </div>
          </div>
          <div class="bg-[color:var(--twitter-panel)] rounded-2xl overflow-hidden">
            <div class="p-4">
              <h2 class="text-xl font-extrabold">What’s happening</h2>
              <div class="mt-3 space-y-3">
                <div v-for="trend in trends" :key="trend.id" class="cursor-pointer hover:bg-gray-100 p-3 rounded-lg transition">
                  <p class="text-sm text-gray-500">{{ trend.category }}</p>
                  <p class="font-bold hover:underline">{{ trend.title }}</p>
                  <p class="text-sm text-gray-500">{{ trend.tweetsCount }} posts</p>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-4 bg-[color:var(--twitter-panel)] rounded-2xl overflow-hidden">
            <div class="p-4">
              <h2 class="text-xl font-extrabold">Who to follow</h2>
              <div class="mt-3 space-y-3">
                <div v-for="user in suggestedUsers" :key="user.id" class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <Avatar :src="user.avatarUrl" :alt="user.username || 'avatar'" :size="44" />
                    <div>
                      <p class="font-bold hover:underline cursor-pointer">{{ user.fullName }}</p>
                      <p class="text-sm text-gray-500">@{{ user.username }}</p>
                    </div>
                  </div>
                  <button class="bg-black text-white text-sm font-bold py-2 px-4 rounded-full hover:bg-gray-800 transition">Follow</button>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-4 text-xs text-gray-500 space-y-2">
            <div class="flex flex-wrap gap-x-3 gap-y-2">
              <a href="#" class="hover:underline">Terms of Service</a>
              <a href="#" class="hover:underline">Privacy Policy</a>
              <a href="#" class="hover:underline">Cookie Policy</a>
              <a href="#" class="hover:underline">Accessibility</a>
              <a href="#" class="hover:underline">Ads info</a>
              <a href="#" class="hover:underline">More</a>
            </div>
            <p>© 2024 My Twitter Clone</p>
          </div>
        </aside>
      </div>
    </div>
    <!-- Mobile bottom navigation -->
    <nav class="fixed bottom-0 left-0 right-0 md:hidden bg-white/95 backdrop-blur border-t border-[color:var(--twitter-border)] h-14 flex items-center justify-around z-40 pb-[env(safe-area-inset-bottom)]">
    <router-link to="/" class="p-2" aria-label="Home">
      <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M21.59 7.15L12.52 1.16a1 1 0 00-1.04 0L2.41 7.15a1 1 0 00-.41.76v13.18c0 .5.42.91.93.91H9.14c.51 0 .93-.41.93-.91v-7.08h3.9v7.08c0 .5.42.91.93.91h6.16c.51 0 .93-.41.93-.91V7.91a1 1 0 00-.41-.76z"/></svg>
    </router-link>
    <router-link to="/explore" class="p-2" aria-label="Explore">
      <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M10.25 3.75a6.5 6.5 0 100 13 6.5 6.5 0 000-13zm8.28 13.72l3.97 3.97-1.41 1.41-3.97-3.97a8.5 8.5 0 111.41-1.41z"/></svg>
    </router-link>
    <router-link to="/notifications" class="p-2" aria-label="Notifications">
      <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M20 16H4l1-7a7 7 0 0114 0l1 7zm-8 6a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>
    </router-link>
    <router-link to="/messages" class="p-2" aria-label="Messages">
      <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M3 4h18a2 2 0 012 2v12a2 2 0 01-2 2H3a2 2 0 01-2-2V6a2 2 0 012-2zm9 7l9-5H3l9 5zm0 2l-9-5v10h18V8l-9 5z"/></svg>
    </router-link>
    </nav>
    <!-- Floating compose button (mobile) -->
    <button @click="scrollToComposer" class="md:hidden fixed bottom-20 right-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center z-50">
      <svg class="w-7 h-7" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5v14m-7-7h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Avatar from '@/components/Avatar.vue'
import TweetMedia from '@/components/TweetMedia.vue'

const authStore = useAuthStore()

const tweetContent = ref('')
const tweets = ref<any[]>([])
const trends = ref([
  { id: 1, category: 'Technology', title: 'Vue 3.4', tweetsCount: '12.5K' },
  { id: 2, category: 'Sports', title: 'World Cup', tweetsCount: '45.2K' },
  { id: 3, category: 'Entertainment', title: 'New Movie', tweetsCount: '8.9K' },
])
const suggestedUsers = ref([
  { id: 1, username: 'johndoe', fullName: 'John Doe', avatarUrl: null },
  { id: 2, username: 'janedoe', fullName: 'Jane Smith', avatarUrl: null },
  { id: 3, username: 'bobsmith', fullName: 'Bob Johnson', avatarUrl: null },
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

const postTweet = () => {
  if (!tweetContent.value.trim()) return

  const newTweet = {
    id: Date.now(),
    content: tweetContent.value,
    user: authStore.user,
    createdAt: new Date().toISOString(),
    repliesCount: 0,
    retweetsCount: 0,
    likesCount: 0,
  }

  tweets.value.unshift(newTweet)
  tweetContent.value = ''
}

const scrollToComposer = () => {
  const el = document.getElementById('composer')
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

onMounted(() => {
  authStore.initialize()

  // Mock tweets data
  tweets.value = [
    {
      id: 1,
      content: 'Just started working on my new Twitter clone project! 🚀 #vuejs #twitter',
      user: {
        id: 1,
        username: 'devuser',
        fullName: 'Dev User',
        avatarUrl: null,
        verified: true,
      },
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      repliesCount: 5,
      retweetsCount: 12,
      likesCount: 25,
      viewsCount: '12.4K',
      media: [
        'https://picsum.photos/id/40/1200/800',
      ],
    },
    {
      id: 2,
      content: 'The weather is amazing today! Perfect for coding outside ☀️',
      user: {
        id: 2,
        username: 'naturelover',
        fullName: 'Nature Lover',
        avatarUrl: null,
      },
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      repliesCount: 2,
      retweetsCount: 3,
      likesCount: 18,
      viewsCount: '3,201',
      media: [
        'https://picsum.photos/id/10/1200/800',
        'https://picsum.photos/id/20/1200/800',
        'https://picsum.photos/id/30/1200/800',
      ],
    },
  ]
})
</script>
