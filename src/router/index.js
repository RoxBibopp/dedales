import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import StartMenu from '@/views/StartMenu.vue'
const routes = [
  {
    path: '/',
    name: 'home',
    component: StartMenu
  },
  {
    path: '/game',
    name: 'game',
    component: HomeView
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
