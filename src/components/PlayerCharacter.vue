<template>
  <div
    class="player-character"
    :class="{ 'is-moving': isMoving }"
    :style="playerStyle"
  >
    <div class="player-sprite">
      <!-- Imagen personalizada o emoji fallback -->
      <img
        v-if="imageSrc"
        :src="imageSrc"
        :alt="label"
        class="sprite-image"
      />
      <span v-else class="sprite-emoji">{{ sprite }}</span>
      <span class="player-shadow"></span>
      <div v-if="showLabel" class="player-label">{{ label }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface PlayerProps {
  /** Posición X en porcentaje */
  x: number
  /** Posición Y en porcentaje */
  y: number
  /** Ruta de imagen personalizada del jugador */
  imageSrc?: string
  /** Emoji fallback del jugador */
  sprite?: string
  /** Si está en movimiento */
  isMoving?: boolean
  /** Etiqueta del jugador */
  label?: string
  /** Mostrar etiqueta */
  showLabel?: boolean
}

const props = withDefaults(defineProps<PlayerProps>(), {
  imageSrc: '',
  sprite: '🧑‍🎓',
  isMoving: false,
  label: 'Tú',
  showLabel: true,
})

const playerStyle = computed(() => ({
  left: `${props.x}%`,
  top: `${props.y}%`,
}))
</script>

<style scoped>
.player-character {
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 50;
  transition: left 0.15s ease-out, top 0.15s ease-out;
  pointer-events: none;
}

.player-sprite {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-direction: column-reverse;
}

.sprite-image {
  width: 200px;
  height: 200px;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4));
  transition: transform 0.15s ease;
  image-rendering: pixelated; /* Mantiene el estilo pixel art nítido */
}

.sprite-emoji {
  font-size: 2.5rem;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));
  transition: transform 0.15s ease;
}

.player-shadow {
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 10px;
  background: radial-gradient(ellipse, rgba(0, 0, 0, 0.35) 0%, transparent 70%);
  border-radius: 50%;
}

.player-label {
  padding: 4px 6px;
  background: rgba(0, 0, 0, 0.75);
  color: white;
  font-size: 0.7rem;
  width: 80px;
  font-weight: 600;
  border-radius: 10px;
  white-space: nowrap;
  text-align: center;
  backdrop-filter: blur(4px);
}

/* Animación de movimiento */
.player-character.is-moving .sprite-image,
.player-character.is-moving .sprite-emoji {
  animation: bounce 0.15s ease-in-out;
}

@keyframes bounce {
  0% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0); }
}

/* Animación idle (respiración) */
.player-character:not(.is-moving) .sprite-image,
.player-character:not(.is-moving) .sprite-emoji {
  animation: breathe 2s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-3px) scale(1.03); }
}
</style>
