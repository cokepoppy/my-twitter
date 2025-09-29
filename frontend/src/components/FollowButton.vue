<template>
  <button
    :disabled="loading"
    @click="toggleFollow"
    :class="[
      'px-4 py-2 rounded-full text-sm font-medium transition',
      loading ? 'opacity-70 cursor-not-allowed' : '',
      isFollowing
        ? 'bg-gray-200 text-gray-900 hover:bg-gray-300'
        : requested
          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          : 'bg-twitter-blue text-white hover:bg-blue-600'
    ]"
  >
    <span v-if="loading">...</span>
    <span v-else-if="isFollowing">Following</span>
    <span v-else-if="requested">Requested</span>
    <span v-else>Follow</span>
  </button>
</template>

<script setup lang="ts">
import { ref, watch, toRefs } from 'vue'
import axios from 'axios'

interface Props {
  username: string
  initialIsFollowing?: boolean
  initialRequested?: boolean
}

const props = defineProps<Props>()
const { initialIsFollowing, initialRequested } = toRefs(props)

const isFollowing = ref(!!initialIsFollowing?.value)
const requested = ref(!!initialRequested?.value)
const loading = ref(false)

watch(initialIsFollowing, v => (isFollowing.value = !!v))
watch(initialRequested, v => (requested.value = !!v))

const toggleFollow = async () => {
  if (!props.username) return
  try {
    loading.value = true
    const res = await axios.post(`/api/follows/${encodeURIComponent(props.username)}/follow`)
    const data = res.data?.data || {}
    isFollowing.value = !!data.isFollowing
    requested.value = !!data.requested
  } catch (e) {
    // Optionally show toast
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.bg-twitter-blue {
  background-color: #1d9bf0;
}
</style>

