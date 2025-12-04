# Component Contracts: Wild Encounter & Capture Module

**Feature**: 007-wild-encounter-capture  
**Date**: 2025-12-04

## 1. useCapture Composable

**File**: `src/composables/useCapture.ts`

### Interface

```typescript
import type { CaptureState, WildBattlePokemon } from '@/models/capture'
import type { ComputedRef, Ref } from 'vue'

export interface UseCaptureReturn {
  // State (readonly)
  captureState: Ref<CaptureState>
  isCapturing: ComputedRef<boolean>
  
  // Actions
  openBallSelector: () => void
  closeBallSelector: () => void
  attemptCapture: (ballType: string, pokemon: WildBattlePokemon) => Promise<CaptureResult>
  resetCapture: () => void
}

export interface CaptureResult {
  success: boolean
  shakes: number
  savedTo: 'team' | 'pcbox' | null
}
```

### Usage Example

```typescript
// In BattleView.vue
const { captureState, attemptCapture, openBallSelector } = useCapture()

// When user clicks Capturar button
function handleCaptureClick() {
  openBallSelector()
}

// When user selects a ball
async function handleBallSelected(ballType: string) {
  const wildPokemon = getCurrentWildPokemon()
  const result = await attemptCapture(ballType, wildPokemon)
  
  if (result.success) {
    // Battle ends, show FinalCaptura
  } else {
    // Continue battle
  }
}
```

---

## 2. CaptureOverlay Component

**File**: `src/components/capture/CaptureOverlay.vue`

### Props

```typescript
interface CaptureOverlayProps {
  /** Whether the overlay is visible */
  isOpen: boolean
  
  /** Current capture phase */
  phase: 'selecting-ball' | 'throwing' | 'shaking' | 'result'
  
  /** Number of shakes to animate (0-3) */
  shakes: number
  
  /** Whether capture succeeded */
  success: boolean
  
  /** Ball type being thrown (for sprite) */
  ballType: string
}
```

### Events

```typescript
interface CaptureOverlayEmits {
  /** User selected a ball type */
  'ball-selected': [ballType: string]
  
  /** User cancelled ball selection */
  'close': []
  
  /** Shake animation completed */
  'animation-complete': []
  
  /** Result acknowledged, proceed */
  'proceed': []
}
```

### Slots

```typescript
// No slots - self-contained component
```

### Usage Example

```vue
<CaptureOverlay
  :is-open="captureState.phase !== 'idle'"
  :phase="captureState.phase"
  :shakes="captureState.shakes"
  :success="captureState.success"
  :ball-type="selectedBall"
  @ball-selected="handleBallSelected"
  @close="closeBallSelector"
  @animation-complete="handleAnimationComplete"
  @proceed="handleProceed"
/>
```

---

## 3. Capturar.vue (Modified)

**File**: `src/components/Capturar.vue`

### Props (New/Modified)

```typescript
interface CapturarProps {
  /** Pokémon data from PokéAPI */
  pokemon: {
    id: number
    name: string
    sprite: string
    types: string[]  // NEW: Real types from API
    level: number
  }
}
```

### Events (New/Modified)

```typescript
interface CapturarEmits {
  /** User wants to battle */
  'battle': []  // NEW
  
  /** User wants to flee */
  'flee': []    // NEW
  
  // REMOVED: 'pokemon-encontrado' - no longer auto-routes to battle
}
```

### Usage Example

```vue
<Capturar
  :pokemon="wildPokemon"
  @battle="navigateToBattle"
  @flee="returnHome"
/>
```

---

## 4. BattleView.vue (Modified)

**File**: `src/views/BattleView.vue`

### New Computed Properties

```typescript
// Add to existing script setup
const isWildBattle = computed(() => battleTarget.value?.type === 'wild')
```

### New Template Elements

```vue
<!-- Add Capturar button in action menu when wild battle -->
<Button
  v-if="isWildBattle && !battleStore.isBattleOver"
  variant="secondary"
  class="bg-green-600 hover:bg-green-700 text-white"
  @click="handleCaptureClick"
>
  <span class="mr-2">🎾</span>
  Capturar
</Button>

<!-- CaptureOverlay integration -->
<CaptureOverlay
  :is-open="showCaptureOverlay"
  :phase="captureState.phase"
  :shakes="captureState.shakes"
  :success="captureState.success"
  :ball-type="selectedBallType"
  @ball-selected="handleBallSelected"
  @close="closeCaptureOverlay"
  @animation-complete="handleCaptureAnimationComplete"
  @proceed="handleCaptureProceed"
/>
```

---

## 5. pcBoxStore

**File**: `src/stores/pcBox.ts`

### Interface

```typescript
import type { CapturedPokemon } from '@/models/capture'

export interface PCBoxStore {
  // State
  pokemonList: CapturedPokemon[]
  
  // Getters
  getPokemonCount: () => number
  
  // Actions
  initialize: () => void
  addPokemon: (pokemon: CapturedPokemon) => void
  removePokemon: (instanceId: string) => void
}
```

### Usage Example

```typescript
const pcBoxStore = usePCBoxStore()

// On app mount
pcBoxStore.initialize()

// After capture
if (teamStore.team.length >= 6) {
  pcBoxStore.addPokemon(capturedPokemon)
} else {
  teamStore.addPokemon(capturedPokemon)
}
```

---

## 6. encounterWhitelist

**File**: `src/data/encounterWhitelist.ts`

### Interface

```typescript
/** Array of valid PokéAPI Pokémon IDs for wild encounters */
export const ENCOUNTER_WHITELIST: readonly number[]

/** Type for whitelist Pokemon IDs */
export type EncounterPokemonId = typeof ENCOUNTER_WHITELIST[number]

/** Get random ID from whitelist */
export function getRandomEncounterId(): number
```

### Usage Example

```typescript
import { getRandomEncounterId, ENCOUNTER_WHITELIST } from '@/data/encounterWhitelist'

// Generate encounter
const pokemonId = getRandomEncounterId()

// Validate ID
if (ENCOUNTER_WHITELIST.includes(someId)) {
  // Valid encounter Pokemon
}
```

---

## Integration Flow

```
┌─────────────┐    clicks     ┌────────────┐    shows    ┌─────────────┐
│  HomeView   │ ─────────────►│ Buscar.vue │ ──────────►│ Capturar.vue│
└─────────────┘  "Explorar"   └────────────┘  animation  └──────┬──────┘
                                                                │
                              ┌─────────────────────────────────┘
                              │ clicks "¡Batalla!"
                              ▼
┌─────────────┐    capture    ┌────────────┐    ball     ┌─────────────┐
│ BattleView  │ ◄────────────│ CaptureOver│◄────────────│inventarioball│
│ (wild mode) │   overlay     │   lay.vue  │  selection  │    .vue     │
└──────┬──────┘               └─────┬──────┘             └─────────────┘
       │                            │
       │ success                    │ shakes animation
       ▼                            │
┌─────────────┐               ┌─────┴──────┐
│FinalCaptura │               │  pcBoxStore │
│    .vue     │               │  or teamStore│
└─────────────┘               └─────────────┘
```
