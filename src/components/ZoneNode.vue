<template>
  <Card
    class="zone-card group relative overflow-hidden cursor-pointer transition-all duration-300 ease-out min-h-[200px]"
    @click="handleClick"
  >
    <!-- Imagen de fondo con efecto zoom -->
    <div
      v-if="zoneImage"
      class="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 ease-out group-hover:scale-110"
      :style="{
        backgroundImage: `url(${zoneImage})`,
      }"
    />

    <!-- Overlay -->
    <div class="absolute inset-0 bg-black/60 transition-opacity duration-300 group-hover:bg-black/50" />

    <!-- Contenido de la card -->
    <div class="relative z-10 flex flex-row items-center justify-between h-full p-6 gap-6">
      <!-- Icono o imagen de fallback -->
      <div
        v-if="!zoneImage"
        class="w-24 h-24 rounded-full flex items-center justify-center shrink-0 shadow-lg bg-white/30"
      >
        <span class="text-5xl leading-none">{{ zoneIcon }}</span>
      </div>

      <!-- Información de la zona -->
      <div class="flex flex-col gap-3 flex-1 min-w-0">
        <h3
          class="text-3xl font-black leading-tight text-white"
          style="text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8), 0 0 12px rgba(0, 0, 0, 0.5);"
        >
          {{ zoneNameWithoutPrefix }}
        </h3>

        <p
          v-if="zone.description"
          class="text-base leading-relaxed text-white font-medium"
          style="text-shadow: 1px 1px 6px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0, 0, 0, 0.4);"
        >
          {{ zone.description }}
        </p>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Card } from '@/components/ui/card'
import type { Zone } from '../types/zone'

// Importar imágenes de locations
import laErmitaImg from '@/assets/img/locations/la_ermita.png'
import nicheImg from '@/assets/img/locations/niche.png'
import parqueCanaImg from '@/assets/img/locations/parque_cana.png'
import cristoReyImg from '@/assets/img/locations/cristo_rey.png'
import zooCaliImg from '@/assets/img/locations/zoo_cali.png'

const props = defineProps<{
  zone: Zone
}>()

const emit = defineEmits(['node-click'])

const handleClick = () => {
  emit('node-click', props.zone)
}

// Mapeo de zonas a imágenes de locations
// Solo incluir zonas que tienen imágenes disponibles
const zoneImage = computed(() => {
  const images: Record<number, string> = {
    1: nicheImg, // Zona Plazoleta Jairo Varela (id: 1) - niche.png
    2: zooCaliImg, // Zona Zoo de Cali (id: 2) - zoo_cali.png
    3: laErmitaImg, // Zona La Ermita (id: 3) - la_ermita.png
    4: cristoReyImg, // Zona Cristo Rey (id: 4) - cristo_rey.png
    5: parqueCanaImg, // Zona Parque de la Caña (id: 5) - parque_cana.png
  }
  return images[props.zone.id]
})

// Eliminar "Zona" del nombre si está presente
const zoneNameWithoutPrefix = computed(() => {
  return props.zone.name.replace(/^Zona\s+/i, '').trim()
})

// Iconos personalizados por zona (fallback cuando no hay imagen)
const zoneIcon = computed(() => {
  const icons: Record<number, string> = {
    1: '🦁', // Zona Plazoleta Jairo Varela
    2: '🐘', // Zona Zoo de Cali
    3: '⛪', // Zona La Ermita
    4: '🏔️', // Zona Cristo Rey
    5: '🌴', // Zona Parque de la Caña
  }
  return icons[props.zone.id] || '📍'
})
</script>

<style scoped>
.zone-card {
  background-color: #1a1a1a;
}

.zone-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
}

.zone-card:active {
  transform: translateY(-2px);
}

@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.4);
  }
  50% {
    box-shadow: 0 0 30px rgba(34, 197, 94, 0.6);
  }
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}
</style>
