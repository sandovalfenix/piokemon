<template>
  <svg
    v-if="renderAvailable"
    class="path-connections"
    :viewBox="`0 0 ${props.renderWidth} ${props.renderHeight}`"
    preserveAspectRatio="none"
  >
    <path
      v-for="path in paths"
      :key="path.id"
      :d="path.d"
      :class="['path-line', `state-${path.state}`]"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue';
import type { Zone, ZoneState } from '../types/zone';

interface Path {
  id: string;
  d: string; 
  state: ZoneState;
}

// CORRECCIÓN: La prop debe ser 'zones'.
const props = defineProps<{
  zones: Zone[];
  width: number; // diseño (coord system)
  height: number;
  renderWidth?: number; // contenedor completo en pixeles
  renderHeight?: number;
  imageWidth?: number; // caja real de la imagen dentro del contenedor
  imageHeight?: number;
  imageOffsetX?: number; // offset de la imagen dentro del contenedor
  imageOffsetY?: number;
}>();

const renderAvailable = computed(() => !!props.renderWidth && !!props.renderHeight && !!props.imageWidth && !!props.imageHeight);

const getPathD = (start: { x: number; y: number }, end: { x: number; y: number }): string => {
  // Calcular en coordenadas de píxeles dentro del contenedor (usando la caja real de la imagen)
  const imgW = props.imageWidth || props.renderWidth || props.width;
  const imgH = props.imageHeight || props.renderHeight || props.height;
  const offX = props.imageOffsetX || 0;
  const offY = props.imageOffsetY || 0;

  const startX = offX + (start.x / props.width) * imgW;
  const startY = offY + (start.y / props.height) * imgH;
  const endX = offX + (end.x / props.width) * imgW;
  const endY = offY + (end.y / props.height) * imgH;

  return `M ${startX} ${startY} L ${endX} ${endY}`;
};

const paths = computed<Path[]>(() => {
  const result: Path[] = [];
  
  if (!props.zones || props.zones.length === 0) return result; 
  if (!renderAvailable.value) return result;

  const zoneMap = new Map(props.zones.map(z => [z.id, z]));

  props.zones.forEach(zone => {
    if (zone.nextZoneId) {
      const nextZone = zoneMap.get(zone.nextZoneId);
      if (nextZone) {
        // Determinar el estado de la línea
        const state: ZoneState = zone.state === 'completed' ? 'completed' : nextZone.state;

        result.push({
          id: `${zone.id}-${nextZone.id}`,
          d: getPathD(zone.position, nextZone.position),
          state: state,
        });
      }
    }
  });
  return result;
});
</script>

<style scoped>
.path-connections {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: visible; 
  z-index: 5; 
}

.path-line {
  fill: none;
  stroke-width: 6px;
  stroke-dasharray: 0;
  transition: stroke 0.3s ease;
}

.path-line.state-locked {
  stroke: rgba(74, 107, 140, 0.5);
  stroke-dasharray: 8 10;
}

.path-line.state-active {
  stroke: #ffc857;
  filter: drop-shadow(0 0 8px rgba(255, 200, 87, 0.6));
}

.path-line.state-completed {
  stroke: #1c4587;
  filter: drop-shadow(0 0 8px rgba(28, 69, 135, 0.45));
}
</style>