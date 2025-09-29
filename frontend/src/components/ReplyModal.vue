<template>
  <div class="fixed inset-0 z-50">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/50" @click="onClose" />

    <!-- Sheet -->
    <div class="relative mx-auto mt-8 w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b">
        <button @click="onClose" aria-label="Close" class="p-2 rounded-full hover:bg-gray-100">
          <svg viewBox="0 0 24 24" class="w-5 h-5 text-gray-800"><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"/></svg>
        </button>
        <div class="text-sm text-twitter-blue">Drafts</div>
      </div>

      <!-- Original tweet preview -->
      <div class="px-4 py-3 border-b">
        <div class="flex gap-3">
          <img :src="tweet.user?.avatarUrl || 'https://via.placeholder.com/40'" :alt="tweet.user?.username" class="w-10 h-10 rounded-full" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 text-sm">
              <span class="font-semibold truncate">{{ tweet.user?.fullName || tweet.user?.username }}</span>
              <span class="text-gray-500 truncate">@{{ tweet.user?.username }}</span>
              <span class="text-gray-500">· {{ formatDate(tweet.createdAt) }}</span>
            </div>
            <div class="mt-1 text-[15px] whitespace-pre-wrap break-words">{{ tweet.content }}</div>
          </div>
        </div>
        <div class="mt-2 text-sm text-gray-500">Replying to <span class="text-twitter-blue">@{{ tweet.user?.username }}</span></div>
      </div>

      <!-- Reply composer -->
      <div class="px-4 py-3">
        <div class="flex gap-3">
          <img :src="me?.avatarUrl || 'https://via.placeholder.com/40'" :alt="me?.username || 'me'" class="w-10 h-10 rounded-full" />
          <div class="flex-1 min-w-0">
            <textarea
              v-model="content"
              class="w-full text-[15px] resize-none focus:outline-none min-h-[96px]"
              placeholder="Post your reply"
              :maxlength="280"
            />

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

            <!-- Toolbar -->
            <div class="mt-2 flex items-center justify-between">
              <div class="flex items-center gap-1">
                <input ref="fileInput" type="file" class="hidden" :accept="currentAccept" multiple @change="onFilesSelected" />
                <button @click="triggerFile" class="p-2 rounded-full hover:bg-gray-100" aria-label="Add photos or video">
                  <svg viewBox="0 0 24 24" class="w-5 h-5 text-twitter-blue"><path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v9.086l3-3 3 3 5-5 3 3V5.5c0-.276-.224-.5-.5-.5h-13zM19 15.414l-3-3-5 5-3-3-3 3V18.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-3.086zM9.75 7C8.784 7 8 7.784 8 8.75s.784 1.75 1.75 1.75 1.75-.784 1.75-1.75S10.716 7 9.75 7z"/></svg>
                </button>
                <button @click="triggerGif" class="p-2 rounded-full hover:bg-gray-100" aria-label="Add a GIF">
                  <svg viewBox="0 0 24 24" class="w-5 h-5 text-twitter-blue"><path d="M3 5.5C3 4.119 4.12 3 5.5 3h13C19.88 3 21 4.119 21 5.5v13c0 1.381-1.12 2.5-2.5 2.5h-13C4.12 21 3 19.881 3 18.5v-13zM5.5 5c-.28 0-.5.224-.5.5v13c0 .276.22.5.5.5h13c.28 0 .5-.224.5-.5v-13c0-.276-.22-.5-.5-.5h-13zM18 10.711V9.25h-3.74v5.5h1.44v-1.719h1.7V11.57h-1.7v-.859H18zM11.79 9.25h1.44v5.5h-1.44v-5.5zm-3.07 1.375c.34 0 .77.172 1.02.43l1.03-.86c-.51-.601-1.28-.945-2.05-.945C7.19 9.25 6 10.453 6 12s1.19 2.75 2.72 2.75c.85 0 1.54-.344 2.05-.945v-2.149H8.38v1.032H9.4v.515c-.17.086-.42.172-.68.172-.76 0-1.36-.602-1.36-1.375 0-.688.6-1.375 1.36-1.375z"/></svg>
                </button>
                <button disabled class="p-2 rounded-full text-twitter-blue/50" aria-label="Add poll" title="Coming soon">
                  <svg viewBox="0 0 24 24" class="w-5 h-5"><path d="M6 5c-1.1 0-2 .895-2 2s.9 2 2 2 2-.895 2-2-.9-2-2-2zM2 7c0-2.209 1.79-4 4-4s4 1.791 4 4-1.79 4-4 4-4-1.791-4-4zm20 1H12V6h10v2zM6 15c-1.1 0-2 .895-2 2s.9 2 2 2 2-.895 2-2-.9-2-2-2zm-4 2c0-2.209 1.79-4 4-4s4 1.791 4 4-1.79 4-4 4-4-1.791-4-4zm20 1H12v-2h10v2zM7 7c0 .552-.45 1-1 1s-1-.448-1-1 .45-1 1-1 1 .448 1 1z"/></svg>
                </button>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-sm" :class="remaining < 0 ? 'text-red-500' : 'text-gray-500'">{{ remaining }}</span>
                <button
                  class="bg-black text-white text-sm font-bold py-2 px-4 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="posting || content.trim().length === 0 || remaining < 0"
                  @click="submitReply"
                >
                  {{ posting ? 'Replying…' : 'Reply' }}
                </button>
              </div>
            </div>
            <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{ tweet: any }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'submitted', reply: any): void }>()

const auth = useAuthStore()
const me = auth.user

const content = ref('')
const posting = ref(false)
const error = ref('')
const remaining = computed(() => 280 - content.value.length)

const attachments = ref<Array<{ file: File; url: string; type: 'image' | 'video' | 'gif' }>>([])
const fileInput = ref<HTMLInputElement | null>(null)
const defaultAccept = 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm'
const currentAccept = ref<string>(defaultAccept)
const isImageMode = computed(() => attachments.value.length > 0 && attachments.value[0].type === 'image')

const triggerFile = () => {
  currentAccept.value = defaultAccept
  fileInput.value?.click()
}

const triggerGif = () => {
  currentAccept.value = 'image/gif'
  fileInput.value?.click()
}

const onFilesSelected = (e: Event) => {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files || [])
  if (!files.length) return
  currentAccept.value = defaultAccept
  const imgs = files.filter(f => f.type.startsWith('image/') && f.type !== 'image/gif')
  const gifs = files.filter(f => f.type === 'image/gif')
  const vids = files.filter(f => f.type.startsWith('video/'))
  if (vids.length + gifs.length > 1) {
    error.value = 'Only one video or GIF allowed'
    return
  }
  if ((vids.length > 0 || gifs.length > 0) && files.length > 1) {
    error.value = 'Cannot mix video/GIF with other files'
    return
  }
  if (imgs.length > 4) {
    error.value = 'Up to 4 images allowed'
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

const onClose = () => emit('close')

const submitReply = async () => {
  if (!auth.token) {
    error.value = 'Please login first'
    return
  }
  if (content.value.trim().length === 0) return
  posting.value = true
  error.value = ''
  try {
    const res = await axios.post('/api/tweets', {
      content: content.value.trim(),
      replyToTweetId: props.tweet.id
    })
    const created = res.data?.data
    if (!created) throw new Error('Reply failed')

    if (attachments.value.length) {
      const form = new FormData()
      attachments.value.forEach(a => form.append('files', a.file))
      await axios.post(`/api/tweets/${created.id}/media`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
    }

    emit('submitted', created)
    emit('close')
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || 'Failed to reply'
  } finally {
    posting.value = false
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}
</script>

<style scoped>
.text-twitter-blue { color: #1d9bf0; }
</style>

