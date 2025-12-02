# Data Model: Modern BattleScreen UI with Animated Sprites and Enhanced UX

**Feature**: 004-modern-battle-ui  
**Created**: November 30, 2025  
**Phase**: 1 - Data & Entity Design

## Purpose

This document defines the TypeScript interfaces, types, and data structures for implementing animated sprites, neumorphic UI state, attack animations, and sprite loading with fallbacks.

## Core Entities

### 1. Sprite Loader State

**Entity**: `SpriteLoaderState`  
**Purpose**: Tracks the loading state, error handling, and URL resolution for Pokemon sprites from PokemonShowdown API

**Attributes**:
- `pokemonName: string` - Pokemon name to load sprite for (e.g., "Pikachu", "Charizard")
- `view: 'front' | 'back'` - Sprite orientation (front for enemy, back for player)
- `spriteUrl: string` - Resolved sprite URL after fallback hierarchy
- `isLoading: boolean` - True while attempting to load sprite
- `error: Error | null` - Captured error if all fallback tiers fail
- `tier: 'animated' | 'static' | 'legacy' | 'placeholder'` - Which fallback tier succeeded

**Relationships**:
- Used by `BattleScreen.vue` for both player and enemy Pokemon sprites
- Managed by `useSpriteLoader` composable

**Validation Rules**:
- `pokemonName` must be non-empty string
- `view` must be exactly 'front' or 'back'
- `spriteUrl` must be valid HTTP/HTTPS URL or data URI
- `tier` progresses through hierarchy: animated → static → legacy → placeholder

**State Transitions**:
```
initial → loading → success(animated/static/legacy) → display
       ↘         → error → fallback(next tier) → loading
                         → error(all tiers failed) → placeholder
```

---

### 2. Attack Animation State

**Entity**: `AttackAnimationState`  
**Purpose**: Controls the multi-step attack animation sequence (charge, hold, return) and synchronizes with battle actions

**Attributes**:
- `isActive: boolean` - True during entire attack sequence (disables attack buttons)
- `target: 'player' | 'enemy'` - Which Pokemon is being attacked
- `phase: 'idle' | 'charging' | 'impact' | 'returning'` - Current animation phase
- `startTime: number` - Timestamp when animation started (for timing calculations)
- `moveType: string` - Type of move for colored effects (e.g., "fire", "water", "electric")

**Relationships**:
- Consumed by `BattleScreen.vue` template for CSS class bindings
- Triggered by move selection in `handleMoveSelected()`
- Coordinates with `battleStore.selectPlayerMove()` async action

**Validation Rules**:
- `target` must be 'player' or 'enemy'
- `phase` transitions must follow sequence: idle → charging → impact → returning → idle
- `startTime` must be valid Unix timestamp
- `moveType` must match Pokemon type system (validated against existing `types.ts`)

**Timing Constraints** (from research.md):
- Charging phase: 300ms
- Impact phase: 100ms (hold at peak)
- Returning phase: 200ms
- Total duration: 600ms

**State Lifecycle**:
```typescript
// Initial state
{ isActive: false, target: 'player', phase: 'idle', startTime: 0, moveType: 'normal' }

// User clicks attack button
→ { isActive: true, target: 'enemy', phase: 'charging', startTime: Date.now(), moveType: 'fire' }

// After 300ms
→ { isActive: true, target: 'enemy', phase: 'impact', startTime: [same], moveType: 'fire' }

// After 400ms (300 + 100)
→ { isActive: true, target: 'enemy', phase: 'returning', startTime: [same], moveType: 'fire' }

// After 600ms (300 + 100 + 200)
→ { isActive: false, target: 'enemy', phase: 'idle', startTime: 0, moveType: 'normal' }
```

---

### 3. Damage Effect State

**Entity**: `DamageEffectState`  
**Purpose**: Visual feedback when Pokemon takes damage (screen shake, red flash, sprite wobble)

**Attributes**:
- `active: boolean` - True during damage effect animation
- `target: 'player' | 'enemy'` - Which Pokemon received damage
- `damageAmount: number` - Optional: amount of HP lost (for scaling effect intensity)

**Relationships**:
- Triggered by battle log watcher when damage message detected
- Displayed simultaneously with HP bar animation
- Independent of attack animation state

**Validation Rules**:
- `target` must be 'player' or 'enemy'
- `damageAmount` must be non-negative integer if provided
- Duration fixed at 300ms (defined in CSS keyframe)

**Timing**:
- Duration: 300ms
- Triggers: On "recibió daño" log message
- Concurrent with: HP bar width transition (500ms)

---

### 4. Battle UI View State

**Entity**: `BattleViewState`  
**Purpose**: Tracks which UI panel is currently displayed in control area

**Attributes**:
- `currentView: ViewMode` - Active view mode
  - `'main'` - Main action buttons (Fight, Bag, Pokemon, Run)
  - `'fight'` - Move selector panel
  - `'bag'` - Item bag panel
  - `'pokemon'` - Team switching panel
  - `'trainer-waiting'` - NPC selecting Pokemon
  - `'player-team-switch'` - Forced switch after faint
  - `'enemy-team-switch'` - Enemy trainer switching

**Relationships**:
- Controls which child component renders in `<template>`
- Modified by action button handlers (`handleFight`, `handleBag`, etc.)
- Affects attack button availability (fight view shows moves, main view shows actions)

**Validation Rules**:
- Must be one of the defined view modes (union type enforced)
- Cannot switch to fight view while attack animation active
- Returns to 'main' after move selected or back button pressed

**State Transitions**:
```
main → fight → main (move selected or back pressed)
main → bag → main (item used or back pressed)
main → pokemon → main (switch complete or back pressed)
main → player-team-switch → main (forced switch after player faint)
main → enemy-team-switch → main (enemy trainer switches)
```

---

### 5. Sprite URL Configuration

**Entity**: `SpriteUrlConfig`  
**Purpose**: Configuration for building PokemonShowdown sprite URLs with normalization rules

**Attributes**:
- `baseUrl: string` - PokemonShowdown base domain: "https://play.pokemonshowdown.com/sprites"
- `animatedPath: string` - Path for animated sprites: "ani" (front) or "ani-back" (back)
- `staticPath: string` - Path for static fallback: "dex"
- `extension: 'gif' | 'png'` - File extension based on sprite type

**Relationships**:
- Used by `buildPokemonShowdownUrl()` utility function
- Consumed by `useSpriteLoader` composable

**Normalization Rules** (applied to Pokemon names):
1. Convert to lowercase: "Pikachu" → "pikachu"
2. Replace spaces with hyphens: "Mr. Mime" → "mr-mime"
3. Remove apostrophes: "Farfetch'd" → "farfetchd"
4. Remove colons: "Type: Null" → "type null" → "typenull"
5. Handle gender suffixes: "Nidoran♀" → "nidoran-f", "Nidoran♂" → "nidoran-m"

**Example URLs**:
```typescript
// Animated back sprite (player)
"https://play.pokemonshowdown.com/sprites/ani-back/pikachu.gif"

// Animated front sprite (enemy)
"https://play.pokemonshowdown.com/sprites/ani/charizard.gif"

// Static fallback
"https://play.pokemonshowdown.com/sprites/dex/gengar.png"
```

---

### 6. Animation Timing Constants

**Entity**: `AnimationTimings`  
**Purpose**: Single source of truth for all animation durations and easing functions

**Attributes**:
- `ATTACK_CHARGE_MS: 300` - Duration of charge forward animation
- `ATTACK_HOLD_MS: 100` - Duration of impact hold
- `ATTACK_RETURN_MS: 200` - Duration of return to original position
- `ATTACK_TOTAL_MS: 600` - Total attack sequence duration (sum of above)
- `DAMAGE_EFFECT_MS: 300` - Duration of damage flash/shake
- `HP_BAR_TRANSITION_MS: 500` - HP bar width animation duration
- `VIEW_TRANSITION_MS: 200` - Panel fade in/out duration
- `SPRITE_LOAD_TIMEOUT_MS: 3000` - Max time to wait for sprite load
- `EASING_ATTACK: string` - CSS easing for attack: "cubic-bezier(0.4, 0, 0.2, 1)"
- `EASING_HP_BAR: string` - CSS easing for HP bar: "cubic-bezier(0.4, 0, 0.2, 1)"

**Relationships**:
- Imported by `BattleScreen.vue`, `useSpriteLoader.ts`, CSS modules
- Referenced in CSS `@keyframes` definitions
- Used in `setTimeout()` calls for state transitions

**Validation Rules**:
- All `_MS` values must be positive integers
- `ATTACK_TOTAL_MS` must equal sum of charge + hold + return
- Easing strings must be valid CSS timing functions

**Usage Example**:
```typescript
import { ANIMATION_TIMINGS } from '@/constants/animations'

setTimeout(() => {
  isAttacking.value = false
}, ANIMATION_TIMINGS.ATTACK_TOTAL_MS)
```

---

## TypeScript Interfaces

### Sprite Loader

```typescript
/**
 * Options for sprite loader composable
 */
export interface SpriteLoaderOptions {
  /** Pokemon name (will be normalized for URL) */
  pokemonName: string
  /** Sprite orientation */
  view: 'front' | 'back'
  /** Timeout in milliseconds (default: 3000) */
  timeout?: number
}

/**
 * Sprite loader result
 */
export interface SpriteLoaderResult {
  /** Resolved sprite URL (reactive) */
  spriteUrl: Ref<string>
  /** Loading state (reactive) */
  isLoading: Ref<boolean>
  /** Error if all fallbacks failed (reactive) */
  error: Ref<Error | null>
  /** Which fallback tier succeeded (reactive) */
  tier: Ref<'animated' | 'static' | 'legacy' | 'placeholder'>
  /** Retry loading function */
  retry: () => void
}

/**
 * Sprite URL builder result
 */
export interface SpriteUrlResult {
  /** Full sprite URL */
  url: string
  /** Normalized Pokemon name used in URL */
  normalizedName: string
}
```

### Animation State

```typescript
/**
 * Attack animation state
 */
export interface AttackAnimationState {
  /** Animation active (disables buttons) */
  isActive: boolean
  /** Target Pokemon */
  target: 'player' | 'enemy'
  /** Current animation phase */
  phase: 'idle' | 'charging' | 'impact' | 'returning'
  /** Animation start timestamp */
  startTime: number
  /** Move type for colored effects */
  moveType: string
}

/**
 * Damage effect state
 */
export interface DamageEffectState {
  /** Effect active */
  active: boolean
  /** Target Pokemon */
  target: 'player' | 'enemy'
  /** Optional: damage amount for scaling */
  damageAmount?: number
}

/**
 * Battle view modes
 */
export type BattleViewMode =
  | 'main'
  | 'fight'
  | 'bag'
  | 'pokemon'
  | 'trainer-waiting'
  | 'player-team-switch'
  | 'enemy-team-switch'
```

### Constants

```typescript
/**
 * Animation timing constants (single source of truth)
 */
export const ANIMATION_TIMINGS = {
  ATTACK_CHARGE_MS: 300,
  ATTACK_HOLD_MS: 100,
  ATTACK_RETURN_MS: 200,
  get ATTACK_TOTAL_MS() {
    return this.ATTACK_CHARGE_MS + this.ATTACK_HOLD_MS + this.ATTACK_RETURN_MS
  },
  DAMAGE_EFFECT_MS: 300,
  HP_BAR_TRANSITION_MS: 500,
  VIEW_TRANSITION_MS: 200,
  SPRITE_LOAD_TIMEOUT_MS: 3000,
  EASING_ATTACK: 'cubic-bezier(0.4, 0, 0.2, 1)',
  EASING_HP_BAR: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const

/**
 * Sprite URL configuration
 */
export const SPRITE_CONFIG = {
  BASE_URL: 'https://play.pokemonshowdown.com/sprites',
  ANIMATED_FRONT_PATH: 'ani',
  ANIMATED_BACK_PATH: 'ani-back',
  STATIC_PATH: 'dex',
  ANIMATED_EXTENSION: 'gif',
  STATIC_EXTENSION: 'png',
  PLACEHOLDER_URL: '/sprites/placeholder-pokemon.png',
} as const
```

---

## Data Flow Diagrams

### Sprite Loading Flow

```
User starts battle
  ↓
BattleScreen.vue initializes
  ↓
useSpriteLoader(playerPokemon.name, 'back') → Composable starts
  ↓
Try: Animated sprite URL (PokemonShowdown ani-back)
  ├→ Success: spriteUrl.value = animated URL, tier = 'animated'
  └→ Timeout/404: Try static sprite URL (PokemonShowdown dex)
      ├→ Success: spriteUrl.value = static URL, tier = 'static'
      └→ Timeout/404: Try legacy sprite (existing sprite map)
          ├→ Success: spriteUrl.value = legacy URL, tier = 'legacy'
          └→ Fail: spriteUrl.value = placeholder, tier = 'placeholder', error = Error
  ↓
Template binds :src="spriteUrl"
  ↓
Image renders in browser
```

### Attack Animation Flow

```
User clicks attack button
  ↓
handleMoveSelected(moveId) called
  ↓
Set attackState.isActive = true (disables all move buttons)
Set attackState.phase = 'charging'
  ↓
CSS animation triggered via class binding
  ├→ 0-300ms: Sprite translates toward target (charge)
  ├→ 300-400ms: Sprite holds at peak (impact)
  └→ 400-600ms: Sprite returns to origin
  ↓
Parallel: await battleStore.selectPlayerMove(moveId)
  ├→ Battle engine calculates damage
  ├→ Applies damage to target HP
  └→ Adds log message
  ↓
Log watcher detects damage message
  ↓
Triggers damageEffect.active = true on target
  ├→ Damage effect animation plays (300ms)
  └→ HP bar animates width change (500ms)
  ↓
After 600ms: setTimeout completes
  ↓
Set attackState.isActive = false (re-enables buttons)
Set attackState.phase = 'idle'
  ↓
User can select next move
```

---

## Validation & Constraints

### Input Validation

**Pokemon Name Normalization** (`spriteNormalizer.ts`):
```typescript
function normalizePokemonName(name: string): string {
  // Input validation
  if (!name || typeof name !== 'string') {
    throw new TypeError('Pokemon name must be non-empty string')
  }
  
  // Normalization pipeline
  return name
    .toLowerCase()
    .replace(/'/g, '') // Remove apostrophes
    .replace(/:/g, '') // Remove colons
    .replace(/[♀]/g, '-f') // Female symbol
    .replace(/[♂]/g, '-m') // Male symbol
    .replace(/\s+/g, '-') // Spaces to hyphens
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .replace(/^-|-$/g, '') // Trim leading/trailing hyphens
}
```

**Attack State Validation**:
```typescript
function validateAttackState(state: AttackAnimationState): boolean {
  // Phase must follow sequence
  const validPhases = ['idle', 'charging', 'impact', 'returning']
  if (!validPhases.includes(state.phase)) {
    console.error(`Invalid attack phase: ${state.phase}`)
    return false
  }
  
  // Target must be player or enemy
  if (state.target !== 'player' && state.target !== 'enemy') {
    console.error(`Invalid attack target: ${state.target}`)
    return false
  }
  
  // Active attacks must have valid start time
  if (state.isActive && state.startTime === 0) {
    console.error('Active attack missing start time')
    return false
  }
  
  return true
}
```

### Performance Constraints

**Animation Frame Budget**:
- Each animation frame must complete in <16ms for 60fps
- Use CSS transforms (GPU-accelerated) not position properties
- Avoid layout thrashing (batch DOM reads/writes)

**Sprite Loading Budget**:
- Primary load attempt: 3000ms timeout
- Fallback attempts: 2000ms timeout each
- Total max loading time: 7000ms (3 tiers)
- Memory: Max 2MB per sprite (animated GIFs)

**State Update Budget**:
- Attack state toggle: <5ms
- HP bar calculation: <5ms
- View mode transition: <10ms

---

## Migration Notes

### Changes to Existing Code

**BattleScreen.vue**:
- Replace `getPokemonBackSpriteUrl()` calls with `useSpriteLoader()` composable
- Add `attackState` reactive ref replacing existing `attackEffect`
- Update `damageEffect` to use new `DamageEffectState` interface
- Import `ANIMATION_TIMINGS` constant for setTimeout durations

**pokemonSpriteMap.ts**:
- Keep existing functions as fallback tier (legacy sprites)
- Add new `buildPokemonShowdownUrl()` function
- Export `normalizePokemonName()` utility

### New Files Required

- `src/composables/useSpriteLoader.ts` - Sprite loading composable
- `src/utils/spriteNormalizer.ts` - Name normalization utility
- `src/constants/animations.ts` - Timing constants
- `tests/unit/utils/spriteNormalizer.spec.ts` - Unit tests
- `tests/unit/composables/useSpriteLoader.spec.ts` - Unit tests

---

## Summary

All data entities, TypeScript interfaces, and validation rules are defined. Key entities:

1. **SpriteLoaderState** - Manages sprite loading with fallback hierarchy
2. **AttackAnimationState** - Controls multi-step attack animations
3. **DamageEffectState** - Visual feedback for damage
4. **BattleViewState** - UI panel navigation
5. **SpriteUrlConfig** - PokemonShowdown URL building
6. **AnimationTimings** - Centralized timing constants

All entities align with existing battle/team store infrastructure. No breaking changes to public APIs. Ready for Phase 1 contracts generation.
