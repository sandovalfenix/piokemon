<template>
  <div class="page-container">
    <div class="map-background"></div>

    <div class="content-overlay">
      <h1>Mapa de Progresión del Mundo</h1>
      <p class="status-bar">
        Bienvenido, Aventurero. {{ statusMessage }}
      </p>

      <WorldMapView />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useMapStore } from '../stores/mapStore';
import WorldMapView from '../components/WorldMapView.vue';

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
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

/* Fondo del mapa */
.map-background {
  position: absolute;
  inset: 0;
  background-image: url('@/assets/world-map.png'); /* ← cambia ruta */
  background-size: cover;     /* hace que NO se deforme */
  background-position: center;
  background-repeat: no-repeat;
  z-index: 1; /* detrás de todo */
  filter: brightness(1.1); /* opcional */
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
  color: #a7ff83;
}

.status-bar {
  margin-bottom: 20px;
  padding: 10px 20px;
  background-color: rgba(51, 68, 102, 0.7);
  border-radius: 6px;
  font-style: italic;
  backdrop-filter: blur(3px);
}
</style>
