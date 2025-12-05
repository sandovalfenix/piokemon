// src/router/index.ts

import { createRouter, createWebHistory } from 'vue-router';
import WorldMapViewPage from '../views/WorldMapViewPage.vue';
import ZoneLobbyView from '../views/ZoneLobbyView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/mapa',
    },
    {
      path: '/mapa',
      name: 'world-map',
      component: WorldMapViewPage,
    },
    {
      path: '/zone-lobby/:zoneName',
      name: 'zone-lobby',
      component: ZoneLobbyView,
    },
  ],
});

export default router;
