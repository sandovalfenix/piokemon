<script setup lang="ts">
/**
 * CaptureOverlay Component
 * Feature: 007-wild-encounter-capture
 *
 * Modal overlay for capture mechanics in wild battles.
 * Three phases:
 * 1. Ball Selection - Use inventarioball.vue style carousel
 * 2. Shake Animation - Pokéball shakes 0-3 times
 * 3. Result - Success/failure display
 */
import { computed, ref, watch } from 'vue'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { CapturePhase, BallType } from '@/models/capture'

// ============================================================================
// Props & Emits
// ============================================================================

interface CaptureOverlayProps {
  /** Whether the overlay is visible */
  isOpen: boolean

  /** Current capture phase */
  phase: CapturePhase

  /** Number of shakes to animate (0-3) */
  shakes: number

  /** Whether capture succeeded */
  success: boolean

  /** Ball type being thrown (for sprite) */
  ballType: BallType | null

  /** Where the Pokémon was saved (team or pcbox) */
  savedTo: 'team' | 'pcbox' | null
}

const props = defineProps<CaptureOverlayProps>()

const emit = defineEmits<{
  /** User selected a ball type */
  'ball-selected': [ballType: BallType]

  /** User cancelled ball selection */
  'close': []

  /** Shake animation completed */
  'animation-complete': []

  /** Result acknowledged, proceed */
  'proceed': []
}>()

// ============================================================================
// State
// ============================================================================

interface BallItem {
  type: BallType
  label: string
  count: number
  modifier: number
}

const defaultInventory: BallItem[] = [
  { type: 'pokeball', label: 'Poké Ball', count: 20, modifier: 1 },
  { type: 'superball', label: 'Super Ball', count: 10, modifier: 1.5 },
  { type: 'ultraball', label: 'Ultra Ball', count: 5, modifier: 2 },
  { type: 'masterball', label: 'Master Ball', count: 1, modifier: 255 },
]

const inventory = ref<BallItem[]>([...defaultInventory])
const selectedBall = ref<BallType | null>(null)

// Animation state
const currentShake = ref(0)
const isAnimating = ref(false)

// ============================================================================
// Computed
// ============================================================================

const selectedBallData = computed(() =>
  inventory.value.find((b) => b.type === selectedBall.value) ?? null
)

const resultMessage = computed(() => {
  if (props.success) {
    if (props.savedTo === 'team') {
      return '¡Captura exitosa! Añadido al equipo.'
    }
    return '¡Captura exitosa! Enviado a la PC Box.'
  }
  return '¡Oh no! ¡El Pokémon escapó!'
})

const resultEmoji = computed(() => (props.success ? '' : ''))

// Ball sprite URL mapping (PokémonDB)
const ballSpriteMap: Record<BallType, string> = {
  pokeball: 'https://img.pokemondb.net/sprites/items/poke-ball.png',
  superball: 'https://img.pokemondb.net/sprites/items/great-ball.png',
  ultraball: 'https://img.pokemondb.net/sprites/items/ultra-ball.png',
  masterball: 'https://img.pokemondb.net/sprites/items/master-ball.png',
}

// Map internal type to PokémonDB sprite name
function getBallImage(type: BallType): string {
  return ballSpriteMap[type] ?? ballSpriteMap.pokeball
}

// ============================================================================
// Shake Animation
// ============================================================================

// Watch for shake phase to animate
watch(
  () => props.phase,
  async (phase) => {
    if (phase === 'shaking' && !isAnimating.value) {
      isAnimating.value = true
      currentShake.value = 0

      // Animate each shake
      for (let i = 0; i < props.shakes; i++) {
        currentShake.value = i + 1
        await delay(500) // 500ms per shake
      }

      // Wait a bit before showing result
      await delay(300)
      isAnimating.value = false
      emit('animation-complete')
    }
  }
)

// ============================================================================
// Actions
// ============================================================================

function selectBall(type: BallType) {
  const ball = inventory.value.find((b) => b.type === type)
  if (!ball || ball.count <= 0) return
  selectedBall.value = type
}

function handleThrow() {
  if (!selectedBall.value) return

  // Decrement ball count
  const ballIndex = inventory.value.findIndex((b) => b.type === selectedBall.value)
  if (ballIndex >= 0) {
    const ball = inventory.value[ballIndex]
    if (ball && ball.count > 0) {
      ball.count--
    }
  }

  emit('ball-selected', selectedBall.value)
}

function handleClose() {
  selectedBall.value = null
  emit('close')
}

function handleProceed() {
  selectedBall.value = null
  emit('proceed')
}

// ============================================================================
// Helpers
// ============================================================================

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Get shake animation class based on current shake count
function getShakeClass(): string {
  if (props.phase !== 'shaking') return ''
  if (currentShake.value === 1) return 'animate-shake-once'
  if (currentShake.value === 2) return 'animate-shake-twice'
  if (currentShake.value === 3) return 'animate-shake-thrice'
  return 'animate-shake'
}
</script>

<template>
  <!-- Overlay Backdrop -->
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @click.self="phase === 'selecting-ball' ? handleClose() : undefined"
  >
    <!-- Ball Selection Phase -->
    <Card
      v-if="phase === 'selecting-ball'"
      class="w-full max-w-2xl mx-auto border border-border shadow-xl bg-gradient-to-br from-emerald-50 via-white to-green-50"
    >
      <CardHeader class="border-b border-border flex items-center justify-between">
        <CardTitle class="text-xl font-bold text-foreground">Selecciona una Pokéball</CardTitle>
        <button
          @click="handleClose"
          class="text-sm px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition"
        >
          Cancelar
        </button>
      </CardHeader>

      <CardContent class="p-4">
        <!-- Ball Carousel -->
        <div class="flex overflow-x-auto justify-center gap-4 px-4 py-4 scroll-smooth">
          <div
            v-for="ball in inventory"
            :key="ball.type"
            @click="selectBall(ball.type)"
            :class="[
              'min-w-[120px] flex-shrink-0 rounded-lg p-3 flex flex-col items-center gap-2 border-2 transition-all duration-300',
              selectedBall === ball.type
                ? 'border-green-500 bg-green-50 shadow-lg scale-105'
                : 'border-border hover:border-green-300',
              ball.count === 0 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-102',
            ]"
          >
            <img :src="getBallImage(ball.type)" :alt="ball.label" class="w-16 h-16 object-contain" />
            <div class="text-sm font-bold text-foreground text-center">{{ ball.label }}</div>
            <div class="text-xs text-muted-foreground">x{{ ball.count }}</div>
            <div class="text-xs text-green-600">{{ ball.modifier }}x</div>
          </div>
        </div>

        <!-- Selected Ball Info -->
        <div v-if="selectedBallData" class="mt-4 text-center text-sm text-foreground">
          <p>
            <strong>{{ selectedBallData.label }}</strong> - Modificador: {{ selectedBallData.modifier }}x
          </p>
        </div>
      </CardContent>

      <CardFooter class="border-t border-border flex gap-3 p-4">
        <Button
          class="flex-1 py-3 text-lg font-bold bg-green-600 hover:bg-green-700 text-white"
          :disabled="!selectedBall"
          @click="handleThrow"
        >
          ¡Lanzar!
        </Button>
        <Button
          variant="outline"
          class="flex-1 py-3 text-lg font-bold"
          @click="handleClose"
        >
          Cancelar
        </Button>
      </CardFooter>
    </Card>

    <!-- Throwing / Shaking Phase -->
    <Card
      v-else-if="phase === 'throwing' || phase === 'shaking'"
      class="w-full max-w-md mx-auto border border-border shadow-xl bg-gradient-to-br from-slate-50 via-white to-slate-100"
    >
      <CardContent class="p-8 flex flex-col items-center justify-center min-h-[300px]">
        <!-- Ball Animation -->
        <div class="relative mb-6">
          <img
            v-if="ballType"
            :src="getBallImage(ballType)"
            :alt="ballType"
            :class="[
              'w-24 h-24 object-contain transition-transform',
              phase === 'throwing' ? 'animate-bounce' : '',
              phase === 'shaking' ? getShakeClass() : '',
            ]"
          />
        </div>

        <!-- Status Text -->
        <div class="text-center">
          <p v-if="phase === 'throwing'" class="text-xl font-bold text-foreground animate-pulse">
            ¡Lanzando Pokéball!
          </p>
          <p v-else-if="phase === 'shaking'" class="text-xl font-bold text-foreground flex justify-center gap-2">
            <i
              v-for="n in 3"
              :key="n"
              class="pi"
              :class="n <= currentShake ? 'pi-circle-fill text-green-500' : 'pi-circle text-gray-400'"
            ></i>
          </p>
        </div>

        <!-- Shake Counter -->
        <p v-if="phase === 'shaking'" class="mt-4 text-sm text-muted-foreground">
          Sacudida {{ currentShake }} de {{ shakes }}...
        </p>
      </CardContent>
    </Card>

    <!-- Result Phase -->
    <Card
      v-else-if="phase === 'result'"
      class="w-full max-w-md mx-auto border border-border shadow-xl"
      :class="success ? 'bg-gradient-to-br from-green-50 via-emerald-50 to-green-100' : 'bg-gradient-to-br from-red-50 via-orange-50 to-red-100'"
    >
      <CardContent class="p-8 flex flex-col items-center justify-center min-h-[300px]">
        <!-- Result Icon -->
        <div class="text-6xl mb-4 animate-bounce">
          {{ resultEmoji }}
        </div>

        <!-- Result Ball (if success) -->
        <div v-if="success && ballType" class="mb-4">
          <img :src="getBallImage(ballType)" :alt="ballType" class="w-16 h-16 object-contain" />
        </div>

        <!-- Result Message -->
        <h2
          :class="[
            'text-2xl font-bold text-center mb-2',
            success ? 'text-green-700' : 'text-red-700',
          ]"
        >
          {{ success ? '¡Atrapado!' : '¡Escapó!' }}
        </h2>

        <p class="text-center text-foreground">
          {{ resultMessage }}
        </p>

        <!-- Save Location Badge -->
        <div v-if="success && savedTo" class="mt-4 px-4 py-2 rounded-full bg-white shadow">
          <span v-if="savedTo === 'team'" class="text-green-600 font-semibold">
            Añadido al equipo
          </span>
          <span v-else class="text-blue-600 font-semibold">
            Enviado a PC Box
          </span>
        </div>
      </CardContent>

      <CardFooter class="border-t border-border flex justify-center p-4">
        <Button
          :class="[
            'px-8 py-3 text-lg font-bold',
            success
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white',
          ]"
          @click="handleProceed"
        >
          {{ success ? '¡Genial!' : 'Continuar' }}
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>

<style scoped>
/* Shake animations using Tailwind config */
.animate-shake-once {
  animation: shake 0.5s ease-in-out 1;
}

.animate-shake-twice {
  animation: shake 0.5s ease-in-out 2;
}

.animate-shake-thrice {
  animation: shake 0.5s ease-in-out 3;
}

@keyframes shake {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-20deg);
  }
  75% {
    transform: rotate(20deg);
  }
}

/* Hide scrollbar but allow scroll */
.scroll-smooth::-webkit-scrollbar {
  display: none;
}
.scroll-smooth {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
