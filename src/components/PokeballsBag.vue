<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'

interface BallItem { type: string; label: string; count: number }

const props = defineProps<{ inventory?: BallItem[] }>()
const emit = defineEmits<{
  'ball-seleccionada': [ballData: BallItem]
  'cerrar': []
}>()

const defaultInventory: BallItem[] = [
  { type: 'poke-ball', label: 'Poké Ball', count: 10 },
  { type: 'great-ball', label: 'Great Ball', count: 5 },
  { type: 'ultra-ball', label: 'Ultra Ball', count: 2 },
  { type: 'master-ball', label: 'Master Ball', count: 1 }
]

const inventory = ref<BallItem[]>(props.inventory && Array.isArray(props.inventory) ? [...props.inventory] : defaultInventory)
const selected = ref<string | null>(null)

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
    const item = inventory.value[idx]
    if (item) {
      item.count = Math.max(0, item.count - 1)
      if (item.count === 0) selected.value = null
    }
  }
}

function cerrar() {
  emit('cerrar')
}

// API de imágenes: Pokémon Database
function getBallImage(type: string): string {
  return `https://img.pokemondb.net/sprites/items/${type}.png`
}

// Get ball rarity color
function getBallGlow(type: string): string {
  const glows: Record<string, string> = {
    'poke-ball': 'shadow-red-500/30',
    'great-ball': 'shadow-blue-500/30',
    'ultra-ball': 'shadow-yellow-500/30',
    'master-ball': 'shadow-purple-500/50',
  }
  return glows[type] ?? 'shadow-white/20'
}
</script>

<template>
  <!-- Modal Overlay with Glassmorphism -->
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-black/60 backdrop-blur-sm"
        @click="cerrar"
      />

      <!-- Modal Content with Glassmorphism -->
      <div class="relative w-full max-w-2xl animate-in fade-in zoom-in-95 duration-300">
        <div class="backdrop-blur-xl bg-linear-to-br from-slate-900/90 via-purple-900/80 to-slate-900/90 border border-white/20 rounded-2xl shadow-2xl overflow-hidden">

            <!-- Header -->
            <div class="px-6 py-4 border-b border-white/10 bg-white/5">
              <div class="flex items-center justify-between">
                <h2 class="text-2xl font-bold text-white flex items-center gap-3">
                  Mochila de Pokéballs
                </h2>
                <button
                  @click="cerrar"
                  class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <span class="text-white/70 hover:text-white text-xl">×</span>
                </button>
              </div>
            </div>

            <!-- Content - Ball Grid -->
            <div class="p-6">
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <button
                  v-for="ball in inventory"
                  :key="ball.type"
                  @click="selectBall(ball.type)"
                  :disabled="ball.count === 0"
                  :class="[
                    'relative p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 group',
                    selected === ball.type
                      ? 'border-white/60 bg-white/20 shadow-lg ' + getBallGlow(ball.type)
                      : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30',
                    ball.count === 0
                      ? 'opacity-40 cursor-not-allowed'
                      : 'cursor-pointer hover:scale-105'
                  ]"
                >
                  <div
                    v-if="selected === ball.type"
                    class="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white"
                  >
                    <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                  </div>

                  <!-- Ball image -->
                  <div class="relative">
                    <img
                      :src="getBallImage(ball.type)"
                      :alt="ball.label"
                      class="w-16 h-16 object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
                      :class="{ 'animate-bounce': selected === ball.type }"
                    />
                  </div>

                  <!-- Ball info -->
                  <div class="text-center">
                    <div class="text-sm font-semibold text-white">{{ ball.label }}</div>
                    <div
                      class="text-xs font-medium"
                      :class="ball.count > 0 ? 'text-emerald-400' : 'text-red-400'"
                    >
                      x{{ ball.count }}
                    </div>
                  </div>
                </button>
              </div>

              <!-- Selected ball info -->
              <Transition
                enter-active-class="transition-all duration-300"
                enter-from-class="opacity-0 translate-y-2"
                enter-to-class="opacity-100 translate-y-0"
              >
                <div
                  v-if="selectedBall"
                  class="mt-6 p-4 rounded-xl bg-white/10 border border-white/20"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <img
                        :src="getBallImage(selectedBall.type)"
                        :alt="selectedBall.label"
                        class="w-10 h-10 object-contain"
                      />
                      <div>
                        <p class="text-white font-semibold">{{ selectedBall.label }} seleccionada</p>
                        <p class="text-white/60 text-sm">Quedan {{ selectedBall.count }} en tu mochila</p>
                      </div>
                    </div>
                    <div class="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center">
                      <div class="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>

            <!-- Footer - Actions -->
            <div class="px-6 py-4 border-t border-white/10 bg-white/5 flex gap-3">
              <Button
                @click="lanzar"
                :disabled="!selectedBall"
                class="flex-1 py-3 text-base font-bold bg-linear-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white border-0 rounded-xl shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300"
              >
                <span class="flex items-center justify-center gap-2">
                 Lanzar Pokéball
                </span>
              </Button>
              <Button
                @click="cerrar"
                variant="outline"
                class="flex-1 py-3 text-base font-semibold bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl transition-all duration-300"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </div>
  </Teleport>
</template>

<style scoped>
/* Custom bounce animation for selected ball */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.animate-bounce {
  animation: bounce 1s ease-in-out infinite;
}
</style>
