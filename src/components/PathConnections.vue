<template>
  <svg class="path-connections" :viewBox="`0 0 ${props.width} ${props.height}`" preserveAspectRatio="none">
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
  width: number;
  height: number;
}>();

const getPathD = (start: { x: number; y: number }, end: { x: number; y: number }): string => {
  // Las líneas deben conectar el centro del nodo (25px)
  const startX = start.x;
  const startY = start.y;
  const endX = end.x;
  const endY = end.y;

  return `M ${startX} ${startY} L ${endX} ${endY}`;
};

const paths = computed<Path[]>(() => {
  const result: Path[] = [];
  
  if (!props.zones || props.zones.length === 0) return result; 

  const zoneMap = new Map(props.zones.map(z => [z.id, z]));

  props.zones.forEach(zone => {
    if (zone.nextZoneId) {
      const nextZone = zoneMap.get(zone.nextZoneId);
      if (nextZone) {
        // Determinar el estado de la línea
        let state: ZoneState = zone.state === 'completed' ? 'completed' : nextZone.state;

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
  stroke-width: 5px;
  stroke-dasharray: 10 5;
  transition: stroke 0.3s ease;
}

.path-line.state-locked {
  stroke: #444;
}

.path-line.state-active {
  stroke: #ffa500;
  stroke-dasharray: 0; 
}

.path-line.state-completed {
  stroke: #1c4587;
  stroke-dasharray: 0;
}
</style>