import { createRouter, createWebHistory } from 'vue-router'
import BattleScreen from '@/components/BattleScreen.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/battle',
      name: 'battle',
      component: BattleScreen  // La batalla es la página principal
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('@/views/HomeView.vue')
    }
  ]
})

export default router
