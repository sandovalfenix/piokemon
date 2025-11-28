import { createRouter, createWebHistory } from "vue-router"
import BattleView from "../views/BattleView.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'battle',
      component: BattleView
    }
  ]
})

export default router