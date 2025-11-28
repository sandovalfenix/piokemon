<script setup lang="ts">
import { ref, computed } from 'vue'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface BallItem { type: string; label: string; count: number }

const props = defineProps<{ inventory?: BallItem[] }>()
const emit = defineEmits<{
  'ball-seleccionada': [ballData: BallItem]
  'cerrar': []
}>()

const defaultInventory: BallItem[] = [
  { type: 'pokeball', label: 'Poké Ball', count: 10 },
  { type: 'great-ball', label: 'Great Ball', count: 5 },
  { type: 'ultra-ball', label: 'Ultra Ball', count: 2 },
  { type: 'master-ball', label: 'Master Ball', count: 1 },
  { type: 'premier-ball', label: 'Premier Ball', count: 3 }
]

const inventory = ref<BallItem[]>(props.inventory && Array.isArray(props.inventory) ? [...props.inventory] : defaultInventory)
const selected = ref<string | null>(null)
const carousel = ref<HTMLElement | null>(null)

const selectedBall = computed(() => inventory.value.find(b => b.type === selected.value) ?? null)

function selectBall(type: string) {
  const b = inventory.value.find(x => x.type === type)
  if (!b || b.count <= 0) return
  selected.value = type
}

function lanzar() {
  if (!selectedBall.value) return
  emit('ball-seleccionada', { ...selectedBall.value })
  const idx = inventory.value.findIndex(b => b.type === selected.value)
  if (idx >= 0) {
    inventory.value[idx].count = Math.max(0, inventory.value[idx].count - 1)
    if (inventory.value[idx].count === 0) selected.value = null
  }
}

function cerrar() {
  emit('cerrar')
}

function scrollLeft() {
  carousel.value?.scrollBy({ left: -150, behavior: 'smooth' })
}

function scrollRight() {
  carousel.value?.scrollBy({ left: 150, behavior: 'smooth' })
}

// API de imágenes: Pokémon Database
function getBallImage(type: string): string {
  return `https://img.pokemondb.net/sprites/items/${type}.png`
}
</script>

<template>
  <div class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <Card class="w-full max-w-3xl mx-auto border border-border shadow-xl bg-gradient-to-br from-pink-100 via-indigo-100 to-blue-100">
      <CardHeader class="border-b border-border flex items-center justify-between">
        <CardTitle class="text-2xl font-bold text-foreground">🎒 Mochila de Pokéballs</CardTitle>
        <button @click="cerrar" class="text-sm text-muted-foreground hover:text-foreground">Cerrar ✕</button>
      </CardHeader>

      <CardContent class="p-4">
        <div class="relative">
          <!-- Flecha izquierda -->
          <button
            @click="scrollLeft"
            class="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow"
          >
            ◀
          </button>

          <!-- Carrusel horizontal -->
          <div ref="carousel" class="flex overflow-x-auto gap-6 px-8 scroll-smooth scrollbar-hide">
            <div
              v-for="ball in inventory"
              :key="ball.type"
              @click="selectBall(ball.type)"
              :class="['min-w-[140px] flex-shrink-0 rounded-lg p-3 flex flex-col items-center gap-2 border transition-all duration-300', selected === ball.type ? 'border-primary shadow-lg' : 'border-border', ball.count === 0 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer']"
            >
              <img :src="getBallImage(ball.type)" :alt="ball.label" class="w-20 h-20 object-contain" />
              <div class="text-xl font-bold text-foreground text-center">{{ ball.label }}</div>
              <div class="text-sm text-muted-foreground">x{{ ball.count }}</div>
            </div>
          </div>

          <!-- Flecha derecha -->
          <button
            @click="scrollRight"
            class="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow"
          >
            ▶
          </button>
        </div>

        <!-- Características de la pokéball seleccionada -->
        <div v-if="selectedBall" class="mt-6 text-center text-sm text-foreground">
          <p><strong>Seleccionada:</strong> {{ selectedBall.label }}</p>
          <p><strong>Cantidad:</strong> {{ selectedBall.count }}</p>
          <p><strong>Tipo:</strong> {{ selectedBall.type }}</p>
        </div>
      </CardContent>

      <CardFooter class="border-t border-border flex gap-3 p-4">
        <Button class="flex-1 py-2 text-sm font-semibold bg-primary text-white" :disabled="!selectedBall" @click="lanzar">Lanzar</Button>
        <Button class="flex-1 py-2 text-sm font-semibold border border-border bg-white text-foreground" @click="cerrar">Cancelar</Button>
      </CardFooter>
    </Card>
  </div>
</template>

<style scoped>
/* Oculta scroll horizontal solo en este componente */
.scrollbar-hide {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}
.scrollbar-hide::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}
</style>
