import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import MainPage from '../views/MainPage.vue'
import GamePage from '../views/GamePage.vue'
import ProfilePage from '../views/ProfilePage.vue'
import DeveloperRequests from '@/views/DeveloperRequests.vue'
import LandingPage from '@/views/LandingPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingPage,
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/main',
      name: 'main',
      component: MainPage,
    },
    {
      path: '/game/:id',
      name: 'game',
      component: GamePage,
    },
    {
      path: '/profile/:userType/:username',
      name: 'profile',
      component: ProfilePage,
    },
    { path: '/developer/requests', name: 'requests', component: DeveloperRequests },
  ],
})

export default router
