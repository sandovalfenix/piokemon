import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import BattleView from '@/views/BattleView.vue'
import TeamBuilderView from '@/views/TeamBuilderView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/battle',
      name: 'battle',
      component: BattleView,
    },
    {
      path: '/team-builder',
      name: 'team-builder',
      component: TeamBuilderView,
    },
  ],
})

export default router
