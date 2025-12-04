# Implementation Plan: Wild Encounter & Capture Module

**Branch**: `007-wild-encounter-capture` | **Date**: 2025-12-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-wild-encounter-capture/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement wild Pokémon encounters with capture mechanics by:
1. Expanding the Encounter Whitelist from 6 to ~50 Pokémon IDs in `pokemonGenerator.ts`
2. Integrating PokéAPI fetching for real Pokémon data during encounters
3. Adding "Capturar" button to BattleView for wild battles with capture overlay
4. Creating PC Box storage for captured Pokémon when team is full
5. Preserving existing collaborative components (`Buscar.vue`, `Capturar.vue`, `inventarioball.vue`, `FinalCaptura.vue`) with minimal changes

## Technical Context

**Language/Version**: TypeScript 5.9+ (strict mode)  
**Framework**: Vue 3.5+ with Composition API, Vite 7+  
**Primary Dependencies**: Pinia 3+, Vue Router 4+, shadcn-vue (Radix Vue), Tailwind CSS 3+  
**Storage**: LocalStorage for team and PC Box persistence  
**Testing**: Vitest for unit/integration tests  
**Target Platform**: Modern evergreen browsers (last 2 versions)  
**Project Type**: Web SPA (Vue 3 frontend)  
**Performance Goals**: Sub-100ms UI response, PokéAPI fetch <2s (with caching), 60fps animations  
**Constraints**: Bundle size <500KB gzipped, offline-capable with cached data  
**Scale/Scope**: ~50 encounterable Pokémon, unlimited PC Box for MVP

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Tailwind-Only Styling | ✅ PASS | All new components use Tailwind utilities, no `<style>` blocks |
| II. Component-First Architecture | ✅ PASS | New components are self-contained, use Composition API |
| III. Type Safety | ✅ PASS | All code TypeScript strict, interfaces defined for entities |
| IV. State Management Discipline | ✅ PASS | New `pcBoxStore` follows Pinia patterns, no Vue.observable |
| V. Testing Culture | ⚠️ PENDING | Tests required after implementation |
| VI. Performance & Accessibility | ✅ PASS | CSS animations, keyboard-navigable overlays |
| VII. Quality Enforcement | ⚠️ PENDING | type-check and test runs required after implementation |
| VIII. PokeAPI as Single Source of Truth | ✅ PASS | All Pokémon data from PokéAPI, Whitelist contains IDs only |
| IX. shadcn-vue Component System | ✅ PASS | New overlays use shadcn-vue Dialog, Button, Card |

**Pre-Design Gate**: ✅ PASS - No blocking violations

## Project Structure

### Documentation (this feature)

```text
specs/007-wild-encounter-capture/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── capture/                 # NEW - Capture-related components
│   │   └── CaptureOverlay.vue   # NEW - Modal with ball selection + shake animation
│   ├── Buscar.vue               # EXISTING - Preserve animation, minimal changes
│   ├── Capturar.vue             # EXISTING - Add "¡Batalla!" and "Huir" buttons
│   ├── inventarioball.vue       # EXISTING - Preserve carousel UI
│   └── FinalCaptura.vue         # EXISTING - Preserve result animations
├── composables/
│   └── useCapture.ts            # NEW - Centralized capture state/logic
├── stores/
│   ├── battle.ts                # MODIFY - Add isWildBattle flag
│   ├── useEncounterStore.ts     # MODIFY - Add PokéAPI fetch
│   └── pcBox.ts                 # NEW - PC Box storage with LocalStorage
├── data/
│   └── pokemonGenerator.ts      # MODIFY - Expand POKEMON_DATA to ~50 IDs
└── views/
    └── BattleView.vue           # MODIFY - Add "Capturar" button for wild battles

tests/
├── unit/
│   ├── useCapture.spec.ts       # NEW - Capture composable tests
│   └── pcBoxStore.spec.ts       # NEW - PC Box store tests
└── integration/
    └── wildCapture.spec.ts      # NEW - Full capture flow tests
```

**Structure Decision**: Web SPA - single frontend project. New capture functionality organized in `src/components/capture/` directory. Composable pattern for shared logic.

## Complexity Tracking

> No constitution violations requiring justification.

---

## Post-Design Constitution Re-Check

*Re-evaluated after Phase 1 design completion.*

| Principle | Status | Verification |
|-----------|--------|--------------|
| I. Tailwind-Only Styling | ✅ PASS | CaptureOverlay uses Tailwind for all styles. Exception: `@keyframes pokeball-shake` with justification comment for CSS animation. |
| II. Component-First Architecture | ✅ PASS | New `CaptureOverlay.vue` is self-contained with defined props/events interface. |
| III. Type Safety | ✅ PASS | `CapturedPokemon`, `CaptureState`, `WildBattlePokemon` interfaces defined in data-model.md |
| IV. State Management Discipline | ✅ PASS | `pcBoxStore` follows Pinia pattern with localStorage persistence. No Vue.observable. |
| V. Testing Culture | ⚠️ PENDING | Test files defined in structure. Will be implemented during /speckit.task phase. |
| VI. Performance & Accessibility | ✅ PASS | CSS keyframes for 60fps animation. Dialog uses Radix for keyboard navigation. |
| VII. Quality Enforcement | ⚠️ PENDING | Checkpoint validation required after implementation. |
| VIII. PokeAPI as Single Source of Truth | ✅ PASS | encounterWhitelist.ts contains only IDs. All data fetched via pokemonService.ts |
| IX. shadcn-vue Component System | ✅ PASS | CaptureOverlay uses Dialog from shadcn-vue. Button component for actions. |

**Post-Design Gate**: ✅ PASS - Ready for `/speckit.tasks`

---

## Generated Artifacts

| Artifact | Path | Status |
|----------|------|--------|
| Research | `specs/007-wild-encounter-capture/research.md` | ✅ Complete |
| Data Model | `specs/007-wild-encounter-capture/data-model.md` | ✅ Complete |
| Contracts | `specs/007-wild-encounter-capture/contracts/components.md` | ✅ Complete |
| Quickstart | `specs/007-wild-encounter-capture/quickstart.md` | ✅ Complete |
| Agent Context | `.github/agents/copilot-instructions.md` | ✅ Updated |
