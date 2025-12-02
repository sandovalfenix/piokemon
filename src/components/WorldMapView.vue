<template>
  <div class="world-map-view">
    <div class="map-canvas">
      <PathConnections :zones="mapStore.allZones" :width="MAP_WIDTH" :height="MAP_HEIGHT" />

      <ZoneNode
        v-for="zone in mapStore.allZones"
        :key="zone.id"
        :zone="zone"
        :map-width="MAP_WIDTH"
        :map-height="MAP_HEIGHT"
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
import { useMapStore } from '../stores/mapStore';
import ZoneNode from './ZoneNode.vue';
import ZonePopover from './ZonePopover.vue';
import PathConnections from './PathConnections.vue';

const mapStore = useMapStore();

const MAP_WIDTH = 800;
const MAP_HEIGHT = 1200;

const handleEnterZone = (zoneId: number) => {
  console.log(`¡Entrando a la Zona ID: ${zoneId}! Redirigiendo...`);
  
  // En una aplicación real, aquí iría la navegación a la vista del nivel:
  // router.push({ name: 'level', params: { id: zoneId } })

  alert(`Cargando la Zona ${mapStore.getSelectedZone?.name}. El nivel comenzaría aquí.`);

  // Simulación: Si el nivel se completa exitosamente:
  // mapStore.completeZone(zoneId); 
};
</script>

<style scoped>
.world-map-view {
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  position: relative;
  background-color: #2c3e50;
  padding: 20px 0 40px;
}

.map-canvas {
  position: relative;
  width: min(900px, 95vw);
  aspect-ratio: 2 / 3;
  margin: 0 auto 30px;
}
</style>