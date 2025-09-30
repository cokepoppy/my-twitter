import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import LoginV2 from '@/views/LoginV2.vue'
import AuthCallback from '@/views/AuthCallback.vue'
import Register from '@/views/Register.vue'
import Profile from '@/views/Profile.vue'
import Tweet from '@/views/Tweet.vue'
import Explore from '@/views/Explore.vue'
import Notifications from '@/views/Notifications.vue'
import FollowRequests from '@/views/FollowRequests.vue'
import Messages from '@/views/Messages.vue'
import Settings from '@/views/Settings.vue'
import Bookmarks from '@/views/Bookmarks.vue'
import Lists from '@/views/Lists.vue'
import Communities from '@/views/Communities.vue'
import Premium from '@/views/Premium.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { requiresAuth: true },
      children: [
        {
          path: 'tweet/:id',
          name: 'tweet',
          component: Tweet,
          meta: { requiresAuth: true }
        }
      ]
    },
    {
      path: '/bookmarks',
      name: 'bookmarks',
      component: Bookmarks,
      meta: { requiresAuth: true }
    },
    {
      path: '/lists',
      name: 'lists',
      component: Lists,
      meta: { requiresAuth: true }
    },
    {
      path: '/communities',
      name: 'communities',
      component: Communities,
      meta: { requiresAuth: true }
    },
    {
      path: '/premium',
      name: 'premium',
      component: Premium,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { guest: true }
    },
    {
      path: '/login-v2',
      name: 'login-v2',
      component: LoginV2,
      meta: { guest: true }
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: AuthCallback,
      meta: { guest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
      meta: { guest: true }
    },
    {
      path: '/profile/:username',
      name: 'profile',
      component: Profile,
      meta: { requiresAuth: true }
    },
    {
      path: '/explore',
      name: 'explore',
      component: Explore,
      meta: { requiresAuth: true }
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: Notifications,
      meta: { requiresAuth: true }
    },
    {
      path: '/requests',
      name: 'follow-requests',
      component: FollowRequests,
      meta: { requiresAuth: true }
    },
    {
      path: '/messages',
      name: 'messages',
      component: Messages,
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings,
      meta: { requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFound.vue')
    }
  ]
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isGuest = to.matched.some(record => record.meta.guest)

  if (requiresAuth && !token) {
    next('/login-v2')
  } else if (isGuest && token) {
    next('/')
  } else {
    next()
  }
})

export default router
