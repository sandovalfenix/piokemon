# Tasks: Wild Encounter & Capture Module

**Input**: Design documents from `/specs/007-wild-encounter-capture/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Not explicitly requested in spec - tests are OPTIONAL in this feature.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and new files/types needed by multiple stories

- [x] T001 Create CapturedPokemon interface and generateInstanceId helper in `src/models/capture.ts`
- [x] T002 [P] Create Encounter Whitelist with 50 Pokémon IDs in `src/data/encounterWhitelist.ts`
- [x] T003 [P] Create CaptureState and WildBattlePokemon interfaces in `src/models/capture.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create pcBoxStore with localStorage persistence in `src/stores/pcBox.ts`
- [x] T005 [P] Add isWildBattle flag and wildPokemonData to battle store state in `src/stores/battle.ts`
- [x] T006 [P] Expand POKEMON_DATA to use ENCOUNTER_WHITELIST in `src/stores/pokemonGenerator.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Wild Encounter via Buscar Animation (Priority: P1) 🎯 MVP

**Goal**: Player clicks "Explorar" → sees Buscar animation → Capturar shows Pokémon preview with "¡Batalla!" button

**Independent Test**: Click "Explorar" → see Buscar animation → Capturar shows Pokémon with real types from PokéAPI → can click "¡Batalla!" or "Huir"

### Implementation for User Story 1

- [x] T007 [P] [US1] Add PokéAPI fetch integration to useEncounterStore in `src/stores/useEncounterStore.ts`
- [x] T008 [P] [US1] Add getRandomEncounterId function to encounter whitelist in `src/data/encounterWhitelist.ts`
- [x] T009 [US1] Modify Capturar.vue to accept pokemon prop with real types in `src/components/Capturar.vue`
- [x] T010 [US1] Add "¡Batalla!" and "Huir" buttons to Capturar.vue in `src/components/Capturar.vue`
- [x] T011 [US1] Add battle and flee event emits to Capturar.vue in `src/components/Capturar.vue`
- [x] T012 [US1] Wire Buscar.vue to use updated useEncounterStore for PokéAPI data in `src/components/Buscar.vue`
- [x] T013 [US1] Update HomeView to handle Capturar events (navigate to battle or return home) in `src/views/HomeView.vue`

**Checkpoint**: At this point, User Story 1 should be fully functional - player can explore, see preview, and choose to battle or flee

---

## Phase 4: User Story 2 - Battle Wild Pokémon with Capture Option (Priority: P1)

**Goal**: Player battles wild Pokémon with "Capturar" button in action menu, can attempt capture at any time

**Independent Test**: Enter wild battle → see "Capturar" button → click → select ball → see shake animation → success/failure

### Implementation for User Story 2

- [x] T014 [P] [US2] Create useCapture composable with captureState and attemptCapture in `src/composables/useCapture.ts`
- [x] T015 [P] [US2] Create CaptureOverlay component with ball selection phase in `src/components/capture/CaptureOverlay.vue`
- [x] T016 [US2] Add shake animation phase to CaptureOverlay using Tailwind animate-shake in `src/components/capture/CaptureOverlay.vue`
- [x] T017 [US2] Add result phase to CaptureOverlay (success/failure display) in `src/components/capture/CaptureOverlay.vue`
- [x] T018 [US2] Add "Capturar" button to BattleView action menu (only when isWildBattle) in `src/views/BattleView.vue`
- [x] T019 [US2] Integrate CaptureOverlay into BattleView in `src/views/BattleView.vue`
- [x] T020 [US2] Wire useCapture composable to BattleView for capture flow in `src/views/BattleView.vue`
- [x] T021 [US2] Handle capture success: end battle, show FinalCaptura in `src/views/BattleView.vue`
- [x] T022 [US2] Handle capture failure: close overlay, continue battle (wild gets turn) in `src/views/BattleView.vue`
- [x] T023 [US2] Handle wild faint: end battle normally, capture opportunity lost in `src/views/BattleView.vue`

**Checkpoint**: At this point, User Story 2 should be fully functional - player can battle and capture wild Pokémon

---

## Phase 5: User Story 3 - Save Captured Pokémon to Team or PC Box (Priority: P1)

**Goal**: Captured Pokémon saved to team (if < 6) or PC Box (if full), persists after refresh

**Independent Test**: Capture with team size 5 → added to team. Capture with team size 6 → added to PC Box. Both persist.

### Implementation for User Story 3

- [x] T024 [US3] Add saveCapturedPokemon action to useCapture composable in `src/composables/useCapture.ts`
- [x] T025 [US3] Implement team vs PC Box routing logic (check team.length < 6) in `src/composables/useCapture.ts`
- [x] T026 [US3] Add captured Pokémon to teamStore when team has room in `src/composables/useCapture.ts`
- [x] T027 [US3] Add captured Pokémon to pcBoxStore when team is full in `src/composables/useCapture.ts`
- [x] T028 [US3] Display save location message ("Added to team!" / "Sent to PC Box!") in FinalCaptura in `src/components/FinalCaptura.vue`
- [x] T029 [US3] Verify localStorage persistence by adding pcBoxStore.initialize() to app startup in `src/main.ts`

**Checkpoint**: At this point, User Story 3 should be fully functional - captures persist correctly

---

## Phase 6: User Story 4 - useCapture Composable (Minimal Refactor) (Priority: P2)

**Goal**: Centralize capture logic in composable while existing components retain their visual presence

**Independent Test**: Composable provides all state/methods; components delegate to composable but look identical

### Implementation for User Story 4

- [x] T030 [P] [US4] Add openBallSelector and closeBallSelector actions to useCapture in `src/composables/useCapture.ts`
- [x] T031 [P] [US4] Add resetCapture action to useCapture for cleanup in `src/composables/useCapture.ts`
- [x] T032 [US4] Export isCapturing computed from useCapture composable in `src/composables/useCapture.ts`
- [x] T033 [US4] Refactor inventarioball.vue to emit selection to parent (minimal change) in `src/components/inventarioball.vue`
- [x] T034 [US4] Document useCapture API in composable file header comments in `src/composables/useCapture.ts`

**Checkpoint**: At this point, User Story 4 should be complete - logic is centralized, components unchanged visually

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T035 [P] Add error handling for PokéAPI unavailable (toast, retry) in `src/stores/useEncounterStore.ts`
- [x] T036 [P] Add error handling for localStorage full in `src/stores/pcBox.ts`
- [x] T037 [P] Add fallback to Pikachu (ID 25) if whitelist selection fails in `src/data/encounterWhitelist.ts`
- [x] T038 Run quickstart.md validation - verify full capture flow works
- [x] T039 Run `pnpm type-check` - ensure zero TypeScript errors
- [x] T040 Manual smoke test: explore → preview → battle → capture → save → refresh → verify persistence

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 → US2 → US3 (sequential, each builds on previous)
  - US4 can run after US2 (composable extraction)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P1)**: Depends on US1 (needs Capturar preview flow)
- **User Story 3 (P1)**: Depends on US2 (needs capture success event)
- **User Story 4 (P2)**: Can start after US2 (refactors existing capture logic)

### Within Each User Story

- Models/types before services
- Services/composables before components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

```bash
# Phase 1 - All can run in parallel:
T001, T002, T003

# Phase 2 - T005 and T006 can run in parallel:
T004 (pcBoxStore)
T005 (battle store) + T006 (pokemonGenerator) in parallel

# Phase 3 - T007 and T008 can run in parallel:
T007 (encounter store) + T008 (whitelist function)

# Phase 4 - T014 and T015 can run in parallel:
T014 (useCapture composable) + T015 (CaptureOverlay)

# Phase 6 - T030 and T031 can run in parallel:
T030 (openBallSelector) + T031 (resetCapture)

# Phase 7 - All Polish tasks can run in parallel:
T035, T036, T037
```

---

## Parallel Example: Phase 4 (User Story 2)

```bash
# Launch composable and overlay in parallel:
Task T014: "Create useCapture composable in src/composables/useCapture.ts"
Task T015: "Create CaptureOverlay component in src/components/capture/CaptureOverlay.vue"

# Then sequential for overlay phases:
Task T016: "Add shake animation phase to CaptureOverlay"
Task T017: "Add result phase to CaptureOverlay"

# Then BattleView integration:
Task T018-T023: "Wire BattleView integration"
```

---

## Implementation Strategy

### MVP First (User Stories 1-3)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T006)
3. Complete Phase 3: User Story 1 - Encounter Flow (T007-T013)
4. **CHECKPOINT**: Test explore → preview → battle navigation
5. Complete Phase 4: User Story 2 - Capture in Battle (T014-T023)
6. **CHECKPOINT**: Test capture overlay, shake animation, success/failure
7. Complete Phase 5: User Story 3 - Persistence (T024-T029)
8. **CHECKPOINT**: Test team/PC Box save, localStorage persistence
9. **MVP COMPLETE** - Full capture flow working

### Optional Enhancement (User Story 4)

10. Complete Phase 6: User Story 4 - Composable Refactor (T030-T034)
11. **CHECKPOINT**: Verify components unchanged visually

### Final Validation

12. Complete Phase 7: Polish (T035-T040)
13. **DONE**: Feature ready for merge

---

## Key Files Changed

| File | Change Type | Description |
|------|-------------|-------------|
| `src/models/capture.ts` | NEW | CapturedPokemon, CaptureState interfaces |
| `src/data/encounterWhitelist.ts` | NEW | 50 Pokémon IDs, getRandomEncounterId |
| `src/stores/pcBox.ts` | NEW | PC Box Pinia store with localStorage |
| `src/composables/useCapture.ts` | NEW | Centralized capture state/logic |
| `src/components/capture/CaptureOverlay.vue` | NEW | Ball selection + shake animation overlay |
| `src/stores/battle.ts` | MODIFY | Add isWildBattle flag |
| `src/stores/pokemonGenerator.ts` | MODIFY | Use ENCOUNTER_WHITELIST |
| `src/stores/useEncounterStore.ts` | MODIFY | Add PokéAPI fetch |
| `src/components/Capturar.vue` | MODIFY | Add ¡Batalla!/Huir buttons, real types |
| `src/components/Buscar.vue` | MODIFY | Wire to updated store |
| `src/views/BattleView.vue` | MODIFY | Add Capturar button, CaptureOverlay |
| `src/components/FinalCaptura.vue` | MODIFY | Display save location message |
| `src/main.ts` | MODIFY | Initialize pcBoxStore |

---

## Notes

- **captureEngine.ts**: DO NOT MODIFY - Gen 3 formula must be preserved exactly
- **Existing components**: Preserve visual appearance, only add new functionality
- **Tailwind animations**: Use `animate-shake` from tailwind.config.ts (already configured)
- **PokémonDB sprites**: Use `https://img.pokemondb.net/sprites/items/{ball-type}.png` for balls
- **Constitution compliance**: All tasks follow Tailwind-only, shadcn-vue, Pinia patterns
