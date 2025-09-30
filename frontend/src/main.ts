import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import axios from 'axios'

// Import Tailwind CSS
import './assets/main.css'

const app = createApp(App)

// Axios base URL for Vercel/static hosting
// Set VITE_API_URL in Vercel to your backend origin, e.g. https://api.example.com
axios.defaults.baseURL = import.meta.env.VITE_API_URL || ''

app.use(createPinia())
app.use(router)

app.mount('#app')
