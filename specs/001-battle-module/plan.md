# Implementation Plan: Battle Module (MVP)

**Branch**: `001-battle-module` | **Date**: 2025-11-28 | **Spec**: `specs/001-battle-module/spec.md`
**Input**: Feature specification from `/specs/001-battle-module/spec.md`

## Summary

Deliver a self-contained 1v1 turn-based battle module that mirrors core Pokémon mechanics with modern UX. Prioritize deterministic, testable domain logic (damage, accuracy RNG, type effectiveness) and a minimal but clear UI. Design for easy integration with future modules (team management, trading, routing) via well-defined interfaces and serializable state.

## Technical Context

**Language/Version**: TypeScript 5.9 (strict)  
**Primary Dependencies**: Vue 3 (Composition API), Pinia, Vue Router (optional views), Tailwind CSS, Howler.js  
**Storage**: `localStorage` (best scores/config only)  
**Testing**: Vitest + Vue Test Utils  
**Target Platform**: Web (modern evergreen browsers)  
**Project Type**: Single web app (Vite)  
**Performance Goals**: 60 fps UI; turn resolution in <100ms (excluding animations)  
**Constraints**: Bundle initial load <500KB gz; deterministic RNG with seed; serializable battle state  
**Scale/Scope**: MVP 1v1; progressive iteration to parity with classic systems

## Constitution Check

- Type Safety: strict TS; no `any` without justification  
- Testing Culture: unit tests for domain (damage, type chart, RNG); integration tests for Battle UI flows  
- Component-First: reusable, single-responsibility components with typed props/events  
- State Discipline: global state via Pinia store; UI state local  
- Performance & Accessibility: Lighthouse ≥90; keyboard navigable moves; ARIA for announcements (hit/miss/effectiveness)

All gates satisfied by plan; enforce via CI scripts once added.

## Architecture & Boundaries

Layered architecture with clear boundaries:

- UI (Vue components)
  - `BattleUI` (screen wrapper, owns layout and high-level phases)
  - `MoveSelector` (move buttons, keyboard/touch input)
  - `StatusPanel` (names, types, HP bars, numeric HP)
  - `LogPanel` (turn log, effectiveness/miss messages)

- Composables (interaction/services)
  - `useBattleLoop` (animation frame scheduling, disable input while resolving)
  - `useAudio` (SFX via Howler; swappable provider)
  - `useInput` (keyboard/touch mapping; debounced, disabled during resolve)

- State (Pinia)
  - `battleStore` (session-scoped): battle state, actions: `startBattle`, `chooseMove`, `resolveTurn`, `endBattle`, selectors for UI

- Domain (pure TS)
  - `rng` (seeded RNG; deterministic for tests)
  - `typeChart` (18-type multipliers)
  - `damageCalc` (level, power, atk/def, 0.85–1.0 random, effectiveness)
  - `turnResolver` (order, accuracy check, apply damage, end conditions)
  - `ai` (strategy interface + basic implementation)
  - Entities: `Pokemon`, `Move`, `BattleState`, `TurnResult`

- Infra
  - `storage` (localStorage adapter for best scores/config)
  - `audio` (Howler adapter implementing `AudioPort`)
  - `logger` (centralized console wrapper; production-ready to swap)

Extensibility via ports/interfaces: `AIAdapter`, `AudioPort`, `StoragePort`, `DataProvider` for moves/types.

## Public APIs (Module Boundary)

Domain (framework-agnostic):
- `createSeededRng(seed: string | number): Rng`
- `computeTypeMultiplier(attacking: Type, defending: Type | [Type, Type?]): 0 | 0.5 | 1 | 2`
- `calculateDamage(input: { level: number; power: number; atk: number; def: number; category: 'physical'|'special'; multiplier: number; rng: Rng }): number`
- `resolveTurn(state: BattleState, playerMoveId: string, rng: Rng, ai: AI): TurnResult`
- `createAI(opts): AI` minimal strategy

Pinia store (UI boundary):
- State: `phase: 'select'|'resolving'|'ended'`, `log: LogEntry[]`, `winner: 'player'|'npc'|null`, `entities: { player: Pokemon; npc: Pokemon }`
- Actions: `startBattle(seed?)`, `chooseMove(moveId)`, `resolveTurn()`, `endBattle()`
- Getters: derived HP%, status strings, available moves

## Data Sources

- Static data in `src/data/`:
  - `types.ts/json` (18 types)
  - `typeChart.ts/json` (matrix)
  - `moves.ts/json` (subset ~20)
  - `pokemon.ts/json` (sample player/npc with stats/moves)
- Swappable data provider interface to enable future external sources.

## Project Structure

```text
src/
  components/
    BattleUI.vue
    MoveSelector.vue
    StatusPanel.vue
    LogPanel.vue
  composables/
    useBattleLoop.ts
    useAudio.ts
    useInput.ts
  domain/battle/
    ai/
      basicAI.ts
      types.ts
    calc/
      damage.ts
      typeChart.ts
      rng.ts
    engine/
      resolveTurn.ts
      entities.ts
      state.ts
  services/
    audio/howlerAudio.ts
    storage/localStorage.ts
  data/
    types.ts
    typeChart.ts
    moves.ts
    pokemon.ts
  stores/
    battle.ts
  views/
    BattleView.vue (optional)

tests/
  unit/domain/
    damage.spec.ts
    typeChart.spec.ts
    rng.spec.ts
    ai.spec.ts
  integration/components/
    BattleUI.spec.ts
```

**Structure Decision**: Single-project web app using existing `src/` layout; domain logic kept framework-agnostic under `src/domain/battle`.

## Milestones & Phases

- Phase 1: Domain Foundations
  - Seeded RNG, type chart, damage calc (physical/special), entities/state
  - Unit tests for RNG, type chart, damage calc

- Phase 2: Engine & Store
  - Turn resolver (order, accuracy, damage, end conditions)
  - Pinia `battleStore` with actions and phases; deterministic seeds for tests
  - Integration tests for core flow (select → resolve → end)

- Phase 3: UI & Composables
  - `BattleUI`, `StatusPanel`, `MoveSelector`, `LogPanel`
  - `useBattleLoop`, `useInput`, `useAudio` (stub sounds)
  - Accessibility: focus/keyboard navigation; ARIA live region for log

- Phase 4: NPC Strategy & Feedback
  - Basic AI (prefer super effective; weighted power; low HP heal hook ready)
  - Visual feedback: damage numbers, effectiveness/miss messages
  - Audio cues via Howler adapter (hit/miss, super effective)

- Phase 5: Persistence & Docs
  - `localStorage` adapter for best score/config (seed, SFX volume)
  - Docs: module boundaries, public APIs, integration guide

## Testing Strategy

- Unit (Vitest): RNG distribution (seed determinism), type multipliers, damage math
- Integration (VTU): battle flow, UI state, disabled inputs during resolve
- Strategy tests: AI picks super effective ≥70% when available
- Snapshot/logical assertions for battle log messages

## Risks & Mitigations

- Floating-point precision → use integer rounding rules after final multiplier
- UI re-render jank → keep domain pure, minimize reactive dependencies; 60fps budget
- Non-deterministic tests → always inject seed; wrap `Math.random` behind RNG
- Scope creep → strict adherence to Out-of-Scope list from spec

## Definition of Done (MVP)

- Select move → resolve turn → update state/UI → win/lose works reliably
- Deterministic RNG with seed exposed in store `startBattle(seed)`
- Unit tests pass for damage, type chart, accuracy; integration tests for core flow
- Basic AI behaves strategically (≥70% super effective preference when present)
- Documentation: boundaries, public API surface, integration guide snippet

## Integration Guide (excerpt)

- Import view or mount `BattleUI` inside any route/component
- Provide initial Pokémon via `battleStore.startBattle(seed?)`
- Listen to `winner` to transition to results screen
- Optional: pass custom `AI` and `DataProvider` to store/engine factory for experiments

