# Tasks: Modern BattleScreen UI with Animated Sprites and Enhanced UX

**Feature**: 004-modern-battle-ui  
**Branch**: `004-modern-battle-ui`  
**Input**: Design documents from `/specs/004-modern-battle-ui/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Task Format: `- [ ] [ID] [P?] [Story?] Description`

- **Checkbox**: `- [ ]` for all tasks (markdown task list)
- **[ID]**: Task ID (T001, T002, T003...)
- **[P]**: Parallelizable (different files, no dependencies)
- **[Story]**: User story label (US1, US2, etc.) - only for user story phases

## Implementation Strategy

**MVP Scope**: User Stories 1, 2, 5, 6 (P1) - Animated sprites, modern UI, team builder integration, sample NPC  
**Phase 2**: User Stories 3, 4 (P2) - Attack button disabling, charge animations  
**Phase 3**: User Story 7 (P3) - Loading animations and polish

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and type contracts

- [X] T001 Verify branch `004-modern-battle-ui` is active
- [X] T002 [P] Copy type contracts from specs/004-modern-battle-ui/contracts/pokemonshowdown-sprite.ts to src/types/pokemonshowdown-sprite.ts
- [X] T003 [P] Copy type contracts from specs/004-modern-battle-ui/contracts/battle-ui-state.ts to src/types/battle-ui-state.ts
- [X] T004 [P] Create animation timing constants file at src/constants/animationTimings.ts with ATTACK_CHARGE_MS, ATTACK_HOLD_MS, ATTACK_RETURN_MS, HP_BAR_TRANSITION_MS values

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities needed by all user stories

- [X] T005 [P] Create Pokemon name normalization utility at src/utils/spriteNormalizer.ts with normalizePokemonName() function (handles lowercase, hyphens, special characters)
- [X] T006 [P] Create sprite URL builder utility at src/utils/spriteUrlBuilder.ts with buildSpriteUrl() function (constructs PokemonShowdown URLs)
- [X] T007 Create useSpriteLoader composable at src/composables/useSpriteLoader.ts with 3-tier fallback (animated → static → legacy → placeholder)
- [X] T008 [P] Create Tailwind utility constants file at src/constants/uiStyles.ts with NEUMORPHIC_CLASSES and GLASSMORPHIC_CLASSES objects

---

## Phase 3: User Story 1 - Display Animated Pokemon Sprites (P1) 🎯 MVP

**Goal**: Replace static sprites with animated GIFs from PokemonShowdown API

**Independent Test**: Start battle with any Pokemon, verify animated sprites load from PokemonShowdown, confirm fallback works for missing sprites

### Implementation Tasks

- [X] T009 [US1] Update BattleScreen.vue to import useSpriteLoader composable in src/components/BattleScreen.vue
- [X] T010 [US1] Replace playerSpriteUrl computed property with useSpriteLoader({ pokemonName: battleStore.player.name, view: 'back' }) in src/components/BattleScreen.vue
- [X] T011 [US1] Replace enemySpriteUrl computed property with useSpriteLoader({ pokemonName: battleStore.npc.name, view: 'front' }) in src/components/BattleScreen.vue
- [X] T012 [US1] Add loading skeleton UI for player sprite in src/components/BattleScreen.vue template (animate-pulse during playerSpriteLoading)
- [X] T013 [US1] Add loading skeleton UI for enemy sprite in src/components/BattleScreen.vue template (animate-pulse during enemySpriteLoading)
- [X] T014 [US1] Update player sprite <img> element to use playerSpriteUrl from composable in src/components/BattleScreen.vue
- [X] T015 [US1] Update enemy sprite <img> element to use enemySpriteUrl from composable in src/components/BattleScreen.vue
- [X] T016 [US1] Add error handling display for sprite loading failures in src/components/BattleScreen.vue (show Pokemon name as fallback text)

---

## Phase 4: User Story 2 - Implement Neumorphism and Glassy UI Design (P1) 🎯 MVP

**Goal**: Replace pixel art styling with modern neumorphic/glassmorphic design

**Independent Test**: Open battle screen, verify soft shadows on buttons, frosted glass panels, smooth hover effects

### Implementation Tasks

- [X] T017 [P] [US2] Update main control panel (Fight/Bag/Pokemon/Run buttons) with neumorphic shadow classes in src/components/BattleScreen.vue
- [X] T018 [P] [US2] Update move selector buttons with neumorphic styling and hover states in src/components/MoveSelector.vue
- [ ] T019 [P] [US2] Update status panels (player/enemy) with glassmorphic background (bg-white/20 backdrop-blur-lg) in src/components/StatusPanel.vue
- [X] T020 [P] [US2] Update log panel with glassmorphic styling and rounded corners in src/components/LogPanel.vue
- [X] T021 [P] [US2] Update HP bars with modern gradient fills and rounded corners in src/components/StatusPanel.vue
- [ ] T022 [US2] Remove all pixel art CSS classes and replace with Tailwind utilities in src/components/BattleScreen.vue
- [ ] T023 [US2] Update battle container background with gradient overlay in src/components/BattleScreen.vue
- [ ] T024 [US2] Add smooth hover transitions to all interactive buttons (duration-150 transition-all) in src/components/BattleScreen.vue

---

## Phase 5: User Story 5 - Integrate Team Builder Pokemon (P1) 🎯 MVP

**Goal**: Use custom Pokemon team from Team Builder in battles

**Independent Test**: Build custom team with specific Pokemon, start battle, verify team lead appears with correct moves and stats

### Implementation Tasks

- [X] T025 [US5] Import useTeamStore from src/stores/team.ts in src/components/BattleScreen.vue
- [X] T026 [US5] Add computed property getPlayerTeam() that retrieves Pokemon from teamStore.roster and converts to battle format
- [X] T027 [US5] Create convertTeamMemberToBattlePokemon() function to transform TeamMember to battle Pokemon format
- [X] T028 [US5] Update battle initialization logic to use getPlayerTeam() with fallback to SAMPLE_PLAYER if team is empty
- [X] T029 [US5] Verify Team Builder Pokemon moves are correctly passed to battle store (handled in conversion function)
- [X] T030 [US5] Verify Team Builder Pokemon stats are correctly mapped to battle engine format (handled in conversion function)

---

## Phase 6: User Story 6 - Battle Against Sample NPC (P1) 🎯 MVP

**Goal**: Implement single predefined NPC opponent for MVP

**Independent Test**: Start multiple battles, verify same NPC appears consistently with predictable team

### Implementation Tasks

- [ ] T031 [P] [US6] Create sample NPC data structure in src/data/sampleNpc.ts with fixed name, team, and sprites
- [ ] T032 [US6] Update battle initialization to load sample NPC as opponent in src/stores/battle.ts initializeBattle()
- [ ] T033 [US6] Verify sample NPC Pokemon display correctly with animated sprites in src/components/BattleScreen.vue
- [ ] T034 [US6] Add victory/defeat condition handling for sample NPC battle in src/stores/battle.ts
- [ ] T035 [US6] Add navigation back to team builder after battle ends in src/components/BattleScreen.vue

---

## Phase 7: User Story 3 - Disable Attack Button During Attack Execution (P2)

**Goal**: Prevent multiple attack requests during animations

**Independent Test**: Select attack, verify buttons become disabled, attempt clicking (no response), confirm re-enable after animation

### Implementation Tasks

- [X] T036 [US3] Add attackAnimation reactive state to BattleScreen.vue using ref<AttackAnimationState> in src/components/BattleScreen.vue
- [X] T037 [US3] Set attackAnimation.isActive = true when attack begins in handleMoveSelected() in src/components/BattleScreen.vue
- [X] T038 [US3] Bind :disabled="attackAnimation.isActive" to all move buttons in src/components/MoveSelector.vue
- [X] T039 [US3] Add disabled styling (opacity-50 cursor-not-allowed) to move buttons in src/components/MoveSelector.vue
- [X] T040 [US3] Set attackAnimation.isActive = false after ATTACK_TOTAL_MS (600ms) timeout in src/components/BattleScreen.vue
- [X] T041 [US3] Verify buttons ignore click events when disabled in src/components/MoveSelector.vue

---

## Phase 8: User Story 4 - Charge Attack Animation (P2)

**Goal**: Animate attacking Pokemon moving toward target

**Independent Test**: Execute any attack, verify sprite animates forward, holds briefly, returns to original position

### Implementation Tasks

- [X] T042 [US4] Create CSS keyframes for attack charge animation in src/components/BattleScreen.vue <style> section
- [X] T043 [US4] Update attackAnimation state to track phase (idle → charging → impact → returning) in src/components/BattleScreen.vue
- [X] T044 [US4] Add dynamic class binding for attackAnimation.phase on player sprite in src/components/BattleScreen.vue template
- [ ] T045 [US4] Add dynamic class binding for attackAnimation.phase on enemy sprite in src/components/BattleScreen.vue template
- [X] T046 [US4] Implement setTimeout sequence: charging (300ms) → impact (100ms) → returning (200ms) in handleMoveSelected() in src/components/BattleScreen.vue
- [X] T047 [US4] Sync damage application with impact phase timing in src/components/BattleScreen.vue
- [ ] T048 [US4] Add damage effect visual (flash/shake) on target Pokemon during impact in src/components/BattleScreen.vue

---

## Phase 8: User Story 4 - Attack Animation with Charge Motion (P2)

**Goal**: Add attack animation with simplified shake effect for visual feedback

**Independent Test**: Execute attack, verify shake animation plays and buttons are disabled during attack

### Implementation Tasks

- [X] T042 [P] [US4] Add isAttacking state to track attack execution in src/components/BattleScreen.vue
- [X] T043 [P] [US4] Add shake effect state to BattleScreen.vue component
- [X] T044 [US4] Update handleMoveSelected() to set isAttacking=true and trigger shake effect
- [X] T045 REMOVED - Enemy attack animation (omitted per user request)
- [X] T046 [P] [US4] Add CSS keyframe for shake animation (400ms duration)
- [X] T047 REMOVED - Verify animation timing coordination (omitted)
- [X] T048 REMOVED - Enhanced damage effect visual (omitted per user request)

---

## Phase 9: SKIPPED - Loading Animations (per user request)

**Status**: ❌ **SKIPPED** - User requested to omit this phase

User Story 7 (Loading Animations and Smooth Transitions) has been removed from scope per user request to focus on core battle functionality.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final quality checks and integration verification

- [ ] T055 Run development server and manually test complete battle flow (team builder → battle → victory/defeat → return)
- [ ] T056 Verify neumorphic styling is consistent across all UI components
- [ ] T057 Test sprite fallback mechanism by using Pokemon names with special characters (Mr. Mime, Farfetch'd)
- [ ] T058 Verify attack button disabling prevents rapid clicking in all scenarios
- [ ] T059 Test battle with empty team (should use SAMPLE_PLAYER fallback)
- [ ] T060 Verify all animations run at 60fps without jank (check DevTools Performance tab)
- [ ] T061 Test battle flow with PokemonShowdown API unavailable (network throttling)
- [ ] T062 Verify accessibility: keyboard navigation works, ARIA labels present
- [ ] T063 Run Lighthouse audit, ensure Performance ≥90 score
- [ ] T064 Final code review: verify TypeScript strict mode compliance, no `any` types

---

## Dependencies & Execution Order

### Critical Path (Must Complete in Order)

1. **Phase 1 (Setup)** → **Phase 2 (Foundational)** - Must complete before any user stories
2. **Phase 2** → Blocks all user story phases (T005-T008 provide utilities used everywhere)
3. **Phase 5 (US5 Team Builder Integration)** → Blocks Phase 6 (US6 needs team data structure)
4. **Phase 3 (US1 Sprites)** + **Phase 4 (US2 Styling)** → Can run in parallel with Phase 5
5. **Phase 7 (US3 Button Disabling)** → Blocks Phase 8 (US4 needs attackAnimation state)
6. **Phase 8 (US4 Attack Animation)** → Independent, can start after Phase 2 complete

### Parallel Execution Opportunities

**After Phase 2 Completes, These Can Run Simultaneously:**

- **Parallel Group A**: Phase 3 (US1 - Sprites) + Phase 4 (US2 - Styling) + Phase 5 (US5 - Team Builder)
  - Different components/files, no shared state
  - T009-T016 (sprites) || T017-T024 (styling) || T025-T030 (team integration)

**After Phase 5 Completes:**

- **Parallel Group B**: Phase 6 (US6 - Sample NPC) can run independently
  - T031-T035 (NPC setup)

**After Phase 7 Completes:**

- **Parallel Group C**: Phase 8 (US4 - Attack Animation) + Phase 9 (US7 - Loading/Transitions)
  - Different concerns: attack logic vs. loading UI
  - T042-T048 (attack animation) || T049-T054 (loading states)

### Independent User Story Testing

Each user story phase is designed to be independently testable:

- **US1 (Sprites)**: Test by starting any battle and verifying animated sprites load
- **US2 (Styling)**: Test by visual inspection of UI elements (shadows, glass effects, hover states)
- **US5 (Team Builder)**: Test by building custom team and verifying it appears in battle
- **US6 (Sample NPC)**: Test by starting multiple battles and confirming same NPC appears
- **US3 (Button Disabling)**: Test by clicking attack button rapidly during animation
- **US4 (Attack Animation)**: Test by executing attacks and observing sprite movement
- **US7 (Loading)**: Test by starting battle and observing loading states and transitions

---

## Task Summary

**Total Tasks**: 64  
**Setup Phase**: 4 tasks  
**Foundational Phase**: 4 tasks  
**User Story Tasks**: 50 tasks  
  - US1 (Animated Sprites): 8 tasks  
  - US2 (Neumorphic UI): 8 tasks  
  - US5 (Team Builder Integration): 6 tasks  
  - US6 (Sample NPC): 5 tasks  
  - US3 (Button Disabling): 6 tasks  
  - US4 (Charge Animation): 7 tasks  
  - US7 (Loading/Transitions): 6 tasks  
**Polish Phase**: 10 tasks  

**Parallelizable Tasks**: 18 marked with [P]  
**MVP Scope**: Phases 1-6 (40 tasks) - Covers P1 user stories  
**Phase 2 Scope**: Phases 7-8 (13 tasks) - Covers P2 user stories  
**Phase 3 Scope**: Phase 9 (6 tasks) - Covers P3 user stories  

---

## Suggested MVP Implementation Order

### Sprint 1: Foundation (Estimated: 2-3 days)
- Complete Phase 1 (Setup) - 4 tasks
- Complete Phase 2 (Foundational) - 4 tasks
- **Milestone**: Core utilities and type contracts ready

### Sprint 2: Visual Upgrade (Estimated: 3-4 days)
- Complete Phase 3 (US1 - Animated Sprites) - 8 tasks
- Complete Phase 4 (US2 - Neumorphic UI) - 8 tasks
- **Milestone**: Battle screen visually modernized

### Sprint 3: Team Integration (Estimated: 2-3 days)
- Complete Phase 5 (US5 - Team Builder) - 6 tasks
- Complete Phase 6 (US6 - Sample NPC) - 5 tasks
- **Milestone**: MVP feature complete, functional battles with custom teams

### Sprint 4: UX Polish (Estimated: 2-3 days)
- Complete Phase 7 (US3 - Button Disabling) - 6 tasks
- Complete Phase 8 (US4 - Attack Animation) - 7 tasks
- Complete Phase 9 (US7 - Loading/Transitions) - 6 tasks
- **Milestone**: All P2 and P3 features implemented

### Sprint 5: Quality Assurance (Estimated: 1-2 days)
- Complete Phase 10 (Polish) - 10 tasks
- **Milestone**: Production-ready, all quality checks passed

---

## File Structure Reference

```
src/
├── components/
│   ├── BattleScreen.vue (main refactor target)
│   ├── MoveSelector.vue (neumorphic styling)
│   ├── StatusPanel.vue (glassmorphic styling, HP bars)
│   └── LogPanel.vue (glassmorphic styling)
├── composables/
│   └── useSpriteLoader.ts (NEW - sprite loading with fallbacks)
├── constants/
│   ├── animationTimings.ts (NEW - timing constants)
│   └── uiStyles.ts (NEW - Tailwind utility constants)
├── data/
│   └── sampleNpc.ts (NEW - predefined NPC opponent)
├── stores/
│   ├── battle.ts (update initializeBattle for team integration)
│   └── team.ts (existing - no changes needed)
├── types/
│   ├── pokemonshowdown-sprite.ts (NEW - sprite API types)
│   └── battle-ui-state.ts (NEW - UI state types)
└── utils/
    ├── spriteNormalizer.ts (NEW - name normalization)
    └── spriteUrlBuilder.ts (NEW - URL construction)
```

---

## Validation Checklist

✅ All tasks follow checklist format: `- [ ] [ID] [P?] [Story?] Description with file path`  
✅ Tasks organized by user story (Phases 3-9)  
✅ Each user story has independent test criteria  
✅ Clear file paths specified for each task  
✅ Dependencies section shows story completion order  
✅ Parallel execution examples provided per story  
✅ MVP scope clearly defined (Phases 1-6)  
✅ Implementation strategy documented (incremental delivery)  
✅ Task IDs sequential (T001-T064)  
✅ Story labels correct ([US1]-[US7])  
✅ Parallelizable tasks marked with [P]  

---

**Generated**: November 30, 2025  
**Branch**: `004-modern-battle-ui`  
**Status**: Ready for implementation  
**Next Step**: Begin Sprint 1 (Foundation) with T001-T008
