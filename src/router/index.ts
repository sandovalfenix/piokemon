import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

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
      path: '/map',
      name: 'map',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/WorldMapView.vue'),
    },
    {
      path: '/zona-lobby',
      name: 'zona-lobby',
      // route level code-splitting
      // this generates a separate chunk (ZonaLobby.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/ZonaLobbyView.vue'),
    },
    {
      path: '/zoologico',
      name: 'zoologico',
      component: () => import('../views/lobbies/ZoologicoView.vue'),
    },
    {
      path: '/colinas',
      name: 'colinas',
      component: () => import('../views/lobbies/ColinasView.vue'),
    },
    {
      path: '/cristo-rey',
      name: 'cristo-rey',
      component: () => import('../views/lobbies/CristoReyView.vue'),
    },
    {
      path: '/ermita',
      name: 'ermita',
      component: () => import('../views/lobbies/LaErmitaView.vue'),
    },
    {
      path: '/cana',
      name: 'cana',
      component: () => import('../views/lobbies/ParqueCanaView.vue'),
    },
    {
      path: '/adventure',
      name: 'adventure',
      // route level code-splitting
      // this generates a separate chunk (Adventure.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AdventureView.vue'),
    },
    {
      path: '/quests',
      name: 'quests',
      // route level code-splitting
      // this generates a separate chunk (Quests.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/QuestsView.vue'),
    },
    {
      path: '/battle',
      name: 'battle',
      // route level code-splitting
      // this generates a separate chunk (Battle.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/BattleView.vue'),
    },
    {
      path: '/help-center',
      name: 'help-center',
      // route level code-splitting
      // this generates a separate chunk (HelpCenter.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/HelpCenterView.vue'),
    },
  ],
})

export default router
