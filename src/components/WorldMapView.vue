<template>
  <div class="world-map-view">
    <!-- Instrucciones de controles -->
    <div class="controls-hint">
      <span class="hint-icon">🎮</span>
      <span
        >Usa <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> o las <kbd>↑</kbd><kbd>↓</kbd
        ><kbd>←</kbd><kbd>→</kbd> para moverte</span
      >
    </div>

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

      <!-- Jugador controlable -->
      <PlayerCharacter
        :x="playerPosition.x"
        :y="playerPosition.y"
        :is-moving="isMoving"
        :image-src="playerImage"
        label="Jugador"
      />
    </div>

    <!-- Controles móviles -->
    <div class="mobile-controls">
      <div class="control-row">
        <button class="control-btn" @click="move('up')">⬆️</button>
      </div>
      <div class="control-row">
        <button class="control-btn" @click="move('left')">⬅️</button>
        <button class="control-btn" @click="move('down')">⬇️</button>
        <button class="control-btn" @click="move('right')">➡️</button>
      </div>
    </div>

    <ZonePopover
      :zone="mapStore.getSelectedZone"
      @close="mapStore.setSelectedZone(null)"
      @enter-zone="handleEnterZone"
    />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import mapArt from '../assets/map.jpg'
import playerImage from '../assets/player.png'
import { useKeyboardMovement } from '../composables/useKeyboardMovement'
import { useMapStore } from '../stores/mapStore'
import PathConnections from './PathConnections.vue'
import PlayerCharacter from './PlayerCharacter.vue'
import ZoneNode from './ZoneNode.vue'
import ZonePopover from './ZonePopover.vue'

const mapStore = useMapStore()
const router = useRouter()

// Sistema de movimiento del jugador
const {
  position: playerPosition,
  isMoving,
  move,
} = useKeyboardMovement({
  initialPosition: { x: 50, y: 85 },
  speed: 2.5,
  bounds: { minX: 15, maxX: 85, minY: 10, maxY: 95 },
  onMove: (pos) => {
    // Detectar si el jugador está cerca de una zona
    checkZoneProximity(pos)
  },
})

// Detectar proximidad a zonas
const checkZoneProximity = (pos: { x: number; y: number }) => {
  const proximityThreshold = 8 // % de distancia para activar zona

  for (const zone of mapStore.allZones) {
    // Convertir coordenadas de zona a porcentaje
    const zoneX = (zone.position.x / MAP_WIDTH) * 100
    const zoneY = (zone.position.y / MAP_HEIGHT) * 100

    const distance = Math.sqrt(Math.pow(pos.x - zoneX, 2) + Math.pow(pos.y - zoneY, 2))

    // Mostrar modal en TODAS las zonas (incluso bloqueadas)
    if (distance < proximityThreshold) {
      mapStore.setSelectedZone(zone)
      return
    }
  }
}

const MAP_WIDTH = 1200
const MAP_HEIGHT = 1800

// Medición del área renderizada para alinear SVG y nodos en pixeles reales
const mapCanvas = ref<HTMLElement | null>(null)
const mapImg = ref<HTMLImageElement | null>(null)
const renderWidth = ref<number>(0)
const renderHeight = ref<number>(0)

// Imagen renderizada dentro del canvas (área 'contain')
const imageWidth = ref<number>(0)
const imageHeight = ref<number>(0)
const imageOffsetX = ref<number>(0) // desde el borde izquierdo del container
const imageOffsetY = ref<number>(0) // desde el borde superior del container

const measure = () => {
  if (!mapCanvas.value) return
  const rect = mapCanvas.value.getBoundingClientRect()
  renderWidth.value = Math.round(rect.width)
  renderHeight.value = Math.round(rect.height)

  // Si la imagen está cargada, calcular su tamaño real dentro del contenedor
  if (mapImg.value) {
    const imgRect = mapImg.value.getBoundingClientRect()
    imageWidth.value = Math.round(imgRect.width)
    imageHeight.value = Math.round(imgRect.height)
    imageOffsetX.value = Math.round(imgRect.left - rect.left)
    imageOffsetY.value = Math.round(imgRect.top - rect.top)
  }
  // Debug: muestra las dimensiones reales usadas para escalar rutas
  console.log('mapCanvas size', renderWidth.value, renderHeight.value)
}

onMounted(() => {
  measure()
  window.addEventListener('resize', measure)
  // Si la imagen cambia de tamaño al cargarse, volver a medir
  if (mapImg.value) {
    mapImg.value.addEventListener('load', measure)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', measure)
  if (mapImg.value) {
    mapImg.value.removeEventListener('load', measure)
  }
})

const handleEnterZone = (zoneId: number) => {
  console.log(`¡Entrando a la Zona ID: ${zoneId}! Redirigiendo...`)

  // Obtener la zona desde el store
  const zone = mapStore.getZoneById(zoneId)

  if (!zone) {
    alert(`Zona con ID ${zoneId} no encontrada.`)
    return
  }

  // Convertir el nombre de la zona a un slug URL-friendly
  // Ejemplo: "Zona Plazoleta Jairo Varela" -> "zona-plazoleta-jairo-varela"
  const zoneSlug = zone.name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Reemplazar espacios por guiones
    .normalize('NFD') // Normalizar caracteres Unicode
    .replace(/[\u0300-\u036f]/g, '') // Eliminar diacríticos (acentos)

  // Usar la ruta correcta que coincide con ZoneLobbyView
  const route = `/zone-lobby/${zoneSlug}`
  router.push(route)
}
</script>

<style scoped>
.world-map-view {
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  position: relative;
  /* background: radial-gradient(circle at 50% 20%, #dff4ff 0%, #a5d6ff 70%, #7fb7ff 100%); */
  padding: 20px 0 40px;
}

.controls-hint {
  position: fixed;
  top: 16px;
  left: 15%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.75);
  color: white;
  border-radius: 20px;
  font-size: 0.85rem;
  z-index: 100;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.controls-hint kbd {
  display: inline-block;
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.8rem;
  margin: 0 2px;
}

.hint-icon {
  font-size: 1.1rem;
}

.map-canvas {
  position: relative;
  width: min(700px, 95vw);
  aspect-ratio: 2 / 3;
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

/* Controles móviles */
.mobile-controls {
  display: none;
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 100;
  flex-direction: column;
  gap: 4px;
}

.control-row {
  display: flex;
  justify-content: center;
  gap: 4px;
}

.control-btn {
  width: 50px;
  height: 50px;
  border: none;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition:
    transform 0.1s,
    background 0.2s;
}

.control-btn:active {
  transform: scale(0.95);
  background: rgba(200, 200, 200, 0.9);
}

/* Mostrar controles móviles en pantallas táctiles */
@media (max-width: 768px), (hover: none) {
  .mobile-controls {
    display: flex;
  }

  .controls-hint {
    font-size: 0.75rem;
    padding: 6px 12px;
  }

  .controls-hint kbd {
    display: none;
  }

  .controls-hint::after {
    content: 'Usa los botones ↓';
  }
}
</style>
