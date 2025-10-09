import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import axios from 'axios'

// Import Tailwind CSS
import './assets/main.css'

const app = createApp(App)

// Axios base URL for static hosting / production
// Prefer explicit VITE_API_URL; otherwise fall back to same-origin
const apiBase = (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/$/, '')
axios.defaults.baseURL = apiBase

app.use(createPinia())
app.use(router)

app.mount('#app')
