<template>
  <div class="w-full h-full overflow-y-auto relative py-8 px-4 min-h-screen">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto">
      <ZoneNode
        v-for="zone in sortedZones"
        :key="zone.id"
        :zone="zone"
        @node-click="handleZoneClick"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMapStore } from '../stores/mapStore'
import ZoneNode from './ZoneNode.vue'
import type { Zone } from '../types/zone'

const mapStore = useMapStore()
const router = useRouter()

// IDs de zonas que tienen imágenes en locations
const zonesWithImages = [1, 2, 3, 4, 5] // Plazoleta Jairo Varela (niche.png), Zoo de Cali (zoo_cali.png), La Ermita (la_ermita.png), Cristo Rey (cristo_rey.png), Parque de la Caña (parque_cana.png)

// Filtrar y ordenar solo las zonas que tienen imágenes
const sortedZones = computed(() => {
  return [...mapStore.allZones]
    .filter((zone) => zonesWithImages.includes(zone.id))
    .sort((a, b) => a.id - b.id)
})

const handleZoneClick = (zone: Zone) => {
  console.log(`¡Entrando a la Zona ID: ${zone.id}! Redirigiendo...`)

  // Eliminar "Zona" del nombre si está presente
  const zoneNameWithoutPrefix = zone.name.replace(/^Zona\s+/i, '').trim()

  // Convertir el nombre de la zona a un slug URL-friendly
  // Ejemplo: "Plazoleta Jairo Varela" -> "plazoleta-jairo-varela"
  const zoneSlug = zoneNameWithoutPrefix
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
