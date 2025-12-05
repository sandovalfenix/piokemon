<template>
  <div v-if="zone" class="zone-popover-overlay" @click.self="$emit('close')">
    <div class="popover-content" :class="stateClass">
      <!-- Header con icono de estado -->
      <div class="popover-header">
        <span class="zone-icon">{{ zoneIcon }}</span>
        <h2>{{ zone.name }}</h2>
      </div>

      <p class="zone-description">{{ zone.description }}</p>

      <!-- Estado de la zona -->
      <div class="zone-status">
        <div v-if="zone.state === 'locked'" class="status-locked">
          <span class="status-icon">🔒</span>
          <div class="status-info">
            <span class="status-label">Zona Bloqueada</span>
            <span class="status-requirement">{{ zone.requirements }}</span>
          </div>
        </div>

        <div v-else-if="zone.state === 'completed'" class="status-completed">
          <span class="status-icon">✅</span>
          <div class="status-info">
            <span class="status-label">¡Completada!</span>
            <span class="status-progress">Progreso: {{ zone.progress }}%</span>
          </div>
        </div>

        <div v-else class="status-active">
          <span class="status-icon">⚡</span>
          <div class="status-info">
            <span class="status-label">Zona Disponible</span>
            <span v-if="zone.progress !== undefined" class="status-progress">
              Progreso: {{ zone.progress }}%
            </span>
          </div>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="action-buttons">
        <button
          v-if="zone.state !== 'locked'"
          @click="$emit('enter-zone', zone.id)"
          class="btn-enter"
        >
          <span class="btn-icon">🚀</span>
          {{ zone.state === 'completed' ? 'Volver a Explorar' : 'Entrar a la Zona' }}
        </button>

        <button @click="$emit('close')" class="btn-close">
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Zone } from '../types/zone';

const props = defineProps<{
  zone: Zone | null;
}>();

defineEmits(['close', 'enter-zone']);

const stateClass = computed(() => {
  if (!props.zone) return '';
  return `state-${props.zone.state}`;
});

const zoneIcon = computed(() => {
  if (!props.zone) return '📍';

  // Iconos personalizados por zona
  const icons: Record<number, string> = {
    1: '🦁', // Zoológico
    2: '💃', // Plazoleta Jairo Varela
    3: '🐘', // Zoológico Sur
    4: '⛪', // Cristo Rey
    5: '🌴', // Parque de la Caña
  };

  return icons[props.zone.id] || '📍';
});
</script>

<style scoped>
.zone-popover-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.popover-content {
  background: linear-gradient(145deg, #ffffff, #f5f5f5);
  padding: 0;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 380px;
  width: 90vw;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Header */
.popover-header {
  padding: 20px;
  text-align: center;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.state-locked .popover-header {
  background: linear-gradient(135deg, #636363, #3d3d3d);
}

.state-completed .popover-header {
  background: linear-gradient(135deg, #11998e, #38ef7d);
}

.state-active .popover-header {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.zone-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 8px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

.popover-header h2 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
}

/* Descripción */
.zone-description {
  padding: 16px 20px;
  margin: 0;
  color: #555;
  font-size: 0.95rem;
  line-height: 1.5;
  text-align: center;
  border-bottom: 1px solid #eee;
}

/* Estado */
.zone-status {
  padding: 16px 20px;
}

.status-locked,
.status-completed,
.status-active {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
}

.status-locked {
  background: rgba(99, 99, 99, 0.1);
}

.status-completed {
  background: rgba(56, 239, 125, 0.1);
}

.status-active {
  background: rgba(245, 87, 108, 0.1);
}

.status-icon {
  font-size: 2rem;
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.status-label {
  font-weight: 600;
  color: #333;
}

.status-requirement,
.status-progress {
  font-size: 0.85rem;
  color: #666;
}

/* Botones */
.action-buttons {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #f9f9f9;
}

.btn-enter,
.btn-close {
  width: 100%;
  padding: 14px 20px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-enter {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.state-active .btn-enter {
  background: linear-gradient(135deg, #f093fb, #f5576c);
  box-shadow: 0 4px 15px rgba(245, 87, 108, 0.4);
}

.state-completed .btn-enter {
  background: linear-gradient(135deg, #11998e, #38ef7d);
  box-shadow: 0 4px 15px rgba(56, 239, 125, 0.4);
}

.btn-enter:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.btn-icon {
  font-size: 1.2rem;
}

.btn-close {
  background: #e0e0e0;
  color: #555;
}

.btn-close:hover {
  background: #d0d0d0;
}
</style>
