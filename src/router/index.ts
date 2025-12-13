// src/router/index.ts

import { createRouter, createWebHistory } from 'vue-router';
import MapView from '../views/MapView.vue';
import ZoneView from '../views/ZoneView.vue';
import MissionsView from '../views/MissionsView.vue';
import PvPView from '../views/PvPView.vue';
import PokemonsView from '@/views/PokemonsView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/map',
    },
    {
      path: '/map',
      name: 'map',
      component: MapView,
    },
    {
      path: '/zone/:id',
      name: 'zone',
      component: ZoneView,
    },
    {
      path: '/missions',
      name: 'missions',
      component: MissionsView,
    },
    {
      path: '/pvp',
      name: 'pvp',
      component: PvPView,
    },
    {
      path: '/pokemons',
      name: 'pokemons',
      component: PokemonsView,
    },
  ],
});

export default router;

