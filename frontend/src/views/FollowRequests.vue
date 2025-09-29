<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-14">
          <h1 class="text-lg font-bold text-gray-900">Follow Requests</h1>
          <button @click="$router.back()" class="text-sm text-gray-600 hover:text-gray-900">Back</button>
        </div>
      </div>
    </div>

    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="bg-white shadow rounded-lg divide-y divide-gray-200">
        <div class="p-4 flex items-center justify-between">
          <div class="flex space-x-2 text-sm">
            <button :class="tab==='incoming' ? 'font-semibold text-twitter-blue' : 'text-gray-600'" @click="tab='incoming'">Incoming</button>
            <span class="text-gray-300">·</span>
            <button :class="tab==='sent' ? 'font-semibold text-twitter-blue' : 'text-gray-600'" @click="tab='sent'">Sent</button>
          </div>
          <button class="text-sm text-gray-600" @click="refresh">Refresh</button>
        </div>

        <div v-if="tab==='incoming'">
          <div v-if="incoming.length === 0" class="p-10 text-center text-gray-500">No incoming requests</div>
          <div v-for="req in incoming" :key="req.id" class="p-4 flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <img :src="req.requester.avatarUrl || 'https://via.placeholder.com/40'" class="h-10 w-10 rounded-full"/>
              <div>
                <div class="font-semibold text-gray-900">{{ req.requester.fullName }}</div>
                <div class="text-gray-600 text-sm">@{{ req.requester.username }}</div>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button @click="approve(req.id)" class="px-3 py-1 rounded-full bg-twitter-blue text-white text-sm hover:bg-blue-600">Approve</button>
              <button @click="deny(req.id)" class="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm hover:bg-gray-200">Deny</button>
            </div>
          </div>
        </div>

        <div v-else>
          <div v-if="sent.length === 0" class="p-10 text-center text-gray-500">No sent requests</div>
          <div v-for="req in sent" :key="req.id" class="p-4 flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div>
                <div class="font-semibold text-gray-900">@{{ req.target?.username || 'user' }}</div>
              </div>
            </div>
            <div class="text-sm text-gray-600">Pending</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

interface IncomingReq {
  id: string
  requester: any
}

const incoming = ref<IncomingReq[]>([])
const sent = ref<any[]>([])
const tab = ref<'incoming' | 'sent'>('incoming')

const fetchIncoming = async () => {
  const res = await axios.get('/api/follows/requests')
  incoming.value = res.data?.data || []
}

const fetchSent = async () => {
  const res = await axios.get('/api/follows/requests/sent')
  sent.value = res.data?.data || []
}

const refresh = async () => {
  await Promise.all([fetchIncoming(), fetchSent()])
}

const approve = async (id: string) => {
  await axios.post(`/api/follows/requests/${id}/approve`)
  await refresh()
}

const deny = async (id: string) => {
  await axios.post(`/api/follows/requests/${id}/deny`)
  await refresh()
}

onMounted(refresh)
</script>

<style scoped>
.bg-twitter-blue { background-color: #1d9bf0; }
</style>

