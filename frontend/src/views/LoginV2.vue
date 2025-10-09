<template>
  <div class="min-h-screen bg-white text-black flex">
    <!-- Left: Branding / Hero -->
    <div class="hidden lg:flex flex-1 items-center justify-center bg-black text-white">
      <div class="max-w-md px-8 py-16 text-center">
        <div class="flex items-center justify-center mb-8">
          <svg viewBox="0 0 24 24" aria-hidden="true" class="w-12 h-12 fill-current">
            <g>
              <path
                d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
              />
            </g>
          </svg>
        </div>
        <h1 class="text-5xl font-extrabold leading-tight">Happening now</h1>
        <p class="mt-6 text-xl text-gray-300">Join the conversation.</p>
      </div>
    </div>

    <!-- Right: Auth Card -->
    <div class="flex-1 flex items-center justify-center px-6 py-12">
      <div class="w-full max-w-md">
        <div class="mb-8">
          <svg viewBox="0 0 24 24" aria-hidden="true" class="w-10 h-10 fill-twitter-blue">
            <g>
              <path
                d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
              />
            </g>
          </svg>
        </div>

        <h2 class="text-3xl font-bold mb-6">Sign in to My Twitter</h2>

        <!-- Error notice (from callback redirect) -->
        <div v-if="error" class="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
          {{ error }}
        </div>

        <!-- Google Sign In -->
        <button
          v-if="googleEnabled"
          @click="signInWithGoogle"
          class="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-full py-2.5 px-4 hover:bg-gray-50 transition-colors"
        >
          <img
            alt="Google"
            class="w-5 h-5"
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          />
          <span class="text-sm font-medium">Sign in with Google</span>
        </button>
        <div v-else class="w-full text-center text-sm text-gray-500 mb-2">
          Google 登录未配置，已隐藏该选项。
        </div>

        <div class="my-4 flex items-center">
          <div class="flex-1 h-px bg-gray-200" />
          <span class="px-3 text-sm text-gray-500">or</span>
          <div class="flex-1 h-px bg-gray-200" />
        </div>

        <!-- Link to classic login -->
        <router-link
          to="/login"
          class="w-full block text-center twitter-button rounded-full py-2.5"
        >
          Use email and password
        </router-link>

        <p class="mt-6 text-sm text-gray-600">
          New to My Twitter?
          <router-link to="/register" class="text-twitter-blue hover:underline">Create account</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const googleEnabled = ref(true)
const error = ref<string | null>(null)

const signInWithGoogle = () => {
  const base = (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/$/, '')
  const url = `${base}/api/auth/google`
  window.location.href = url
}

onMounted(async () => {
  try {
    const res = await axios.get('/api/auth/config')
    const backendEnabled = !!res.data?.data?.googleEnabled
    const isTrusted = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    googleEnabled.value = backendEnabled && isTrusted
  } catch (_) {
    googleEnabled.value = false
  }

  const err = (route.query.error as string | undefined) || undefined
  const debug = (route.query.debug as string | undefined) || undefined
  if (err === 'google_disabled') {
    // Clean the URL noiselessly; Google 登录未配置时不再显示错误
    router.replace({ path: route.path, query: {} })
  } else if (err === 'google_login_failed') {
    error.value = `Google 登录失败，请稍后再试${debug ? `（${decodeURIComponent(debug)}）` : ''}`
  } else if (err) {
    error.value = '登录失败，请稍后再试或使用邮箱密码登录。'
  }
})
</script>

<style scoped>
.fill-twitter-blue {
  color: #1d9bf0;
}
</style>
