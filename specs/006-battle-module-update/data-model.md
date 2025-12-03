# Data Model: Battle Module Update

**Feature**: 006-battle-module-update  
**Date**: 2025-12-03  
**Status**: Complete

## Entities Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Battle Module Entities                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │
│  │ ProgressState│◄───│ BattleContext│───►│ BattleOutcome│              │
│  └──────┬───────┘    └──────┬───────┘    └──────────────┘              │
│         │                   │                                           │
│         │            ┌──────┴───────┐                                   │
│         │            │              │                                   │
│         ▼            ▼              ▼                                   │
│  ┌──────────────┐  ┌──────────┐  ┌──────────┐                          │
│  │ThematicNpc   │  │PlayerTeam│  │ Opponent │                          │
│  └──────┬───────┘  └──────────┘  └──────────┘                          │
│         │                                                               │
│         ▼                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │ GymLeader    │  │MoveLearning  │  │ DefeatModal  │                  │
│  │  (existing)  │  │    State     │  │    State     │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Entity Definitions

### ProgressState (NEW)

Persistent progression data synchronized to LocalStorage.

```typescript
// src/models/progressState.ts

export interface ProgressState {
  /** IDs of defeated Thematic NPCs */
  defeatedTrainers: string[]
  
  /** IDs of defeated Gym Leaders (badges earned) */
  earnedBadges: number[]
  
  /** Current gym index (1-5), indicates which gym is currently accessible */
  currentGym: number
  
  /** Unix timestamp of last save */
  timestamp: number
}

/** Default state for new games */
export const DEFAULT_PROGRESS: ProgressState = {
  defeatedTrainers: [],
  earnedBadges: [],
  currentGym: 1,
  timestamp: Date.now()
}

/** LocalStorage key */
export const PROGRESS_STORAGE_KEY = 'pkmn-progress'
```

**Validation rules**:
- `currentGym` must be 1-5 inclusive
- `earnedBadges` must contain only valid GymLeader IDs (1-5)
- `defeatedTrainers` IDs must match ThematicNpc IDs

**State transitions**:
- NPC defeated → Add to `defeatedTrainers`
- All gym NPCs defeated → Gym Leader becomes challengeable (no state change)
- Gym Leader defeated → Add to `earnedBadges`, increment `currentGym`
- Game reset → Restore `DEFAULT_PROGRESS`

---

### ThematicNpc (NEW)

Trainers that must be defeated before challenging a Gym Leader.

```typescript
// src/data/thematicNpcs.ts

import type { Pokemon } from '@/domain/battle/engine/entities'

export interface ThematicNpc {
  /** Unique identifier (e.g., "npc-jose-1") */
  id: string
  
  /** Display name */
  name: string
  
  /** Associated Gym Leader ID (1-5) */
  gymId: number
  
  /** Order within gym's NPC sequence (1-based) */
  order: number
  
  /** Battle team */
  team: Pokemon[]
  
  /** Pre-battle quote */
  quote: string
  
  /** Trainer sprite URL */
  spriteUrl?: string
}

/** Helper to get NPCs for a specific gym */
export function getNpcsByGym(gymId: number): ThematicNpc[]

/** Helper to check if all NPCs for a gym are defeated */
export function areGymNpcsDefeated(gymId: number, defeatedIds: string[]): boolean
```

**Relationship**:
- `gymId` references `GymLeader.id` (1-5)
- ~3-5 NPCs per gym, ordered by `order` field

---

### BattleContext (EXTENDED)

Extended battle initialization context.

```typescript
// src/models/battleContext.ts

import type { Pokemon } from '@/domain/battle/engine/entities'

export type OpponentType = 'thematic-npc' | 'gym-leader' | 'wild'

export interface BattleContext {
  /** Type of battle for outcome handling */
  opponentType: OpponentType
  
  /** Opponent identifier for progress tracking */
  opponentId: string | number
  
  /** Opponent display name */
  opponentName: string
  
  /** Original opponent level (for player scaling) */
  opponentBaseLevel: number
  
  /** Opponent team (cloned for battle) */
  opponentTeam: Pokemon[]
  
  /** Player team (cloned and level-scaled for battle) */
  playerTeam: Pokemon[]
  
  /** Calculated player level: opponentBaseLevel - 2, min 1 */
  scaledPlayerLevel: number
}

/** Calculate scaled player level */
export function calculateScaledLevel(opponentLevel: number): number {
  return Math.max(1, opponentLevel - 2)
}

/** Calculate team average level */
export function calculateTeamAverage(team: Pokemon[]): number {
  if (team.length === 0) return 5 // Fallback
  return Math.round(team.reduce((sum, p) => sum + p.level, 0) / team.length)
}
```

---

### BattleOutcome (NEW)

Result of a completed battle with outcome-specific data.

```typescript
// src/models/battleOutcome.ts

export type BattleResult = 'victory' | 'defeat'

export interface BattleOutcome {
  /** Win or loss */
  result: BattleResult
  
  /** Context from battle start */
  opponentType: OpponentType
  opponentId: string | number
  opponentName: string
  
  /** For victory: Pokémon eligible to learn new moves */
  eligibleMoveLearners?: MoveLearningCandidate[]
  
  /** Battle duration in turns */
  turnCount: number
}

export interface MoveLearningCandidate {
  /** Pokémon identifier */
  pokemonId: string
  
  /** Pokémon name for display */
  pokemonName: string
  
  /** New move that can be learned */
  newMove: Move
  
  /** Current moves (max 4) */
  currentMoves: Move[]
}
```

---

### MoveLearningState (NEW)

UI state for the Move Learning modal.

```typescript
// src/models/moveLearning.ts

import type { Move } from '@/domain/battle/engine/entities'

export interface MoveLearningState {
  /** Modal open state */
  isOpen: boolean
  
  /** Queue of Pokémon with moves to learn */
  candidates: MoveLearningCandidate[]
  
  /** Current candidate index */
  currentIndex: number
  
  /** Selected move index to replace (0-3) or null for don't learn */
  selectedReplaceIndex: number | null
}

export const DEFAULT_MOVE_LEARNING_STATE: MoveLearningState = {
  isOpen: false,
  candidates: [],
  currentIndex: 0,
  selectedReplaceIndex: null
}
```

---

### DefeatModalState (NEW)

UI state for the Defeat modal.

```typescript
// src/models/defeatModal.ts

export interface DefeatModalState {
  /** Modal open state */
  isOpen: boolean
  
  /** Opponent who defeated the player */
  opponentName: string
  
  /** Custom defeat message based on opponent type */
  defeatMessage: string
  
  /** Callback on modal close */
  onClose: () => void
}

export const DEFAULT_DEFEAT_MODAL_STATE: DefeatModalState = {
  isOpen: false,
  opponentName: '',
  defeatMessage: '',
  onClose: () => {}
}

/** Generate defeat message by opponent type */
export function getDefeatMessage(opponentType: OpponentType, opponentName: string): string {
  switch (opponentType) {
    case 'gym-leader':
      return `${opponentName} ha demostrado su fuerza. ¡Entrena más y vuelve a intentarlo!`
    case 'thematic-npc':
      return `Has perdido contra ${opponentName}. Recupera tus fuerzas e inténtalo de nuevo.`
    case 'wild':
      return `El Pokémon salvaje fue demasiado fuerte. Tu equipo necesita descanso.`
    default:
      return `Has sido derrotado. ¡No te rindas!`
  }
}
```

---

### WildPokemonPool (NEW)

Configuration for wild encounter spawning.

```typescript
// src/data/wildPokemonPool.ts

export interface WildPokemonEntry {
  /** PokeAPI Pokémon ID */
  pokemonId: number
  
  /** Display name */
  name: string
  
  /** Types for display */
  types: string[]
  
  /** Spawn weight (higher = more common) */
  weight: number
}

export const WILD_POKEMON_POOL: WildPokemonEntry[] = [
  // Common Normal types
  { pokemonId: 19, name: 'Rattata', types: ['Normal'], weight: 10 },
  { pokemonId: 16, name: 'Pidgey', types: ['Normal', 'Flying'], weight: 10 },
  { pokemonId: 52, name: 'Meowth', types: ['Normal'], weight: 5 },
  
  // Common Bug types
  { pokemonId: 10, name: 'Caterpie', types: ['Bug'], weight: 8 },
  { pokemonId: 13, name: 'Weedle', types: ['Bug', 'Poison'], weight: 8 },
  
  // Grass types
  { pokemonId: 43, name: 'Oddish', types: ['Grass', 'Poison'], weight: 5 },
  { pokemonId: 69, name: 'Bellsprout', types: ['Grass', 'Poison'], weight: 5 },
  
  // Water types
  { pokemonId: 54, name: 'Psyduck', types: ['Water'], weight: 5 },
  { pokemonId: 60, name: 'Poliwag', types: ['Water'], weight: 5 },
  { pokemonId: 129, name: 'Magikarp', types: ['Water'], weight: 8 },
  
  // Electric types
  { pokemonId: 25, name: 'Pikachu', types: ['Electric'], weight: 2 },
  { pokemonId: 81, name: 'Magnemite', types: ['Electric', 'Steel'], weight: 3 },
  
  // Rock/Ground types
  { pokemonId: 74, name: 'Geodude', types: ['Rock', 'Ground'], weight: 5 },
  { pokemonId: 27, name: 'Sandshrew', types: ['Ground'], weight: 5 },
  
  // Fighting types
  { pokemonId: 66, name: 'Machop', types: ['Fighting'], weight: 4 },
  
  // Psychic types
  { pokemonId: 63, name: 'Abra', types: ['Psychic'], weight: 3 },
  
  // Ghost types
  { pokemonId: 92, name: 'Gastly', types: ['Ghost', 'Poison'], weight: 3 },
  
  // Fire types
  { pokemonId: 37, name: 'Vulpix', types: ['Fire'], weight: 3 },
  { pokemonId: 58, name: 'Growlithe', types: ['Fire'], weight: 3 },
]

/** Select random wild Pokémon based on weights */
export function selectWildPokemon(): WildPokemonEntry {
  const totalWeight = WILD_POKEMON_POOL.reduce((sum, p) => sum + p.weight, 0)
  let random = Math.random() * totalWeight
  
  for (const entry of WILD_POKEMON_POOL) {
    random -= entry.weight
    if (random <= 0) return entry
  }
  
  return WILD_POKEMON_POOL[0]! // Fallback
}
```

---

## Existing Entities (Reference)

### GymLeader (existing - src/data/gymLeaders.ts)

```typescript
export interface GymLeader {
  id: number              // 1-5 for Cali gyms
  name: string            // José, Manuel, Rafael, Sofía, Valeria
  city: string            // "Cali"
  location: string        // Landmark
  badge: string           // Badge name
  type: string            // Primary type
  secondaryType?: string  // Secondary type
  team: { pokemon: string; pokemonId: number; level: number }[]
  signaturePokemon: string
  // ... other display fields
}
```

### Pokemon (existing - src/domain/battle/engine/entities.ts)

```typescript
export interface Pokemon {
  id: string
  name: string
  types: Type[]
  level: number
  stats: Stats
  currentHp: number
  moves: Move[]
}
```

### Move (existing - src/domain/battle/engine/entities.ts)

```typescript
export interface Move {
  id: string
  name: string
  type: Type
  power: number
  accuracy: number
  category: 'physical' | 'special' | 'status'
  effect?: MoveEffect
}
```

---

## Entity Relationships

| Entity | Relates To | Cardinality | Description |
|--------|------------|-------------|-------------|
| ProgressState | ThematicNpc | 1:N | Tracks defeated NPCs |
| ProgressState | GymLeader | 1:N | Tracks earned badges |
| ThematicNpc | GymLeader | N:1 | NPCs belong to a gym |
| BattleContext | Pokemon | 1:N | Contains player & opponent teams |
| BattleOutcome | MoveLearningCandidate | 1:N | Victory may have learnable moves |
| WildPokemonPool | Pokemon | 1:1 | Entry maps to PokeAPI Pokémon |

---

## State Flow Diagram

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Lobby     │───►│   Battle    │───►│  Outcome    │
│  (HomeView) │    │ (BattleView)│    │  Handler    │
└─────────────┘    └─────────────┘    └──────┬──────┘
       ▲                                     │
       │           ┌─────────────────────────┼─────────────────────────┐
       │           │                         ▼                         │
       │           │  ┌──────────────┐  ┌──────────────┐               │
       │           │  │   Victory    │  │   Defeat     │               │
       │           │  └──────┬───────┘  └──────┬───────┘               │
       │           │         │                 │                       │
       │           │         ▼                 ▼                       │
       │           │  ┌──────────────┐  ┌──────────────┐               │
       │           │  │ Move Learn?  │  │DefeatModal   │               │
       │           │  └──────┬───────┘  └──────┬───────┘               │
       │           │         │                 │                       │
       │           │    Yes  │  No             │                       │
       │           │    ┌────┴────┐            │                       │
       │           │    ▼         │            │                       │
       │           │ ┌──────────┐ │            │                       │
       │           │ │MoveLearning│            │                       │
       │           │ │  Modal   │ │            │                       │
       │           │ └────┬─────┘ │            │                       │
       │           │      │       │            │                       │
       │           └──────┼───────┼────────────┼───────────────────────┘
       │                  ▼       ▼            ▼
       │           ┌─────────────────────────────┐
       │           │     Update Progress         │
       │           │   + Full Team Heal          │
       │           └──────────────┬──────────────┘
       │                          │
       └──────────────────────────┘
```
