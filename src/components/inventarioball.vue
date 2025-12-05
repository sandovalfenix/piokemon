<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useEncounterStore } from '@/stores/useEncounterStore'

interface BallItem { type: string; label: string; count: number }

const props = defineProps<{ inventory?: BallItem[] }>()
const emit = defineEmits<{
  'ball-seleccionada': [ballData: BallItem]
  'cerrar': []
}>()

// Imágenes (usa los archivos en src/assets/images/)
import throwImage from '@/assets/images/throw.jfif'
import successImage from '@/assets/images/capture-success.jpg'
import failedImage from '@/assets/images/capture-failed.png'

const defaultInventory: BallItem[] = [
  { type: 'poke-ball', label: 'Poké Ball', count: 10 },
  { type: 'great-ball', label: 'Great Ball', count: 5 },
  { type: 'ultra-ball', label: 'Ultra Ball', count: 2 },
  { type: 'master-ball', label: 'Master Ball', count: 1 }
]

const inventory = ref<BallItem[]>(props.inventory && Array.isArray(props.inventory) ? [...props.inventory] : defaultInventory)
const selected = ref<string | null>(null)
const carousel = ref<HTMLElement | null>(null)
const currentImage = ref<string | null>(null)

const selectedBall = computed(() => inventory.value.find(b => b.type === selected.value) ?? null)

// Estados visuales para el flujo de captura
const capturandose = ref(false)
const resultadoCaptura = ref<'exito' | 'fallo' | null>(null)
const mostrandoResultado = ref(false)

const encounterStore = useEncounterStore()

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function selectBall(type: string) {
  const b = inventory.value.find(x => x.type === type)
  if (!b || b.count <= 0) return
  selected.value = type
}

async function lanzar() {
  if (!selectedBall.value) return
  const tipoSeleccionado = selectedBall.value.type
  if (!tipoSeleccionado) return

  // Estado inicial
  capturandose.value = true
  mostrandoResultado.value = false
  resultadoCaptura.value = null
  currentImage.value = null

  // Mostrar imagen de lanzamiento
  currentImage.value = throwImage
  await delay(1000)

  // Resultado real
  const resultado = await encounterStore.tryCapture(tipoSeleccionado)
  console.log('Resultado de captura:', resultado)

  const ok = resultado.success

  // Mostrar imagen según éxito o fallo
  currentImage.value = ok ? successImage : failedImage

  // Mostrar resultado
  capturandose.value = false
  mostrandoResultado.value = true
  resultadoCaptura.value = ok ? 'exito' : 'fallo'
}

function cerrar() {
  emit('cerrar')
}

function cerrarYResetear() {
    // 🔥 comprobar antes de resetear
    if (resultadoCaptura.value === 'exito') {
        encounterStore.endEncounter()
    }

    // ahora sí resetea estados
    mostrandoResultado.value = false
    resultadoCaptura.value = null
    capturandose.value = false
    currentImage.value = null

    emit('cerrar')
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
        <button
        @click="cerrar"
          class="text-sm px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition"
        > Cerrar ✕ </button>
      </CardHeader>

      <CardContent class="p-4">
        <!-- Estado: lanzando o mostrando resultado (imagen) -->
        <div v-if="capturandose || mostrandoResultado" class="flex flex-col items-center justify-center gap-4 min-h-96">
          <p v-if="capturandose" class="text-lg font-semibold">¡Lanzando...</p>
          <p v-else-if="resultadoCaptura === 'exito'" class="text-2xl font-bold text-green-600">¡Captura Exitosa!</p>
          <p v-else-if="resultadoCaptura === 'fallo'" class="text-2xl font-bold text-red-600">¡Se escapó!</p>

          <img
            v-if="currentImage"
            :src="currentImage"
            alt="captura"
            class="w-64 h-64 object-contain rounded-lg shadow-lg"
          />

          <button v-if="mostrandoResultado" @click="cerrarYResetear" class="mt-6 px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition">
            Continuar
          </button>
        </div>

        <!-- Estado inicial: carrusel de pokébolas -->
        <div v-else>
          <div ref="carousel" class="flex overflow-x-auto justify-between gap-6 px-8 scroll-smooth scrollbar-hide">
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

          <!-- Características de la pokéball seleccionada -->
          <div v-if="selectedBall" class="mt-6 text-center text-sm text-foreground">
            <p><strong>Seleccionada:</strong> {{ selectedBall.label }}</p>
            <p><strong>Cantidad:</strong> {{ selectedBall.count }}</p>
            <p><strong>Tipo:</strong> {{ selectedBall.type }}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter class="border-t border-border flex gap-3 p-4">
            <Button class="flex-1 py-2 text-sm font-semibold bg-primary text-white" :disabled="!selectedBall" @click="lanzar">Lanzar</Button>
            <Button class="flex-1 py-2 text-sm font-semibold border border-border bg-white text-foreground" @click="cerrar">Cancelar</Button>
            <!-- Botón de depuración: simula captura exitosa -->
            <button
              @click="simulateSuccess"
              title="Simular captura exitosa (debug)"
              class="ml-2 px-3 py-1 text-xs bg-amber-200 text-amber-800 rounded"
            >Simular éxito</button>
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
