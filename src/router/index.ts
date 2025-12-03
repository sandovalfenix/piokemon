// src/router/index.ts

import { createRouter, createWebHistory } from 'vue-router';
import WorldMapViewPage from '../views/WorldMapViewPage.vue';
import ZoneGymCristoRey from '../views/ZoneGymCristoRey.vue';
import ZoneParqueCaña from '../views/ZoneParqueCaña.vue';

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
      path: '/zona/gimnasio-cristo-rey',
      name: 'gym-cristo-rey',
      component: ZoneGymCristoRey,
    },
    {
          path: '/zona/parque-de-la-cana',
          name: 'Parque-de-la-Cana',
          component: ZoneParqueCaña,
        }
  ],
});

export default router;
