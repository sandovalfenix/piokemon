<template>
  <div class="world-map-view">
    <div ref="mapCanvas" class="map-canvas">
      <!-- Imagen separada para controlar exacto 'contain' y medir su área renderizada -->
      <img ref="mapImg" :src="mapArt" alt="map" class="map-image" />

      <PathConnections
        :zones="mapStore.allZones"
        :width="MAP_WIDTH"
        :height="MAP_HEIGHT"
        :render-width="renderWidth"
        :render-height="renderHeight"
        :image-width="imageWidth"
        :image-height="imageHeight"
        :image-offset-x="imageOffsetX"
        :image-offset-y="imageOffsetY"
      />

      <ZoneNode
        v-for="zone in mapStore.allZones"
        :key="zone.id"
        :zone="zone"
        :map-width="MAP_WIDTH"
        :map-height="MAP_HEIGHT"
        :image-width="imageWidth"
        :image-height="imageHeight"
        :image-offset-x="imageOffsetX"
        :image-offset-y="imageOffsetY"
        @node-click="mapStore.setSelectedZone"
      />
    </div>

    <ZonePopover
      :zone="mapStore.getSelectedZone"
      @close="mapStore.setSelectedZone(null)"
      @enter-zone="handleEnterZone"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useMapStore } from '../stores/mapStore';
import ZoneNode from './ZoneNode.vue';
import ZonePopover from './ZonePopover.vue';
import PathConnections from './PathConnections.vue';
import mapArt from '../assets/mapa_principal.png';

const mapStore = useMapStore();

const MAP_WIDTH = 1200;
const MAP_HEIGHT = 1200;

// Medición del área renderizada para alinear SVG y nodos en pixeles reales
const mapCanvas = ref<HTMLElement | null>(null);
const mapImg = ref<HTMLImageElement | null>(null);
const renderWidth = ref<number>(0);
const renderHeight = ref<number>(0);

// Imagen renderizada dentro del canvas (área 'contain')
const imageWidth = ref<number>(0);
const imageHeight = ref<number>(0);
const imageOffsetX = ref<number>(0); // desde el borde izquierdo del container
const imageOffsetY = ref<number>(0); // desde el borde superior del container

const measure = () => {
  if (!mapCanvas.value) return;
  const rect = mapCanvas.value.getBoundingClientRect();
  renderWidth.value = Math.round(rect.width);
  renderHeight.value = Math.round(rect.height);

  // Si la imagen está cargada, calcular su tamaño real dentro del contenedor
  if (mapImg.value) {
    const imgRect = mapImg.value.getBoundingClientRect();
    imageWidth.value = Math.round(imgRect.width);
    imageHeight.value = Math.round(imgRect.height);
    imageOffsetX.value = Math.round(imgRect.left - rect.left);
    imageOffsetY.value = Math.round(imgRect.top - rect.top);
  }
  // Debug: muestra las dimensiones reales usadas para escalar rutas
  console.log('mapCanvas size', renderWidth.value, renderHeight.value);
};

onMounted(() => {
  measure();
  window.addEventListener('resize', measure);
  // Si la imagen cambia de tamaño al cargarse, volver a medir
  if (mapImg.value) {
    mapImg.value.addEventListener('load', measure);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', measure);
  if (mapImg.value) {
    mapImg.value.removeEventListener('load', measure);
  }
});

const handleEnterZone = (zoneId: number) => {
  console.log(`¡Entrando a la Zona ID: ${zoneId}! Redirigiendo...`);
  alert(`Cargando la Zona ${mapStore.getSelectedZone?.name}. El nivel comenzaría aquí.`);
};
</script>

<style scoped>
.world-map-view {
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  position: relative;
  background: radial-gradient(circle at 50% 20%, #dff4ff 0%, #a5d6ff 70%, #7fb7ff 100%);
  padding: 20px 0 40px;
}

.map-canvas {
  position: relative;
  width: min(960px, 95vw);
  aspect-ratio: 1 / 1;
  margin: 0 auto 30px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.1));
}

.map-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
  z-index: 1;
}
</style>