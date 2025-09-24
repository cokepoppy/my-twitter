<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <button @click="$router.back()" class="mr-4">
              <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
            </button>
            <h1 class="text-xl font-bold text-gray-900">Settings</h1>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <div class="bg-white shadow rounded-lg">
            <nav class="space-y-1 p-4">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                :class="[
                  'w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'bg-twitter-blue text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                ]"
              >
                {{ tab.name }}
              </button>
            </nav>
          </div>
        </div>

        <!-- Content Area -->
        <div class="lg:col-span-3">
          <div class="bg-white shadow rounded-lg">
            <!-- Account Settings -->
            <div v-if="activeTab === 'account'" class="p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-6">Account Settings</h2>

              <form @submit.prevent="saveAccountSettings" class="space-y-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    v-model="accountSettings.username"
                    type="text"
                    class="twitter-input"
                    placeholder="Enter your username"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    v-model="accountSettings.email"
                    type="email"
                    class="twitter-input"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    v-model="accountSettings.fullName"
                    type="text"
                    class="twitter-input"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    v-model="accountSettings.bio"
                    rows="4"
                    class="twitter-input"
                    placeholder="Tell us about yourself"
                  ></textarea>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      v-model="accountSettings.location"
                      type="text"
                      class="twitter-input"
                      placeholder="Your location"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      v-model="accountSettings.website"
                      type="text"
                      class="twitter-input"
                      placeholder="Your website"
                    />
                  </div>
                </div>

                <div class="flex justify-end">
                  <button type="submit" class="twitter-button">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>

            <!-- Privacy Settings -->
            <div v-if="activeTab === 'privacy'" class="p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-6">Privacy Settings</h2>

              <div class="space-y-6">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-medium text-gray-900">Private Account</h3>
                    <p class="text-sm text-gray-500">Only approved followers can see your tweets</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input v-model="privacySettings.privateAccount" type="checkbox" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-twitter-blue"></div>
                  </label>
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-medium text-gray-900">Show Activity Status</h3>
                    <p class="text-sm text-gray-500">Let others see when you're active</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input v-model="privacySettings.showActivity" type="checkbox" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-twitter-blue"></div>
                  </label>
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-medium text-gray-900">Discoverable Email</h3>
                    <p class="text-sm text-gray-500">Let others find you by your email address</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input v-model="privacySettings.discoverableEmail" type="checkbox" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-twitter-blue"></div>
                  </label>
                </div>
              </div>
            </div>

            <!-- Notification Settings -->
            <div v-if="activeTab === 'notifications'" class="p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-6">Notification Settings</h2>

              <div class="space-y-6">
                <div>
                  <h3 class="text-sm font-medium text-gray-900 mb-4">Email Notifications</h3>
                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-700">New followers</span>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input v-model="notificationSettings.emailFollowers" type="checkbox" class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-twitter-blue"></div>
                      </label>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-700">Tweet likes</span>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input v-model="notificationSettings.emailLikes" type="checkbox" class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-twitter-blue"></div>
                      </label>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-700">Direct messages</span>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input v-model="notificationSettings.emailMessages" type="checkbox" class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-twitter-blue"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 class="text-sm font-medium text-gray-900 mb-4">Push Notifications</h3>
                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-700">New followers</span>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input v-model="notificationSettings.pushFollowers" type="checkbox" class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-twitter-blue"></div>
                      </label>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-700">Mentions</span>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input v-model="notificationSettings.pushMentions" type="checkbox" class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-twitter-blue"></div>
                      </label>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-700">Direct messages</span>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input v-model="notificationSettings.pushMessages" type="checkbox" class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-twitter-blue"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Security Settings -->
            <div v-if="activeTab === 'security'" class="p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-6">Security Settings</h2>

              <div class="space-y-6">
                <div>
                  <h3 class="text-sm font-medium text-gray-900 mb-2">Change Password</h3>
                  <form @submit.prevent="changePassword" class="space-y-4">
                    <div>
                      <input
                        v-model="passwordSettings.currentPassword"
                        type="password"
                        placeholder="Current password"
                        class="twitter-input"
                      />
                    </div>
                    <div>
                      <input
                        v-model="passwordSettings.newPassword"
                        type="password"
                        placeholder="New password"
                        class="twitter-input"
                      />
                    </div>
                    <div>
                      <input
                        v-model="passwordSettings.confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
                        class="twitter-input"
                      />
                    </div>
                    <button type="submit" class="twitter-button">
                      Change Password
                    </button>
                  </form>
                </div>

                <div>
                  <h3 class="text-sm font-medium text-gray-900 mb-2">Two-Factor Authentication</h3>
                  <div class="bg-gray-50 rounded-lg p-4">
                    <p class="text-sm text-gray-600 mb-4">
                      Add an extra layer of security to your account by enabling two-factor authentication.
                    </p>
                    <button class="twitter-button text-sm">
                      Enable 2FA
                    </button>
                  </div>
                </div>

                <div>
                  <h3 class="text-sm font-medium text-gray-900 mb-2">Login Sessions</h3>
                  <div class="space-y-3">
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p class="text-sm font-medium text-gray-900">Current Session</p>
                        <p class="text-xs text-gray-500">Chrome on Windows • Active now</p>
                      </div>
                      <span class="text-xs text-green-600">Current</span>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p class="text-sm font-medium text-gray-900">Mobile App</p>
                        <p class="text-xs text-gray-500">Safari on iPhone • 2 hours ago</p>
                      </div>
                      <button class="text-xs text-red-600 hover:text-red-800">
                        Sign out
                      </button>
                    </div>
                  </div>
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
import { ref, reactive } from 'vue'

const activeTab = ref('account')

const tabs = [
  { id: 'account', name: 'Account' },
  { id: 'privacy', name: 'Privacy' },
  { id: 'notifications', name: 'Notifications' },
  { id: 'security', name: 'Security' },
]

const accountSettings = reactive({
  username: 'currentuser',
  email: 'user@example.com',
  fullName: 'Current User',
  bio: 'Software developer and tech enthusiast.',
  location: 'San Francisco, CA',
  website: 'https://example.com',
})

const privacySettings = reactive({
  privateAccount: false,
  showActivity: true,
  discoverableEmail: true,
})

const notificationSettings = reactive({
  emailFollowers: true,
  emailLikes: false,
  emailMessages: true,
  pushFollowers: true,
  pushMentions: true,
  pushMessages: true,
})

const passwordSettings = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const saveAccountSettings = () => {
  // Implementation for saving account settings
  console.log('Saving account settings:', accountSettings)
}

const changePassword = () => {
  if (passwordSettings.newPassword !== passwordSettings.confirmPassword) {
    alert('Passwords do not match')
    return
  }
  // Implementation for changing password
  console.log('Changing password')
  passwordSettings.currentPassword = ''
  passwordSettings.newPassword = ''
  passwordSettings.confirmPassword = ''
}
</script>