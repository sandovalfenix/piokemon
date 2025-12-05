// src/router/index.ts

import { createRouter, createWebHistory } from 'vue-router';
import WorldMapViewPage from '../views/WorldMapViewPage.vue';
import ZoneGymCristoRey from '../views/ZoneGymCristoRey.vue';
import ZoneParqueCana from '../views/ZoneParqueCana.vue';
import ZoneZooCali from '../views/ZoneZooCali.vue';
import ZonePlazoletaJairoVarela from '../views/ZonePlazoletaJairoVarela.vue';
import ZoneLaErmita from '../views/ZoneLaErmita.vue';
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
      props: true,
    },
    {
      path: '/zona/la-ermita',
      name: 'la-ermita',
      component: ZoneLaErmita,
    },
    {
      path: '/zona/zoologico-de-cali',
      name: 'zoologico-de-cali',
      component: ZoneZooCali,
    },
    {
      path: '/zona/plazoleta-jairo-varela',
      name: 'plazoleta-jairo-varela',
      component: ZonePlazoletaJairoVarela,
    },
    {
      path: '/zona/gimnasio-cristo-rey',
      name: 'gym-cristo-rey',
      component: ZoneGymCristoRey,
    },
    {
      path: '/zona/parque-de-la-cana',
      name: 'Parque-de-la-Cana',
      component: ZoneParqueCana,
    },
  ],
});

export default router;
