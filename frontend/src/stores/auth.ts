import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export interface User {
  id: number
  username: string
  email: string
  fullName: string
  bio?: string
  location?: string
  website?: string
  avatarUrl?: string
  headerUrl?: string
  followersCount: number
  followingCount: number
  tweetsCount: number
  isVerified: boolean
  isPrivate: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // Set auth token
  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
  }

  // Clear auth token
  const clearToken = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
  }

  // Login
  const login = async (email: string, password: string) => {
    try {
      loading.value = true
      error.value = null

      const response = await axios.post('/api/auth/login', { email, password })
      const { user: userData, token: userToken } = response.data

      setToken(userToken)
      user.value = userData

      return { success: true }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Login failed'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Register
  const register = async (userData: {
    username: string
    email: string
    password: string
    fullName?: string
  }) => {
    try {
      loading.value = true
      error.value = null

      const response = await axios.post('/api/auth/register', userData)
      const { user: newUser, token: userToken } = response.data

      setToken(userToken)
      user.value = newUser

      return { success: true }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Registration failed'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Logout
  const logout = () => {
    clearToken()
  }

  // Fetch current user
  const fetchUser = async () => {
    if (!token.value) return

    try {
      loading.value = true
      const response = await axios.get('/api/auth/me')
      user.value = response.data
    } catch (err: any) {
      if (err.response?.status === 401) {
        clearToken()
      }
      error.value = err.response?.data?.message || 'Failed to fetch user'
    } finally {
      loading.value = false
    }
  }

  // Update user profile
  const updateProfile = async (profileData: Partial<User>) => {
    try {
      loading.value = true
      error.value = null

      const response = await axios.put('/api/users/profile', profileData)
      user.value = response.data

      return { success: true }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Profile update failed'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Initialize auth state
  const initialize = () => {
    if (token.value) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
      fetchUser()
    }
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    fetchUser,
    updateProfile,
    initialize
  }
})