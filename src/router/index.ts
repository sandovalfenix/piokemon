import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import BattleView from '@/views/BattleView.vue'
import TeamBuilderView from '@/views/TeamBuilderView.vue'
import StarterSelectionView from '@/views/StarterSelectionView.vue'
import GymSelection from '@/views/GymSelection.vue'

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
    {
      path: '/starter-selection',
      name: 'starter-selection',
      component: StarterSelectionView,
    },
    {
      path: '/gyms',
      name: 'gyms',
      component: GymSelection,
    },
  ],
})

export default router


