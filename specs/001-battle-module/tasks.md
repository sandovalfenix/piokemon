# Tasks: Battle Module (MVP)

**Input**: Design documents from `/specs/001-battle-module/`
**Prerequisites**: plan.md (required), spec.md (required)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish baseline tooling, configs, and scaffolding for the battle module. No business logic yet.

 - [X] T001 Update runtime deps in `package.json` (add `howler`)
 - [X] T002 Update dev deps in `package.json` (add `vitest`, `@vitest/coverage-v8`, `jsdom`, `@vue/test-utils`, `tailwindcss`, `postcss`, `autoprefixer`)
 - [X] T003 Add test scripts in `package.json` (`test`, `test:ui`, `test:coverage`)
 - [X] T004 [P] Create Tailwind config in `tailwind.config.js` (content paths for `src/**/*.{vue,ts}`)
 - [X] T005 [P] Create PostCSS config in `postcss.config.js` (plugins: tailwindcss, autoprefixer)
 - [X] T006 [P] Create stylesheet with Tailwind directives in `src/assets/main.css`
 - [X] T007 Import stylesheet in `src/main.ts` (`import '@/assets/main.css'`)
 - [X] T008 [P] Add Vitest config in `vitest.config.ts` (jsdom, coverage, alias `@`)
 - [X] T009 Configure ESLint for tests in `eslint.config.ts` (env: vitest globals)
 - [X] T010 [P] Scaffold domain folders and files in `src/domain/battle/engine/state.ts`, `src/domain/battle/engine/resolveTurn.ts`, `src/domain/battle/calc/damage.ts`, `src/domain/battle/calc/typeChart.ts`, `src/domain/battle/calc/rng.ts`, `src/domain/battle/ai/basicAI.ts`, `src/domain/battle/ai/types.ts`, `src/domain/battle/engine/entities.ts`
 - [X] T011 [P] Scaffold composables in `src/composables/useBattleLoop.ts`, `src/composables/useAudio.ts`, `src/composables/useInput.ts`
 - [X] T012 [P] Scaffold services adapters in `src/services/audio/howlerAudio.ts`, `src/services/storage/localStorage.ts`
 - [X] T013 [P] Scaffold UI components in `src/components/BattleUI.vue`, `src/components/MoveSelector.vue`, `src/components/StatusPanel.vue`, `src/components/LogPanel.vue`
 - [X] T014 [P] Add sample data stubs in `src/data/types.ts`, `src/data/typeChart.ts`, `src/data/moves.ts`, `src/data/pokemon.ts`
 - [X] T015 Create accessibility hooks placeholder in `src/utils/logger.ts` (centralized logger exported)
 - [X] T016 Create optional battle view scaffold in `src/views/BattleView.vue` (imports `BattleUI`)

## Phase 2: Foundational (Domain Logic & Store)

**Purpose**: Implement core battle mechanics (damage, type effectiveness, RNG, turn resolution) and Pinia store with typed state/actions.

- [X] T017 Implement full type effectiveness chart in `src/data/typeChart.ts` with all 18 types
- [X] T018 Implement `computeTypeMultiplier` in `src/domain/battle/calc/typeChart.ts` using chart data
- [X] T019 [P] Add unit test for type effectiveness in `tests/unit/domain/typeChart.spec.ts`
- [X] T020 Implement complete damage formula in `src/domain/battle/calc/damage.ts` (level, power, atk/def, category, multiplier, random factor)
- [X] T021 [P] Add unit test for damage calculation in `tests/unit/domain/damage.spec.ts`
- [X] T022 [P] Add unit test for seeded RNG determinism in `tests/unit/domain/rng.spec.ts`
- [X] T023 Implement turn resolution logic in `src/domain/battle/engine/resolveTurn.ts` (speed order, accuracy check, damage application, HP updates, win/lose detection)
- [X] T024 Create Pinia battle store in `src/stores/battle.ts` (state: BattleState, actions: startBattle, chooseMove, resolveTurn, endBattle; getters: playerPokemon, npcPokemon, winner)
- [X] T025 Wire store initialization with sample data in `startBattle` action
- [X] T026 Wire UI components to battle store (BattleUI, MoveSelector, StatusPanel, LogPanel)

## Phase 3: UI & Composables (Interactive Battle Loop)

**Purpose**: Implement full interactive battle experience with composables, animations, audio, and accessibility features.

- [X] T027 Implement `useBattleLoop` composable in `src/composables/useBattleLoop.ts` (animation frame scheduling, disable input while resolving, return phase state)
- [X] T028 Implement `useInput` composable in `src/composables/useInput.ts` (keyboard mapping 1-4 for moves, touch/click handlers, debouncing, disabled during resolve phase)
- [X] T029 Implement `useAudio` composable in `src/composables/useAudio.ts` (Howler.js integration, play(soundId), stop(), setVolume(), preload assets)
- [X] T030 Wire `useBattleLoop` into `BattleUI.vue` to control turn animation timing
- [X] T031 Wire `useInput` into `MoveSelector.vue` for keyboard navigation (number keys 1-4)
- [X] T032 Add audio cues to battle flow: hit sound, miss sound, super effective sound, victory/defeat jingles
- [X] T033 [P] Add ARIA live region to `LogPanel.vue` for screen reader announcements (polite for hits/effectiveness, assertive for win/lose)
- [X] T034 [P] Add keyboard focus management to `MoveSelector.vue` (trap focus during selection, restore after turn)
- [X] T035 [P] Add move type badges and power display to `MoveSelector.vue` buttons
- [X] T036 [P] Add CSS transitions for HP bar animation in `StatusPanel.vue` (smooth width change with transition-all duration-300)
- [X] T037 [P] Add integration test in `tests/integration/components/BattleUI.spec.ts` (mount component, simulate move selection, verify HP updates and log messages)

## Phase 4: NPC Strategy & Visual Feedback

**Purpose**: Enhance NPC intelligence and add visual polish with damage numbers, effectiveness indicators, and strategic AI.

- [X] T038 Implement strategic AI in `src/domain/battle/ai/strategicAI.ts` (prefer super effective moves ≥70%, consider remaining HP, weighted randomization)
- [X] T039 [P] Add unit tests for strategic AI in `tests/unit/domain/strategicAI.spec.ts` (verify super effective preference, HP threshold logic)
- [X] T040 Add damage number animations to `StatusPanel.vue` (floating text showing damage dealt, fade-out after 1s)
- [X] T041 Add type effectiveness visual indicator in `LogPanel.vue` (color-coded messages: green for super effective, red for not very effective, gray for neutral)
- [X] T042 Add hit/miss animations in `BattleUI.vue` (shake animation for hits, fade animation for misses)
- [X] T043 [P] Wire strategic AI into battle store as configurable option in `startBattle(seed?, aiType?: 'basic' | 'strategic')`
- [X] T044 [P] Add visual state indicators in `StatusPanel.vue` (fainted overlay when HP reaches 0)

## Phase 5: Persistence & Documentation

**Purpose**: Add persistent storage for user preferences and battle configuration, complete module documentation.

- [ ] T045 Implement `localStorage` adapter in `src/services/storage/localStorage.ts` (save/load methods with TypeScript types, error handling)
- [ ] T046 Add storage interface in `src/domain/battle/ports/StoragePort.ts` (abstract interface for storage operations)
- [ ] T047 Wire storage to battle store: save best score, battle seed, SFX volume to `localStorage`
- [ ] T048 Add settings panel UI (optional component) for SFX volume control and seed input
- [ ] T049 [P] Add E2E test in `tests/e2e/battlePersistence.spec.ts` (verify localStorage save/load, settings persistence across sessions)
- [ ] T050 Write module integration guide in `specs/001-battle-module/integration-guide.md` (mounting BattleUI, providing custom AI/data providers, listening to winner events)
- [ ] T051 [P] Write public API reference in `specs/001-battle-module/api-reference.md` (domain functions, store actions/getters, composables, data interfaces)
- [ ] T052 [P] Update main README.md with battle module section (features, tech stack, getting started, testing)
- [ ] T053 Add JSDoc comments to all public domain functions and store actions
- [ ] T054 [P] Generate test coverage report and verify ≥80% coverage for domain layer
- [ ] T055 Final validation: run full test suite, build production bundle, verify bundle size <500KB gzipped

