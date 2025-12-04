# Data Model: Wild Encounter & Capture Module

**Feature**: 007-wild-encounter-capture  
**Date**: 2025-12-04

## Entities

### 1. EncounterWhitelist (Static Data)

**Purpose**: Define the pool of ~50 Pokémon available for wild encounters.

**Location**: `src/data/encounterWhitelist.ts`

```typescript
/**
 * Encounter Whitelist - IDs of Pokémon available for wild encounters
 * Expanded from original 6 (3 Kanto + 3 Johto starters) to 50 base-stage Pokémon
 * Data source: Spec 007 Safari Whitelist table (catch rates from PokéAPI)
 */
export const ENCOUNTER_WHITELIST: readonly number[] = [
  1, 4, 7,       // Kanto starters (Bulbasaur, Charmander, Squirtle)
  10, 13, 16, 19, 21, 23, 25, 27, 29, 32, 35, 37, 39, 41, 43, 46, 48, 50,
  52, 54, 56, 58, 60, 63, 66, 69, 72, 74, 77, 79, 81, 84, 86, 88, 90, 92,
  96, 98, 100, 102, 104, 109, 111, 116, 118, 120, 129
] as const

export type EncounterPokemonId = typeof ENCOUNTER_WHITELIST[number]

/**
 * Get random Pokémon ID from whitelist
 */
export function getRandomEncounterId(): number {
  const index = Math.floor(Math.random() * ENCOUNTER_WHITELIST.length)
  return ENCOUNTER_WHITELIST[index] ?? 25 // Fallback to Pikachu
}
```

---

### 2. CapturedPokemon (Entity)

**Purpose**: Represents a Pokémon that has been captured, extending PokéAPI data with capture metadata.

**Location**: `src/models/capture.ts`

```typescript
import type { Pokemon } from '@/models/teamBuilder'

/**
 * A Pokémon that has been captured, with additional metadata
 */
export interface CapturedPokemon {
  /** Unique instance ID (UUID) for this captured instance */
  instanceId: string
  
  /** PokéAPI Pokémon data */
  pokemon: Pokemon
  
  /** Level at time of capture */
  captureLevel: number
  
  /** ISO 8601 timestamp of capture */
  capturedAt: string
  
  /** Ball type used for capture */
  ballType: 'pokeball' | 'superball' | 'ultraball' | 'masterball'
}

/**
 * Generate unique instance ID for captured Pokémon
 */
export function generateInstanceId(): string {
  return crypto.randomUUID()
}
```

---

### 3. PCBoxState (Store)

**Purpose**: Manage overflow storage for captured Pokémon when team is full.

**Location**: `src/stores/pcBox.ts`

```typescript
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { CapturedPokemon } from '@/models/capture'

const STORAGE_KEY = 'pcbox-pokemon'

export const usePCBoxStore = defineStore('pcBox', () => {
  // State
  const pokemonList = ref<CapturedPokemon[]>([])
  
  // Initialize from localStorage
  function initialize() {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        pokemonList.value = JSON.parse(stored)
      } catch {
        pokemonList.value = []
      }
    }
  }
  
  // Persist to localStorage on changes
  watch(pokemonList, (newList) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newList))
  }, { deep: true })
  
  // Actions
  function addPokemon(pokemon: CapturedPokemon) {
    pokemonList.value.push(pokemon)
  }
  
  function removePokemon(instanceId: string) {
    const index = pokemonList.value.findIndex(p => p.instanceId === instanceId)
    if (index !== -1) {
      pokemonList.value.splice(index, 1)
    }
  }
  
  function getPokemonCount(): number {
    return pokemonList.value.length
  }
  
  return {
    pokemonList,
    initialize,
    addPokemon,
    removePokemon,
    getPokemonCount
  }
})
```

---

### 4. CaptureState (Composable State)

**Purpose**: Track current capture attempt state for UI.

**Location**: `src/composables/useCapture.ts` (state portion)

```typescript
export interface CaptureState {
  /** Current capture phase */
  phase: 'idle' | 'selecting-ball' | 'throwing' | 'shaking' | 'result'
  
  /** Number of shakes (0-3) from captureEngine */
  shakes: number
  
  /** Whether capture succeeded */
  success: boolean
  
  /** Error message if any */
  error: string | null
  
  /** Wild Pokémon being captured (from battle state) */
  targetPokemon: WildBattlePokemon | null
}

export interface WildBattlePokemon {
  id: number
  name: string
  currentHp: number
  maxHp: number
  baseCatchRate: number
  sprite: string
  types: string[]
  level: number
}
```

---

### 5. BattleState Extension

**Purpose**: Extend existing battle state to track wild battle mode.

**Location**: `src/stores/battle.ts` (modification)

```typescript
// Add to existing BattleState interface
interface BattleStateExtension {
  /** True if this is a wild encounter (enables capture button) */
  isWildBattle: boolean
  
  /** Wild Pokémon data for capture calculations */
  wildPokemonData: {
    baseCatchRate: number
  } | null
}
```

---

## Entity Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                        Wild Encounter Flow                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  EncounterWhitelist ──► getRandomEncounterId()                  │
│          │                      │                                │
│          │                      ▼                                │
│          │              PokéAPI fetch (pokemonService.ts)        │
│          │                      │                                │
│          │                      ▼                                │
│          │              BattleStore.isWildBattle = true          │
│          │                      │                                │
│          │                      ▼                                │
│          │              BattleView (with Capturar button)        │
│          │                      │                                │
│          │                      ▼                                │
│          │              useCapture.attemptCapture()              │
│          │                      │                                │
│          │                      ▼                                │
│          │              captureEngine.attemptCapture()           │
│          │                      │                                │
│          │           ┌─────────┴─────────┐                       │
│          │           ▼                   ▼                       │
│          │      Success              Failure                     │
│          │           │                   │                       │
│          │           ▼                   ▼                       │
│          │    teamStore.add()    Continue battle                 │
│          │    OR pcBoxStore.add()                                │
│          │           │                                           │
│          │           ▼                                           │
│          │    CapturedPokemon                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Validation Rules

| Entity | Field | Rule |
|--------|-------|------|
| EncounterWhitelist | IDs | Must be valid PokéAPI Pokémon IDs (1-151 for Gen 1) |
| CapturedPokemon | instanceId | Must be valid UUID |
| CapturedPokemon | captureLevel | Must be >= 1 |
| CapturedPokemon | ballType | Must be one of: pokeball, superball, ultraball, masterball |
| CaptureState | shakes | Must be 0-3 |
| PCBoxState | pokemonList | Must serialize to valid JSON for localStorage |

---

## State Transitions

### CaptureState Phase Transitions

```
idle ──► selecting-ball (user clicks "Capturar")
     │
     ▼
selecting-ball ──► throwing (user selects ball)
              │
              └──► idle (user cancels)
     │
     ▼
throwing ──► shaking (ball animation starts)
     │
     ▼
shaking ──► result (animation completes)
     │
     ▼
result ──► idle (success: battle ends)
       │
       └──► idle (failure: battle continues)
```
