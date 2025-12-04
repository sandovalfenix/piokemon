# Lobby UI & Battle Flow Refactor - Implementation Summary

**Date**: 2025-12-03  
**Feature**: 006-battle-module-update  
**Status**: ✅ Implemented

---

## Changes Summary

### 1. Lobby UI Simplification (`src/views/HomeView.vue`)
- **REPLACED** entire file with simplified version
- Shows only:
  - Welcome text ("Pokémon MMO" + "¡Bienvenido, entrenador!")
  - "⚔️ Batalla" button - starts story progression
  - "🌿 Encuentro Salvaje" button - starts wild battle
- Added `hasStarter` flow guard with Shadcn Dialog modal
- Uses `router.replace('/')` for redirects (no back-button to battle)

### 2. hasStarter Flag (`src/stores/team.ts`)
- Added `hasStarter` ref with LocalStorage persistence
- Added `setHasStarter(value: boolean)` action
- Key: `pokemon-mmo-has-starter`
- Synced via `watch()` to LocalStorage

### 3. Starter Selection Guard (`src/views/StarterSelectionView.vue`)
- Added check for `teamStore.hasStarter` on mount
- If starter exists → redirect to home via `router.replace()`
- Calls `teamStore.setHasStarter(true)` on starter confirmation

### 4. SAMPLE_NPC Removal
- **REMOVED** import from `src/stores/battle.ts`
- **REPLACED** initial state with placeholder Pokemon
- **DEPRECATED** `startBattleWithCustomTeam()` - now shows warning
- All battles should use `battleInitService` + PokéAPI

### 5. PokéAPI Hydration Service (`src/services/pokeapi/pokemonHydrationService.ts`)
- **NEW FILE** - Fetches real Pokemon data from PokéAPI
- Features:
  - Memory + LocalStorage caching
  - Retry logic (3 attempts)
  - Move filtering: level-up only, excludes Status, picks 4 random
  - Stat calculation using Gen III+ formula
- Exports: `hydratePokemon()`, `hydrateTeam()`, `clearCache()`

### 6. Data Files Converted to ID-Only Format (`src/data/thematicNpcs.ts`)
- **REPLACED** entire file with ID-only format
- Teams now use `{ pokemonId, level }[]` instead of full Pokemon objects
- Added `getRandomUndefeatedNpc(defeatedIds)` helper
- Removed hardcoded stats/moves (hydrated from PokéAPI)

### 7. Battle Init Service (`src/services/battle/battleInitService.ts`)
- **REPLACED** entire file with async PokéAPI version
- All init functions are now `async`:
  - `initNpcBattle(npcId)` → `Promise<BattleInitResult>`
  - `initGymLeaderBattle(gymId)` → `Promise<BattleInitResult>`
  - `initWildBattle(playerTeam)` → `Promise<BattleInitResult>`
- Removed all hardcoded `getBaseStatsForPokemon()`, `getMovesForPokemon()` functions

### 8. BattleView Updates (`src/views/BattleView.vue`)
- Fixed imports to use new data sources
- Added `healPlayerTeam()` function
- Victory flow: progress update → heal → modal → redirect
- Defeat flow: modal → user closes → heal → redirect
- Uses `router.replace('/')` to prevent back-navigation

### 9. Type Definitions Added
- `src/data/trainers.ts` - `Trainer` interface
- `src/data/trainersData.ts` - `TrainerData` interface

### 10. BattleScreen Fixes (`src/components/BattleScreen.vue`)
- Added `waitingTrainer` ref definition
- Replaced `getRandomTrainer()` with inline trainer data from battle store

---

## Files Modified

| File | Action |
|------|--------|
| `src/views/HomeView.vue` | REPLACED |
| `src/stores/team.ts` | MODIFIED (hasStarter) |
| `src/views/StarterSelectionView.vue` | MODIFIED (guard) |
| `src/stores/battle.ts` | MODIFIED (removed SAMPLE_NPC) |
| `src/data/thematicNpcs.ts` | REPLACED (ID-only) |
| `src/services/battle/battleInitService.ts` | REPLACED (async/PokéAPI) |
| `src/views/BattleView.vue` | MODIFIED (imports, heal, redirect) |
| `src/components/BattleScreen.vue` | MODIFIED (waitingTrainer) |
| `src/composables/useTrainerBattle.ts` | MODIFIED (import fix) |

## Files Created

| File | Purpose |
|------|---------|
| `src/services/pokeapi/pokemonHydrationService.ts` | PokéAPI fetch + cache |
| `src/data/trainers.ts` | Trainer interface |
| `src/data/trainersData.ts` | TrainerData interface |

## Clarification Document
- `specs/006-battle-module-update/clarifications/lobby-flow-refactor.md` - All Q&A resolved

---

## Testing Checklist

- [ ] Fresh start: No starter → shows "Battle" → modal → redirect to /starter-selection
- [ ] With starter: "Battle" button → loads opponent from PokéAPI → battle starts
- [ ] With starter: "Wild Encounter" → random wild Pokemon → battle starts
- [ ] NPC battle: Progress updates on victory
- [ ] Gym Leader battle: Progress updates on victory
- [ ] Victory: Modal → Continue → auto-heal → redirect to /
- [ ] Defeat: Modal → Volver al Lobby → auto-heal → redirect to /
- [ ] Back button: After battle, back button does NOT return to battle screen
- [ ] Re-visit /starter-selection with starter: redirects to home

---

## Known Issues (Pre-existing, not from this change)

- Missing npm dependencies for DataTable, DragHandle components
- Type errors in useBattle.ts (musicTrack, background properties)
- These are unrelated to the battle flow refactor
