# Research: Wild Encounter & Capture Module

**Feature**: 007-wild-encounter-capture  
**Date**: 2025-12-04

## Research Tasks

### 1. Existing Capture System Analysis

**Task**: Understand current capture implementation to ensure minimal changes

**Findings**:
- `captureEngine.ts` (src/stores/) - Gen 3 formula implementation, **MUST NOT be modified**
  - Ball modifiers: pokeball=1, superball=1.5, ultraball=2, masterball=255
  - Formula: `((3 * maxHP - 2 * currentHP) * baseCatchRate * ball) / (3 * maxHP)`
  - Returns: `{ success: boolean, shakes: number (0-3) }`
- `pokemonGenerator.ts` - Currently only 6 Pokémon (3 Kanto starters, 3 Johto starters)
- `useEncounterStore.ts` - Marked as **DEPRECATED**, already has migration note

**Decision**: Keep `captureEngine.ts` completely intact. Expand `pokemonGenerator.ts` with 50 IDs.

---

### 2. BattleView Integration Points

**Task**: Identify where to add "Capturar" button in existing battle UI

**Findings**:
- `BattleView.vue` already has `battleTarget` with types: `'npc' | 'gym-leader' | 'wild'`
- Wild battles use `getWildPokemon()` function to select from pool
- Battle state managed by `useBattleStore()` (src/stores/battle.ts)
- BattleScreen component renders action buttons

**Decision**: 
- Add `isWildBattle` computed based on `battleTarget.type === 'wild'`
- Render "Capturar" button conditionally when `isWildBattle` is true
- Use existing Dialog component from shadcn-vue for capture overlay

---

### 3. PokéAPI Integration Pattern

**Task**: Best practice for fetching Pokémon data from PokéAPI

**Findings**:
- Existing `pokemonService.ts` already implements:
  - In-memory cache (`pokemonCache`)
  - Timeout handling (5000ms)
  - Response transformation (`transformPokeAPIToPokemon`)
- Existing `hydrateTeam` service used in BattleView for team hydration
- Constitution requires ALL Pokémon data from PokéAPI (Principle VIII)

**Decision**: Reuse existing `fetchPokemon(id)` from `pokemonService.ts`. No new fetch logic needed.

---

### 4. PC Box Storage Pattern

**Task**: Best practice for PC Box state management with LocalStorage

**Findings**:
- Existing stores use Pinia with LocalStorage persistence
- `teamStore` pattern can be replicated
- Constitution requires Pinia for global state (Principle IV)

**Decision**: Create `pcBoxStore.ts` following same pattern as `teamStore.ts`:
- State: `pokemonList: CapturedPokemon[]`
- Actions: `addPokemon()`, `removePokemon()`
- Persistence: LocalStorage with key `pcbox-pokemon`

---

### 5. Shake Animation Implementation

**Task**: Best practice for Pokéball shake CSS animation

**Findings**:
- PokémonDB sprites already used in `inventarioball.vue`: `https://img.pokemondb.net/sprites/items/{type}.png`
- Tailwind supports CSS keyframe animations via `@keyframes` in config or `animate-*` classes
- Constitution allows `<style>` blocks for unavoidable animation keyframes with justification

**Decision**: 
- Use Tailwind `animate-*` classes where possible
- Define `@keyframes pokeball-shake` in component with justification comment
- Animation stages: 0 shakes (escape), 1-3 shakes (partial), capture (success)

---

### 6. Wild Pokémon Level Scaling

**Task**: How to scale wild Pokémon level based on player progression

**Findings**:
- Existing `getWildPokemon()` in BattleView: `const avgLevel = progressStore.currentGym * 5 + 3`
- Spec requirement FR-005: `gym badges earned * 5 + 5`
- `progressStore` already tracks `currentGym`

**Decision**: Use formula from spec: `level = progressStore.currentGym * 5 + 5` (minimum 5)

---

## Summary of Decisions

| Topic | Decision | Rationale |
|-------|----------|-----------|
| Capture formula | **Keep captureEngine.ts intact** | Working Gen 3 implementation |
| Pokémon pool | Expand `POKEMON_DATA` to 50 IDs | Spec requirement SC-007 |
| PokéAPI fetch | Reuse `pokemonService.ts` | Already has caching, transformation |
| PC Box store | New Pinia store following team pattern | Constitution Principle IV |
| Shake animation | CSS keyframes + Tailwind | Performance, minimal JS |
| Level scaling | `currentGym * 5 + 5` | Spec FR-005 |

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Modify captureEngine.ts for new features | Constitution violation - preserve existing formulas |
| New PokéAPI fetch implementation | Existing pokemonService.ts already has caching |
| localStorage directly (no Pinia) | Constitution Principle IV - Pinia required |
| JavaScript shake animation | CSS animations are more performant |
