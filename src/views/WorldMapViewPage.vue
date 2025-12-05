<template>
  <div class="page-container">
    <!-- <div class="map-background"></div> -->
    <h1>Mapa de Progresión del Mundo</h1>
    <p class="status-bar">
      Bienvenido, Aventurero. {{ statusMessage }}
    </p>

    <WorldMapView />

  </div>
</template>

<script setup lang="ts">
import WorldMapView from '@/components/WorldMapView.vue';
import { computed, onMounted, ref } from 'vue';
import { useMapStore } from '../stores/mapStore';

const mapStore = useMapStore();

const totalZones = computed(() => mapStore.allZones.length);
const completedZones = computed(() =>
  mapStore.allZones.filter(z => z.state === 'completed').length
);

const statusMessage = ref('Cargando el mapa...');

onMounted(async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  statusMessage.value = `Has completado ${completedZones.value} de ${totalZones.value} zonas. ¡A seguir!`;
});
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: #22405c;
}

/* Contenido encima del mapa */
.content-overlay {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
  color: #fff;
}

h1 {
  color: #fff;
}

.status-bar {
  margin-bottom: 20px;
  padding: 10px 20px;
  background-color: rgba(51, 68, 102, 0.7);
  border-radius: 6px;
  font-style: italic;
  backdrop-filter: blur(3px);
  color: #fff;
}
</style>
