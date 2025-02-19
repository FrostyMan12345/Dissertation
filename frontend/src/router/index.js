import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Login from '../views/Login.vue'
import Testing from '../components/Testing.vue'
import MainPage from '../components/MainPage.vue'
import GamePage from '../views/GamePage.vue'
import ProfilePage from '../views/ProfilePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/test',
      name: 'test',
      component: Testing,
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
  ],
})

export default router
