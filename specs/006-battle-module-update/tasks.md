# Tasks: Battle Module Update

**Input**: Design documents from `/specs/006-battle-module-update/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Tests included for core battle mechanics (level scaling, status filtering, progress persistence).

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US6)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project structure and new file scaffolding

- [X] T001 [P] Create `src/models/progressState.ts` with ProgressState interface and DEFAULT_PROGRESS constant
- [X] T002 [P] Create `src/models/battleOutcome.ts` with BattleOutcome, OpponentType, and BattleResult types
- [X] T003 [P] Create `src/models/moveLearning.ts` with MoveLearningState and MoveLearningCandidate interfaces
- [X] T004 [P] Create `src/data/thematicNpcs.ts` with ThematicNpc interface and empty array scaffold
- [X] T005 [P] Create `src/data/wildPokemonPool.ts` with WildPokemonEntry interface and Gen 1 pool
- [X] T006 Verify shadcn-vue Dialog and Select components are available via `npx shadcn-vue@latest add dialog select`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can begin

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 Create `src/stores/progress.ts` Pinia store with state, getters (isNpcDefeated, isGymLeaderDefeated, canChallenge), and actions (defeatNpc, defeatGymLeader, resetProgress)
- [X] T008 Create `src/services/progress/progressService.ts` with saveProgress(), loadProgress(), clearProgress() functions for LocalStorage sync
- [X] T009 Integrate progress store with LocalStorage via watch() in store initialization, call loadProgress() on store mount
- [X] T010 Create pure function `calculateScaledLevel(opponentLevel: number): number` in `src/domain/battle/calc/levelScaling.ts`
- [X] T011 Create pure function `filterUsableMoves(moves: Move[]): Move[]` in `src/domain/battle/engine/moveFilter.ts` to exclude status category
- [X] T012 [P] Add unit test `tests/unit/domain/battle/levelScaling.spec.ts` for calculateScaledLevel (test edge cases: level 1, 2, 3, 20)
- [X] T013 [P] Add unit test `tests/unit/domain/battle/moveFilter.spec.ts` for filterUsableMoves (test physical, special, status filtering)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Turn-Based Combat with Dynamic Level Scaling (Priority: P1) 🎯 MVP

**Goal**: Player can battle with dynamically scaled levels, Physical/Special moves only, no items

**Independent Test**: Start battle vs level 15 opponent, verify player level = 13, verify only Physical/Special moves shown, verify no Item button

### Tests for User Story 1

- [ ] T014 [P] [US1] Integration test `tests/integration/battleLevelScaling.spec.ts` - verify player Pokemon level scales to OpponentLevel - 2

### Implementation for User Story 1

- [X] T015 [US1] Modify `src/stores/battle.ts` - apply level scaling in battle initialization using calculateScaledLevel()
- [X] T016 [US1] Modify `src/stores/battle.ts` - recalculate stats (HP, Atk, Def, etc.) based on scaled level
- [X] T017 [US1] Modify `src/components/MoveSelector.vue` - filter moves using filterUsableMoves() to hide Status category
- [X] T018 [US1] Modify `src/components/BattleScreen.vue` - remove any Item button/menu references from battle UI
- [X] T019 [US1] Modify `src/stores/battle.ts` - remove XP awarding logic from battle end handler
- [X] T020 [US1] Modify `src/stores/battle.ts` - remove currency awarding logic from battle end handler

**Checkpoint**: Player can complete battle with scaled levels, filtered moves, no items/XP/currency

---

## Phase 4: User Story 2 - Linear Story Progression: Thematic NPC to Gym Leader (Priority: P1)

**Goal**: Player follows linear progression: defeat NPCs → unlock Gym Leader → defeat → unlock next gym

**Independent Test**: Fresh game shows Gym 1 NPCs only, defeating all NPCs unlocks José, defeating José unlocks Gym 2 NPCs

### Implementation for User Story 2

- [X] T021 [US2] Populate `src/data/thematicNpcs.ts` with 3-5 NPCs per gym (15-25 total), each with gymId, order, team, and quotes
- [X] T022 [US2] Add helper function `getNpcsByGym(gymId: number)` in `src/data/thematicNpcs.ts`
- [X] T023 [US2] Add helper function `areGymNpcsDefeated(gymId: number, defeatedIds: string[])` in `src/data/thematicNpcs.ts`
- [X] T024 [US2] Add `getAvailableChallenges()` getter to `src/stores/progress.ts` - returns current NPCs and unlocked gym leader
- [X] T025 [US2] Modify `src/views/HomeView.vue` - display available challenges from progress store
- [X] T026 [US2] Modify `src/views/HomeView.vue` - show progression UI with earned badges and current gym
- [X] T027 [US2] Create `src/services/battle/battleInitService.ts` - function to create BattleContext from NPC/GymLeader/Wild selection
- [X] T028 [US2] Modify `src/stores/battle.ts` - call progress.defeatNpc() or progress.defeatGymLeader() on victory

**Checkpoint**: Player can progress through NPCs → Gym Leader → Next Gym in linear order

---

## Phase 5: User Story 3 - Victory Outcome: Auto-Heal and Move Learning (Priority: P1)

**Goal**: On victory: navigate to '/', heal team, show Move Learning UI if eligible

**Independent Test**: Win battle, verify redirect to '/', verify all Pokemon have full HP, verify Move Learning modal (if eligible)

### Implementation for User Story 3

- [X] T029 [US3] Create `src/components/battle/MoveLearningModal.vue` using Shadcn Dialog - display new move, current 4 moves, replace/skip options
- [X] T030 [US3] Add move learning state to `src/stores/battle.ts` - moveLearningState: MoveLearningState
- [X] T031 [US3] Create `src/services/battle/moveLearnService.ts` - checkMoveLearningEligibility(), applyMoveReplacement()
- [X] T032 [US3] Create `healTeam()` action in `src/stores/team.ts` - set currentHp = maxHp for all Pokemon
- [X] T033 [US3] Modify `src/stores/battle.ts` victory handler - call healTeam(), check move learning, navigate to '/'
- [X] T034 [US3] Integrate `MoveLearningModal.vue` in `src/views/BattleView.vue` - show modal when moveLearningState.isOpen

**Checkpoint**: Victory triggers heal + optional move learning + lobby redirect

---

## Phase 6: User Story 4 - Defeat Outcome: High-Fidelity Modal and Lobby Return (Priority: P2)

**Goal**: On defeat: show Shadcn Defeat Modal, return to Lobby with healed team

**Independent Test**: Lose battle, verify Defeat Modal appears with opponent name, click Return button, verify redirect to '/', verify team healed

### Implementation for User Story 4

- [X] T035 [US4] Create `src/components/battle/DefeatModal.vue` using Shadcn Dialog - defeat message, opponent name, Return to Lobby button
- [X] T036 [US4] Add defeat modal state to `src/stores/battle.ts` - defeatModalState: DefeatModalState
- [X] T037 [US4] Modify `src/stores/battle.ts` defeat handler - set defeatModalState.isOpen = true, populate opponent info
- [X] T038 [US4] Integrate `DefeatModal.vue` in `src/views/BattleView.vue` - show modal when defeatModalState.isOpen
- [X] T039 [US4] Implement modal close handler - call healTeam(), navigate to '/', reset modal state
- [X] T040 [US4] Verify defeated trainer remains re-challengeable (no call to defeatNpc/defeatGymLeader on loss)

**Checkpoint**: Defeat shows polished modal, team heals on return, trainer remains available

---

## Phase 7: User Story 5 - Wild Encounters: Random Combat-Only Battles (Priority: P2)

**Goal**: "Wild Battle" button spawns random Pokemon, no capture, practice only

**Independent Test**: Click Wild Battle, verify random Gen 1 Pokemon spawns at (team avg - 2) level, no Pokeball UI, win/lose returns to lobby

### Implementation for User Story 5

- [X] T041 [US5] Create `src/components/battle/WildBattleButton.vue` - styled Button that triggers wild encounter
- [X] T042 [US5] Add `selectWildPokemon()` function to `src/data/wildPokemonPool.ts` - weighted random selection
- [X] T043 [US5] Add `calculateTeamAverageLevel(team: Pokemon[])` function to `src/domain/battle/calc/levelScaling.ts`
- [X] T044 [US5] Create `initWildBattle()` action in `src/stores/battle.ts` - spawn wild Pokemon, scale to team avg - 2
- [X] T045 [US5] Integrate `WildBattleButton.vue` in `src/views/HomeView.vue` - visible alongside story progression
- [X] T046 [US5] Modify wild battle victory handler - NO move learning trigger, immediate heal + lobby redirect
- [X] T047 [US5] Verify no capture/Pokeball UI appears in wild battles (opponentType === 'wild' check)

**Checkpoint**: Wild encounters work as combat-only practice with proper scaling

---

## Phase 8: User Story 6 - Persistent Story Progress via Pinia/LocalStorage (Priority: P2)

**Goal**: Progress persists through browser refresh and session changes

**Independent Test**: Defeat NPC, refresh browser, verify NPC still marked defeated, progress intact

### Tests for User Story 6

- [ ] T048 [P] [US6] Unit test `tests/unit/stores/progress.spec.ts` - test defeatNpc, defeatGymLeader, resetProgress actions

### Implementation for User Story 6

- [X] T049 [US6] Add LocalStorage write on every state change via watch() in `src/stores/progress.ts`
- [ ] T050 [US6] Add loadProgress() call in `src/main.ts` or App.vue mounted hook
- [X] T051 [US6] Add corrupted data handling in loadProgress() - clear and redirect to '/team-builder' if parse fails
- [X] T052 [US6] Create "Reset Progress" button in HomeView.vue (optional, calls resetProgress())
- [X] T053 [US6] Verify starter check - redirect to '/team-builder' if no team in LocalStorage before battle start

**Checkpoint**: Progress survives refresh, handles corruption gracefully

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and validation

- [X] T054 [P] Remove any remaining Item-related UI elements across all battle components
- [X] T055 [P] Ensure all Pokemon sprites use transparent PNG format (verify spriteUrlBuilder.ts)
- [X] T056 [P] Ensure all trainer sprites use transparent PNG format (verify NPC data)
- [ ] T057 Disable input during turn resolution animations (prevent rapid-click issues)
- [X] T058 Run `npm run type-check` - ensure zero TypeScript errors
- [ ] T059 Run `npm run lint` - ensure zero linting errors
- [ ] T060 Run `npm run test` - ensure all tests pass
- [ ] T061 Manual test: Complete full progression Jose → Manuel → Rafael → Sofía → Valeria
- [ ] T062 Run quickstart.md validation checklist

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)     ──► Phase 2 (Foundational) ──┬──► Phase 3 (US1: Combat) ───┐
                                                 │                              │
                                                 ├──► Phase 4 (US2: Progress) ──┤
                                                 │                              │
                                                 ├──► Phase 5 (US3: Victory) ───┤──► Phase 9 (Polish)
                                                 │                              │
                                                 ├──► Phase 6 (US4: Defeat) ────┤
                                                 │                              │
                                                 ├──► Phase 7 (US5: Wild) ──────┤
                                                 │                              │
                                                 └──► Phase 8 (US6: Persist) ───┘
```

### User Story Dependencies

| Story | Depends On | Can Parallel With |
|-------|------------|-------------------|
| US1 (Combat) | Phase 2 | US2, US4, US5, US6 |
| US2 (Progress) | Phase 2 | US1, US4, US5, US6 |
| US3 (Victory) | US1, US2 | US4 |
| US4 (Defeat) | US1 | US3, US5, US6 |
| US5 (Wild) | US1 | US2, US4, US6 |
| US6 (Persist) | Phase 2 | US1, US2, US4, US5 |

### MVP Delivery Path

**Minimum Viable Product**: Phases 1 + 2 + 3 + 4 + 5 + 6

1. Setup (T001-T006)
2. Foundational (T007-T013)
3. US1: Combat with scaling (T014-T020)
4. US2: Linear progression (T021-T028)
5. US3: Victory outcomes (T029-T034)
6. US4: Defeat modal (T035-T040)

**With MVP complete**: Full battle loop with progression, victory/defeat handling

### Parallel Opportunities

```bash
# Phase 1 - All can run in parallel:
T001, T002, T003, T004, T005, T006

# Phase 2 - Tests can run parallel:
T012, T013

# User Stories - Can run in parallel after Phase 2:
US1 (T015-T020) || US2 (T021-T028) || US4 (T035-T040) || US5 (T041-T047) || US6 (T048-T053)

# US3 waits for US1 + US2 but US4, US5, US6 don't
```

---

## Task Count Summary

| Phase | Story | Tasks | Parallel |
|-------|-------|-------|----------|
| 1. Setup | - | 6 | All |
| 2. Foundational | - | 7 | 2 |
| 3. Combat | US1 | 7 | 1 |
| 4. Progress | US2 | 8 | 0 |
| 5. Victory | US3 | 6 | 0 |
| 6. Defeat | US4 | 6 | 0 |
| 7. Wild | US5 | 7 | 0 |
| 8. Persist | US6 | 6 | 1 |
| 9. Polish | - | 9 | 4 |
| **Total** | | **62** | |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Constitution compliance: All UI uses shadcn-vue, TypeScript strict mode, Pinia for state
