<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <h2 class="text-xl font-semibold">Signing you in…</h2>
      <p class="text-gray-500 mt-2">Please wait a moment.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

onMounted(async () => {
  const token = (route.query.token as string) || ''
  if (!token) {
    // No token in query, go back to login
    router.replace('/login-v2')
    return
  }

  try {
    // Update store token and persist
    auth.token = token
    localStorage.setItem('token', token)
    // Use store helper to initialize axios header + fetch user
    auth.initialize()
    // Give a brief moment for fetchUser to populate
    setTimeout(() => router.replace('/'), 200)
  } catch (e) {
    router.replace('/login-v2')
  }
})
</script>
