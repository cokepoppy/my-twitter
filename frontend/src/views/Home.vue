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
        <div class="absolute bottom-3 left-3 right-3" ref="accountAreaRef">
          <div
            class="flex items-center justify-between px-3 py-2 rounded-full hover:bg-gray-100 cursor-pointer transition"
            @click="toggleAccountMenu"
            aria-haspopup="true"
            :aria-expanded="showAccountMenu ? 'true' : 'false'"
          >
            <div class="flex items-center gap-3">
              <Avatar :src="authStore.user?.avatarUrl" :alt="authStore.user?.username || 'avatar'" :size="40" />
              <div class="hidden xl:block">
                <div class="font-semibold text-gray-900 leading-tight">{{ authStore.user?.fullName || 'Guest' }}</div>
                <div class="text-gray-500">@{{ authStore.user?.username || 'guest' }}</div>
              </div>
            </div>
            <svg class="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z"/></svg>
          </div>
          <!-- Account switcher hover card -->
          <div
            v-if="showAccountMenu"
            ref="menuRef"
            class="absolute bottom-16 left-0 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-50"
            role="group"
          >
            <div class="relative">
              <svg viewBox="0 0 24 24" aria-hidden="true" class="absolute -bottom-6 left-5 w-6 h-6 text-white">
                <path d="M22 17H2L12 6l10 11z" class="fill-white stroke-gray-200" />
              </svg>
              <div class="divide-y divide-gray-100 rounded-xl overflow-hidden">
                <button type="button" class="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition" @click="goAddAccount">
                  <span class="text-[15px] text-gray-900">Add an existing account</span>
                </button>
                <button type="button" class="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition" @click="handleLogout">
                  <span class="text-[15px] text-gray-900">Log out @{{ authStore.user?.username }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main and Right -->
      <div class="flex w-full">
        <!-- Main timeline -->
        <main class="w-full md:max-w-[600px] border-x border-[color:var(--twitter-border)] min-h-screen pb-16 md:pb-0">
          <template v-if="$route.name === 'home'">
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
                  <textarea ref="composerRef" v-model="tweetContent" class="w-full text-xl placeholder-gray-500 resize-none focus:outline-none mb-2" placeholder="What is happening?!" rows="3" maxlength="280"></textarea>
                  <!-- Attachments preview -->
                <div v-if="attachments.length" class="mb-2">
                  <div v-if="isImageMode" class="grid grid-cols-2 gap-2">
                    <div v-for="(att, idx) in attachments" :key="idx" class="relative rounded-lg overflow-hidden">
                      <img :src="att.url" class="w-full h-40 object-cover" />
                      <button @click="removeAttachment(idx)" class="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center">×</button>
                    </div>
                  </div>
                  <div v-else class="relative rounded-lg overflow-hidden">
                    <video v-if="attachments[0]" :src="attachments[0].url" controls class="w-full max-h-72"></video>
                    <button @click="removeAttachment(0)" class="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center">×</button>
                  </div>
                </div>
                <!-- Poll builder -->
                <div v-if="showPoll" class="mb-3 rounded-xl border border-[color:var(--twitter-border)] p-3 bg-gray-50">
                  <div class="flex items-center justify-between mb-2">
                    <div class="font-semibold text-gray-700">Poll</div>
                    <button class="text-sm text-gray-500 hover:underline" @click="togglePoll">Remove</button>
                  </div>
                  <div class="space-y-2">
                    <div v-for="(opt, i) in pollOptions" :key="i" class="flex items-center gap-2">
                      <input
                        v-model="pollOptions[i]"
                        :placeholder="`Choice ${i + 1}`"
                        maxlength="25"
                        class="flex-1 rounded border px-3 py-2 focus:outline-none"
                      />
                      <button
                        v-if="pollOptions.length > 2 && i >= 2"
                        @click="removePollOption(i)"
                        class="text-gray-500 hover:text-gray-700"
                        title="Remove option"
                        aria-label="Remove option"
                      >×</button>
                    </div>
                    <div class="flex items-center justify-between">
                      <button
                        class="text-sm text-blue-600 disabled:text-gray-400"
                        @click="addPollOption"
                        :disabled="pollOptions.length >= 4"
                      >Add option</button>
                      <div class="flex items-center gap-2 text-sm text-gray-600">
                        <label class="text-gray-500">Duration</label>
                        <input type="number" min="0" max="7" v-model.number="pollDays" class="w-14 rounded border px-2 py-1" aria-label="Poll days" />
                        <span>days</span>
                        <input type="number" min="0" max="23" v-model.number="pollHours" class="w-14 rounded border px-2 py-1" aria-label="Poll hours" />
                        <span>hours</span>
                        <input type="number" min="0" max="59" v-model.number="pollMinutes" class="w-14 rounded border px-2 py-1" aria-label="Poll minutes" />
                        <span>minutes</span>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- Quote preview -->
                <div v-if="quoteTweetData" class="mb-2 border rounded-xl p-3 text-sm text-gray-700 bg-gray-50">
                  <div class="font-semibold">Quoting @{{ quoteTweetData.user?.username }}</div>
                  <div class="line-clamp-3 whitespace-pre-wrap">{{ quoteTweetData.content }}</div>
                  <button @click="clearQuote" class="mt-1 text-xs text-gray-500 hover:underline">Remove quote</button>
                </div>
                <div class="flex items-center justify-between relative">
                  <div class="flex items-center text-twitter-blue space-x-1.5">
                    <button
                      @click="triggerFile"
                      :class="['flex items-center justify-center w-9 h-9 rounded-full', canAddMedia ? 'hover:bg-blue-50' : 'text-blue-300 cursor-not-allowed']"
                      title="Media"
                      aria-label="Add media"
                      :aria-disabled="!canAddMedia"
                    >
                      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M21 5H3a2 2 0 00-2 2v10a2 2 0 002 2h18a2 2 0 002-2V7a2 2 0 00-2-2zm-1 11l-4.5-6-3.5 4.67L9 12l-5 7h16z"/></svg>
                    </button>
                    <input ref="fileInput" type="file" class="hidden" multiple :accept="currentAccept" @change="onFilesSelected" />
                    <button
                      @click="triggerGif"
                      :class="['flex items-center justify-center w-9 h-9 rounded-full', canAddMedia ? 'hover:bg-blue-50' : 'text-blue-300 cursor-not-allowed']"
                      title="GIF"
                      aria-label="Add GIF"
                      :aria-disabled="!canAddMedia"
                    >
                      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3 5h18v14H3V5zm4 9h2v-1H8V8H6v6h1zm4-6v6h2v-2h1v-2h-1V9h2V8h-4zm6 0v6h2V8h-2z"/></svg>
                    </button>
                    <button
                      @click="togglePoll"
                      :class="['flex items-center justify-center w-9 h-9 rounded-full', canAddPoll ? 'hover:bg-blue-50' : 'text-blue-300 cursor-not-allowed']"
                      title="Poll"
                      aria-label="Add poll"
                      :aria-pressed="showPoll ? 'true' : 'false'"
                      :aria-disabled="!canAddPoll"
                    >
                      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M7 11h2v7H7v-7zm4-4h2v11h-2V7zm4 6h2v5h-2v-5z"/></svg>
                    </button>
                    <div class="relative" ref="emojiRef">
                      <button
                        @click="toggleEmojiPicker"
                        class="flex items-center justify-center w-9 h-9 rounded-full hover:bg-blue-50"
                        title="Emoji"
                        aria-label="Add emoji"
                        :aria-expanded="showEmoji ? 'true' : 'false'"
                      >
                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-4 8a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm8 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM7.07 14.93a6 6 0 009.86 0l-1.41-1.41a4 4 0 01-7.04 0l-1.41 1.41z"/></svg>
                      </button>
                      <div v-if="showEmoji" class="absolute z-30 mt-1 w-60 rounded-lg border bg-white p-2 shadow">
                        <div class="grid grid-cols-8 gap-1 text-xl">
                          <button v-for="(emo, i) in emojiList" :key="i" @click="insertEmoji(emo)" class="p-1 hover:bg-gray-100 rounded" :aria-label="`Insert ${emo}`">{{ emo }}</button>
                        </div>
                      </div>
                    </div>
                    <div class="relative" ref="scheduleRef">
                      <button
                        @click="toggleSchedule"
                        class="flex items-center justify-center w-9 h-9 rounded-full hover:bg-blue-50"
                        title="Schedule"
                        aria-label="Schedule"
                        :aria-expanded="showSchedule ? 'true' : 'false'"
                      >
                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5a3 3 0 00-3 3v12a3 3 0 003 3h14a3 3 0 003-3V7a3 3 0 00-3-3zm1 15a1 1 0 01-1 1H5a1 1 0 01-1-1V10h16v9z"/></svg>
                      </button>
                      <div v-if="showSchedule" class="absolute z-30 mt-1 w-72 rounded-lg border bg-white p-3 shadow">
                        <div class="font-semibold text-gray-700 mb-2">Schedule post</div>
                        <input type="datetime-local" v-model="scheduledAt" class="w-full rounded border px-3 py-2 mb-2" />
                        <div class="flex justify-end gap-2">
                          <button class="text-sm text-gray-500 hover:underline" @click="clearSchedule">Clear</button>
                          <button class="text-sm text-blue-600" @click="applySchedule">Set</button>
                        </div>
                      </div>
                    </div>
                    <button class="flex items-center justify-center w-9 h-9 rounded-full text-blue-300 cursor-not-allowed" title="Location" aria-label="Location" aria-disabled="true"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/></svg></button>
                  </div>
                  <div class="flex items-center gap-3">
                    <div v-if="scheduledAtLabel" class="text-xs text-gray-500">Scheduled: {{ scheduledAtLabel }}</div>
                    <span class="text-sm" :class="remainingChars < 0 ? 'text-red-500' : 'text-gray-500'">{{ remainingChars }}</span>
                    <button @click="postTweet" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full disabled:opacity-50 disabled:cursor-not-allowed" :disabled="posting || !canSubmit || remainingChars < 0">
                      {{ posting ? (isScheduling ? 'Scheduling…' : 'Posting…') : (isScheduling ? 'Schedule' : 'Post') }}
                    </button>
                  </div>
                </div>
                <p v-if="postError" class="mt-2 text-sm text-red-600">{{ postError }}</p>
              </div>
            </div>
          </div>

            <!-- New posts banner -->
            <div v-if="newCount > 0" class="px-4 py-2 border-b border-[color:var(--twitter-border)] bg-blue-50/60 sticky top-[3.5rem] z-10">
              <button @click="showNewPosts" class="w-full text-center text-[15px] font-medium text-twitter-blue hover:underline">
                Show {{ newCount }} {{ newCount === 1 ? 'post' : 'posts' }}
              </button>
            </div>

            <!-- Reply modal -->
            <ReplyModal v-if="replyingTo" :tweet="replyingTo" @close="replyingTo=null" @submitted="onReplySubmitted" />

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
                    <button class="ml-auto p-1 rounded-full hover:bg-gray-100" @click.stop>
                      <svg class="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z"/></svg>
                    </button>
                  </div>
                  <div v-if="tweet.replyToTweetId && tweet.parentTweet && tweet.parentTweet.user" class="text-sm text-gray-600">
                    Replying to
                    <router-link :to="`/profile/${tweet.parentTweet.user.username}`" class="text-twitter-blue hover:underline" @click.stop>
                      @{{ tweet.parentTweet.user.username }}
                    </router-link>
                  </div>
                  <!-- Clickable area to open detail -->
                  <div @click="goTweet(tweet.id)" class="cursor-pointer">
                    <div class="mt-1 whitespace-pre-wrap break-words leading-5">{{ tweet.content }}</div>
                    <!-- Quote original tweet preview -->
                    <div v-if="tweet.retweetId && tweet.originalTweet" class="mt-2 border rounded-xl p-3 bg-gray-50">
                      <div class="text-sm text-gray-700">
                        <span class="font-semibold">@{{ tweet.originalTweet.user?.username }}</span>
                      </div>
                      <div class="text-sm whitespace-pre-wrap break-words">{{ tweet.originalTweet.content }}</div>
                    </div>
                    <!-- Images/GIFs -->
                    <TweetMedia
                      v-if="tweet.media && tweet.media.filter((m: any) => m.fileType !== 'video').length"
                      :media="tweet.media.filter((m: any) => m.fileType !== 'video').map((m: any) => m.fileUrl)"
                    />
                    <!-- Single Video -->
                    <div v-if="tweet.media && tweet.media.some((m: any) => m.fileType === 'video')" class="mt-2 overflow-hidden rounded-2xl border border-[color:var(--twitter-border)]">
                      <video :src="tweet.media.find((m: any) => m.fileType === 'video')?.fileUrl" controls class="w-full max-h-[560px] bg-black"></video>
                    </div>
                    <div class="mt-1 text-gray-500 text-[13px]" v-if="tweet.viewsCount">{{ tweet.viewsCount }} views</div>
                  </div>
                  <div class="mt-1 flex items-center justify-between text-gray-500 max-w-[520px]">
                    <button class="group flex items-center gap-1" @click="onReply(tweet)">
                      <span class="p-2 rounded-full group-hover:bg-blue-50">
                        <svg class="w-5 h-5 text-gray-500 group-hover:text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M20 8H4v11h16V8zM7 6h10V5a1 1 0 00-1-1H8a1 1 0 00-1 1v1z"/></svg>
                      </span>
                      <span class="text-sm group-hover:text-blue-500">{{ tweet.repliesCount || 0 }}</span>
                    </button>
                    <div class="relative">
                      <button class="group flex items-center gap-1" @click.stop="toggleRetweetMenu(tweet)">
                        <span class="p-2 rounded-full group-hover:bg-green-50">
                          <svg class="w-5 h-5" :class="tweet.isRetweeted ? 'text-green-600' : 'text-gray-500 group-hover:text-green-600'" viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h11v3h-2v5H7l2.5-2.5L7 10l-4 4V7h4z"/></svg>
                        </span>
                        <span class="text-sm" :class="tweet.isRetweeted ? 'text-green-600' : 'group-hover:text-green-600'">{{ tweet.retweetsCount || 0 }}</span>
                      </button>
                      <div v-if="retweetMenuFor === tweet.id" class="absolute z-20 mt-1 w-36 bg-white border rounded-xl shadow-lg">
                        <button @click.stop="retweet(tweet)" class="w-full text-left px-4 py-2 hover:bg-gray-100">Retweet</button>
                        <button @click.stop="onQuote(tweet)" class="w-full text-left px-4 py-2 hover:bg-gray-100">Quote</button>
                      </div>
                    </div>
                    <button class="group flex items-center gap-1" @click="toggleLike(tweet)">
                      <span class="p-2 rounded-full group-hover:bg-pink-50">
                        <svg class="w-5 h-5" :class="tweet.isLiked ? 'text-pink-500' : 'text-gray-500 group-hover:text-pink-500'" viewBox="0 0 24 24" fill="currentColor"><path d="M12.1 8.64l-.1.1-.11-.11C9.14 5.9 4.6 7.24 4.6 10.8c0 2.35 2.58 4.38 6.55 8.05l.75.67.75-.67c3.97-3.67 6.55-5.7 6.55-8.05 0-3.56-4.54-4.9-7.4-2.16z"/></svg>
                      </span>
                      <span class="text-sm" :class="tweet.isLiked ? 'text-pink-500' : 'group-hover:text-pink-500'">{{ tweet.likesCount || 0 }}</span>
                    </button>
                    <button class="group flex items-center gap-1" @click="shareTweet(tweet)">
                      <span class="p-2 rounded-full group-hover:bg-blue-50">
                        <svg class="w-5 h-5 text-gray-500 group-hover:text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"/></svg>
                      </span>
                    </button>
                    <button class="group flex items-center gap-1" @click="toggleBookmark(tweet)">
                      <span class="p-2 rounded-full group-hover:bg-yellow-50">
                        <svg class="w-5 h-5" :class="tweet.isBookmarked ? 'text-yellow-600' : 'text-gray-500 group-hover:text-yellow-600'" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"/></svg>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </template>
          <router-view v-else />
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
              <div class="flex items-center justify-between">
                <h2 class="text-xl font-extrabold">Who to follow</h2>
                <button @click="refreshHomeSuggestions" class="text-sm text-gray-600 hover:text-gray-900">Refresh</button>
              </div>
              <div class="mt-3 space-y-3">
                <div v-for="user in suggestedUsers" :key="user.id" class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <Avatar :src="user.avatarUrl" :alt="user.username || 'avatar'" :size="44" />
                    <div>
                      <p class="font-bold hover:underline cursor-pointer">{{ user.fullName }}</p>
                      <p class="text-sm text-gray-500">@{{ user.username }}</p>
                    </div>
                  </div>
                  <FollowButton :username="user.username" />
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
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import Avatar from '@/components/Avatar.vue'
import TweetMedia from '@/components/TweetMedia.vue'
import FollowButton from '@/components/FollowButton.vue'
import ReplyModal from '@/components/ReplyModal.vue'

const authStore = useAuthStore()
const router = useRouter()
const showAccountMenu = ref(false)
const menuRef = ref<HTMLElement | null>(null)
const accountAreaRef = ref<HTMLElement | null>(null)

const tweetContent = ref('')
const composerRef = ref<HTMLTextAreaElement | null>(null)
const posting = ref(false)
const postError = ref('')
const remainingChars = computed(() => 280 - tweetContent.value.length)
const tweets = ref<any[]>([])
const newCount = ref(0)
const topId = ref<any | null>(null)
let pollTimer: any = null
const attachments = ref<Array<{ file: File; url: string; type: 'image' | 'video' | 'gif' }>>([])
const fileInput = ref<HTMLInputElement | null>(null)
const isImageMode = computed(() => attachments.value.length > 0 && attachments.value[0].type === 'image')
const defaultAccept = 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm'
const currentAccept = ref<string>(defaultAccept)
const emojiList = ['😀','😁','😂','🤣','😊','😍','😘','😎','🤔','😅','👏','👍','🔥','💯','🎉','✨','😢','😭','🤯','🙏','🙌','💪','💡','✅','❌','⭐','🌟','🌈','🌙','☀️','🍕','🍔','🥳','🎯','🧠','⚡']
const showEmoji = ref(false)
const emojiRef = ref<HTMLElement | null>(null)
const showPoll = ref(false)
const pollOptions = ref<string[]>(['',''])
const pollDays = ref<number>(1)
const pollHours = ref<number>(0)
const pollMinutes = ref<number>(0)
const showSchedule = ref(false)
const scheduleRef = ref<HTMLElement | null>(null)
const scheduledAt = ref<string>('')
const scheduledAtLabel = computed(() => {
  if (!scheduledAt.value) return ''
  const dt = new Date(scheduledAt.value)
  if (isNaN(dt.getTime())) return ''
  return dt.toLocaleString()
})
const isScheduling = computed(() => {
  if (!scheduledAt.value) return false
  const dt = new Date(scheduledAt.value)
  return dt.getTime() > Date.now()
})
const hasValidPoll = computed(() => {
  if (!showPoll.value) return false
  const vals = pollOptions.value.map(v => v.trim()).filter(Boolean)
  if (vals.length < 2) return false
  // duration must be > 0 and <= 7 days
  const secs = pollDurationSeconds()
  return secs >= 60 && secs <= 7 * 24 * 3600
})
const canAddPoll = computed(() => attachments.value.length === 0)
const canAddMedia = computed(() => !showPoll.value)
const canSubmit = computed(() => {
  // backend requires non-empty content (1..280)
  return tweetContent.value.trim().length > 0
})
const quoteTweetData = ref<any | null>(null)
const quoteTweetId = computed(() => (quoteTweetData.value ? quoteTweetData.value.id : null))
const replyingTo = ref<any | null>(null)
const trends = ref([
  { id: 1, category: 'Technology', title: 'Vue 3.4', tweetsCount: '12.5K' },
  { id: 2, category: 'Sports', title: 'World Cup', tweetsCount: '45.2K' },
  { id: 3, category: 'Entertainment', title: 'New Movie', tweetsCount: '8.9K' },
])
const retweetMenuFor = ref<any | null>(null)
const bookmarks = ref<Set<string>>(new Set())

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
  try {
    localStorage.setItem('bookmarks', JSON.stringify(Array.from(bookmarks.value)))
  } catch (_) {}
}
const suggestedUsers = ref<any[]>([])
const homeSuggOffset = ref(0)

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

const doPostTweet = async (content: string, files: typeof attachments.value, quoteId: number | null, poll: string[] | null) => {
  const payload: any = { content }
  if (quoteId) payload.retweetId = quoteId
  // Include poll in payload (backend may ignore for now)
  if (poll && poll.length >= 2) {
    payload.poll = {
      options: poll,
      durationSeconds: pollDurationSeconds()
    }
  }
  const res = await axios.post('/api/tweets', payload)
  const created = res.data?.data
  if (!created) throw new Error('Create tweet failed')
  if (files.length) {
    const form = new FormData()
    files.forEach(a => form.append('files', a.file))
    const up = await axios.post(`/api/tweets/${created.id}/media`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
    created.media = up.data?.data || []
  }
  if (payload.poll) {
    // surface poll client-side so it appears immediately in feed
    created.poll = payload.poll
  }
  return created
}

const postTweet = async () => {
  if (!canSubmit.value || remainingChars.value < 0) return
  postError.value = ''
  // snapshot current inputs to allow scheduling without later mutations
  const content = tweetContent.value.trim()
  const files = [...attachments.value]
  const quoteId = quoteTweetId.value
  const poll = hasValidPoll.value ? pollOptions.value.map(v => v.trim()).filter(Boolean) : null

  const scheduleTime = isScheduling.value ? new Date(scheduledAt.value).getTime() : 0
  const now = Date.now()
  if (scheduleTime && scheduleTime > now + 1000) {
    posting.value = true
    try {
      const delay = scheduleTime - now
      setTimeout(async () => {
        try {
          const created = await doPostTweet(content, files, quoteId, poll)
          tweets.value.unshift(created)
          topId.value = created.id
          newCount.value = 0
        } catch (err: any) {
          postError.value = err?.response?.data?.message || err?.message || 'Failed to post scheduled tweet'
        }
      }, delay)
      // clear UI immediately after scheduling
      tweetContent.value = ''
      attachments.value = []
      quoteTweetData.value = null
      showPoll.value = false
      pollOptions.value = ['','']
      scheduledAt.value = ''
    } finally {
      posting.value = false
    }
    return
  }

  posting.value = true
  try {
    const created = await doPostTweet(content, files, quoteId, poll)
    tweets.value.unshift(created)
    topId.value = created.id
    newCount.value = 0
    tweetContent.value = ''
    attachments.value = []
    quoteTweetData.value = null
    showPoll.value = false
    pollOptions.value = ['','']
  } catch (err: any) {
    postError.value = err?.response?.data?.message || err?.message || 'Failed to post tweet'
  } finally {
    posting.value = false
  }
}

const checkForNewTweets = async () => {
  try {
    const res = await axios.get('/api/tweets/timeline', { params: { page: 1, limit: 20 } })
    const items = res.data?.data || []
    if (!items.length || !topId.value) return
    const idx = items.findIndex((t: any) => t.id === topId.value)
    if (idx > 0) newCount.value = idx
    else if (idx === -1) newCount.value = items.length
  } catch (_) {
    // ignore
  }
}

const showNewPosts = async () => {
  try {
    const res = await axios.get('/api/tweets/timeline', { params: { page: 1, limit: 20 } })
    tweets.value = res.data?.data || []
    topId.value = tweets.value.length ? tweets.value[0].id : null
    newCount.value = 0
    const el = document.querySelector('main')
    if (el) (el as HTMLElement).scrollTo({ top: 0, behavior: 'smooth' })
  } catch (_) {
    // ignore
  }
}

const scrollToComposer = () => {
  const el = document.getElementById('composer')
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const triggerFile = () => {
  if (!canAddMedia.value) {
    postError.value = 'Polls cannot be combined with media'
    return
  }
  currentAccept.value = defaultAccept
  fileInput.value?.click()
}

const triggerGif = () => {
  if (!canAddMedia.value) {
    postError.value = 'Polls cannot be combined with media'
    return
  }
  currentAccept.value = 'image/gif'
  fileInput.value?.click()
}

const onFilesSelected = (e: Event) => {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files || [])
  if (!files.length) return
  // reset accept back to default after selection
  currentAccept.value = defaultAccept
  if (showPoll.value) {
    postError.value = 'Polls cannot be combined with media'
    return
  }
  const imgs = files.filter(f => f.type.startsWith('image/') && f.type !== 'image/gif')
  const gifs = files.filter(f => f.type === 'image/gif')
  const vids = files.filter(f => f.type.startsWith('video/'))
  if (vids.length + gifs.length > 1) {
    postError.value = 'Only one video or GIF allowed'
    return
  }
  if ((vids.length > 0 || gifs.length > 0) && files.length > 1) {
    postError.value = 'Cannot mix video/GIF with other files'
    return
  }
  if (imgs.length > 4) {
    postError.value = 'Up to 4 images allowed'
    return
  }
  attachments.value = files.map(f => ({
    file: f,
    url: URL.createObjectURL(f),
    type: f.type === 'image/gif' ? 'gif' : f.type.startsWith('video/') ? 'video' : 'image'
  }))
}

const removeAttachment = (idx: number) => {
  attachments.value.splice(idx, 1)
}

const onQuote = (tweet: any) => {
  quoteTweetData.value = tweet
  scrollToComposer()
}

const clearQuote = () => {
  quoteTweetData.value = null
}

const onReply = (tweet: any) => {
  replyingTo.value = tweet
}

// Actions under tweet
const toggleRetweetMenu = (tweet: any) => {
  retweetMenuFor.value = retweetMenuFor.value === tweet.id ? null : tweet.id
}

const retweet = async (tweet: any) => {
  try {
    await axios.post(`/api/tweets/${tweet.id}/retweet`)
    tweet.isRetweeted = !tweet.isRetweeted
    const cur = Number(tweet.retweetsCount || 0)
    tweet.retweetsCount = cur + (tweet.isRetweeted ? 1 : -1)
  } catch (_) {
    // noop
  } finally {
    retweetMenuFor.value = null
  }
}

const toggleLike = async (tweet: any) => {
  try {
    await axios.post(`/api/tweets/${tweet.id}/like`)
    tweet.isLiked = !tweet.isLiked
    const cur = Number(tweet.likesCount || 0)
    tweet.likesCount = cur + (tweet.isLiked ? 1 : -1)
  } catch (_) {
    // noop
  }
}

const shareTweet = async (tweet: any) => {
  const url = `${window.location.origin}/tweet/${tweet.id}`
  try {
    await navigator.clipboard.writeText(url)
    // Optional: toast could be implemented here
  } catch (_) {
    // fallback
    window.prompt('Copy link to tweet:', url)
  }
}

const goTweet = (id: string | number) => {
  router.push(`/tweet/${id}`)
}

const toggleBookmark = (tweet: any) => {
  const id = String(tweet.id)
  if (bookmarks.value.has(id)) {
    bookmarks.value.delete(id)
    tweet.isBookmarked = false
  } else {
    bookmarks.value.add(id)
    tweet.isBookmarked = true
  }
  saveBookmarks()
}

// Emoji
const toggleEmojiPicker = () => {
  showEmoji.value = !showEmoji.value
}
const insertEmoji = (emo: string) => {
  const el = composerRef.value
  if (!el) {
    tweetContent.value += emo
  } else {
    const start = el.selectionStart || 0
    const end = el.selectionEnd || 0
    tweetContent.value = tweetContent.value.slice(0, start) + emo + tweetContent.value.slice(end)
    // move caret
    nextTick(() => {
      const pos = start + emo.length
      el.setSelectionRange(pos, pos)
      el.focus()
    })
  }
  showEmoji.value = false
}

// Poll
const togglePoll = () => {
  if (!canAddPoll.value) return
  showPoll.value = !showPoll.value
  if (showPoll.value) {
    attachments.value = []
  } else {
    pollOptions.value = ['','']
  }
}
const addPollOption = () => {
  if (pollOptions.value.length < 4) pollOptions.value.push('')
}
const removePollOption = (i: number) => {
  if (pollOptions.value.length > 2) pollOptions.value.splice(i, 1)
}
const pollDurationSeconds = () => {
  const d = Math.max(0, Math.min(7, pollDays.value || 0))
  const h = Math.max(0, Math.min(23, pollHours.value || 0))
  const m = Math.max(0, Math.min(59, pollMinutes.value || 0))
  return d * 86400 + h * 3600 + m * 60
}

// Schedule
const toggleSchedule = () => {
  showSchedule.value = !showSchedule.value
}
const clearSchedule = () => {
  scheduledAt.value = ''
  showSchedule.value = false
}
const applySchedule = () => {
  // ensure future time
  if (scheduledAt.value) {
    const dt = new Date(scheduledAt.value)
    if (isNaN(dt.getTime()) || dt.getTime() <= Date.now()) {
      postError.value = 'Please choose a future time'
      return
    }
  }
  showSchedule.value = false
}

onMounted(async () => {
  authStore.initialize()
  document.addEventListener('click', onDocumentClick)
  loadBookmarks()
  try {
    const res = await axios.get('/api/tweets/timeline', { params: { page: 1, limit: 20 } })
    tweets.value = (res.data?.data || []).map((t: any) => ({ ...t, isBookmarked: bookmarks.value.has(String(t.id)) }))
    topId.value = tweets.value.length ? tweets.value[0].id : null
  } catch (e) {
    // leave empty if API not ready
  }
  try {
    const sug = await axios.get('/api/follows/suggestions', { params: { limit: 3, offset: homeSuggOffset.value } })
    suggestedUsers.value = sug.data?.data || []
  } catch (_) {
    suggestedUsers.value = []
  }
  // Start polling for new posts
  pollTimer = setInterval(checkForNewTweets, 15000)
})

const refreshHomeSuggestions = async () => {
  try {
    homeSuggOffset.value += 3
    const sug = await axios.get('/api/follows/suggestions', { params: { limit: 3, offset: homeSuggOffset.value } })
    suggestedUsers.value = sug.data?.data || []
  } catch (_) {
    // ignore
  }
}

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  if (pollTimer) clearInterval(pollTimer)
})

const toggleAccountMenu = () => {
  showAccountMenu.value = !showAccountMenu.value
}

const onDocumentClick = (e: MouseEvent) => {
  const target = e.target as Node
  if (
    showAccountMenu.value &&
    menuRef.value &&
    accountAreaRef.value &&
    !menuRef.value.contains(target) &&
    !accountAreaRef.value.contains(target)
  ) {
    showAccountMenu.value = false
  }
  if (showEmoji.value && emojiRef.value && !emojiRef.value.contains(target)) {
    showEmoji.value = false
  }
  if (showSchedule.value && scheduleRef.value && !scheduleRef.value.contains(target)) {
    showSchedule.value = false
  }
  retweetMenuFor.value = null
}

const goAddAccount = () => {
  router.push('/login-v2')
}

const handleLogout = async () => {
  try {
    await axios.post('/api/auth/logout')
  } catch (_) {
    // ignore
  }
  authStore.logout()
  showAccountMenu.value = false
  router.push('/login-v2')
}

const onReplySubmitted = (reply: any) => {
  if (!replyingTo.value) return
  const t = tweets.value.find((x: any) => x.id === replyingTo.value.id)
  if (t) t.repliesCount = Number(t.repliesCount || 0) + 1
}
</script>
