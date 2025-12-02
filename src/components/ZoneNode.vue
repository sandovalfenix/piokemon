<template>
  <button
    :class="['zone-node', `state-${zone.state}`]"
    :style="nodeStyle"
    @click="handleClick"
    :title="zone.name"
  >
    <span v-if="zone.state === 'locked'">🔒</span>
    <span v-else-if="zone.state === 'active'">🟢</span>
    <span v-else-if="zone.state === 'completed'">✅</span>
  </button>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits } from 'vue';
import type { Zone } from '../types/zone';

const props = defineProps<{
  zone: Zone;
  mapWidth: number;
  mapHeight: number;
}>();

const emit = defineEmits(['node-click']);

const nodeStyle = computed(() => ({
  left: `${(props.zone.position.x / props.mapWidth) * 100}%`,
  top: `${(props.zone.position.y / props.mapHeight) * 100}%`,
}));

const handleClick = () => {
  emit('node-click', props.zone);
};
</script>

<style scoped>
.zone-node {
  position: absolute;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 3px solid #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.3s ease;
  z-index: 10;
  transform: translate(-50%, -50%); /* Centrar el nodo en sus coordenadas x, y */
}

.state-locked {
  background-color: #666;
  border-color: #444;
  cursor: not-allowed;
}

.state-active {
  background-color: #90ee90;
  border-color: #38761d;
  animation: pulse 1.5s infinite;
}

.state-completed {
  background-color: #87ceeb;
  border-color: #1c4587;
}

@keyframes pulse {
  0% { transform: scale(1) translate(-50%, -50%); }
  50% { transform: scale(1.1) translate(-50%, -50%); }
  100% { transform: scale(1) translate(-50%, -50%); }
}
</style>