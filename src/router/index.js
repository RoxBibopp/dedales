import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import StartMenu from '@/views/StartMenu.vue'
import RoomLobbyViewVue
 from '@/views/RoomLobbyView.vue'
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
  },
  {
    path: '/roomlobby',
    name: 'roomlobby',
    component: RoomLobbyViewVue
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
