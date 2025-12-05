<template>
  <button
    :class="['zone-node', `state-${zone.state}`]"
    :style="nodeStyle"
    @click="handleClick"
    :title="zone.name"
    :aria-label="`${zone.name} (${zone.state})`"
  >
    <span class="node-dot" />
    <span class="sr-only">{{ zone.name }} - {{ zone.state }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits } from 'vue';
import type { Zone } from '../types/zone';

const props = defineProps<{
  zone: Zone;
  mapWidth: number;
  mapHeight: number;
  imageWidth?: number;
  imageHeight?: number;
  imageOffsetX?: number;
  imageOffsetY?: number;
}>();

const emit = defineEmits(['node-click']);

const nodeStyle = computed(() => ({
  // Si se proporcionan dimensiones de la imagen, calcular la posición en px dentro del contenedor
  left: props.imageWidth
    ? `${(props.imageOffsetX || 0) + (props.zone.position.x / props.mapWidth) * (props.imageWidth || 0)}px`
    : `${(props.zone.position.x / props.mapWidth) * 100}%`,
  top: props.imageHeight
    ? `${(props.imageOffsetY || 0) + (props.zone.position.y / props.mapHeight) * (props.imageHeight || 0)}px`
    : `${(props.zone.position.y / props.mapHeight) * 100}%`,
}));

const handleClick = () => {
  emit('node-click', props.zone);
};
</script>

<style scoped>
.zone-node {
  position: absolute;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 4px solid #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2), 0 0 0 8px rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
  z-index: 10;
  transform: translate(-50%, -50%); /* Centrar el nodo en sus coordenadas x, y */
}

.state-locked {
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15), 0 0 0 8px rgba(255, 255, 255, 0.4);
}

.state-active {
  box-shadow: 0 10px 25px rgba(56, 118, 29, 0.35), 0 0 0 8px rgba(144, 238, 144, 0.7);
  animation: pulse 1.6s infinite;
}

.state-completed {
  box-shadow: 0 10px 25px rgba(28, 69, 135, 0.35), 0 0 0 8px rgba(135, 206, 235, 0.7);
}

@keyframes pulse {
  0% { transform: scale(1) translate(-50%, -50%); }
  50% { transform: scale(1.1) translate(-50%, -50%); }
  100% { transform: scale(1) translate(-50%, -50%); }
}

.node-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #9ad6ff, #3a7bd5);
  box-shadow: inset 0 0 0 2px #dff1ff, 0 0 10px rgba(58, 123, 213, 0.6);
}

.state-active .node-dot {
  background: linear-gradient(135deg, #c6ffb3, #62c370);
  box-shadow: inset 0 0 0 2px #e0ffd8, 0 0 10px rgba(98, 195, 112, 0.65);
}

.state-completed .node-dot {
  background: linear-gradient(135deg, #b6d7ff, #1c4587);
  box-shadow: inset 0 0 0 2px #e1eeff, 0 0 10px rgba(28, 69, 135, 0.65);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
</style>