# Tasks: PokeAPI Type Chart Integration

**Input**: Design documents from `/specs/002-pokeapi-type-integration/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are NOT explicitly requested in the specification, so test tasks are EXCLUDED per template instructions.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and service layer structure

- [X] T001 Create service layer directory structure at src/services/typeChart/
- [X] T002 Create types file src/services/typeChart/types.ts with TypeChartCache, PokeAPITypeResponse, PokemonType interfaces
- [X] T003 [P] Copy POKEMON_TYPES constant from contracts/pokeapi-type-response.ts to src/services/typeChart/types.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core service layer that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Create pokeApiClient.ts in src/services/typeChart/ with fetch function using AbortController (5s timeout)
- [X] T005 [P] Create typeChartCache.ts in src/services/typeChart/ with localStorage read/write/validate functions
- [X] T006 [P] Create typeChartTransformer.ts in src/services/typeChart/ with PokeAPI → TYPE_CHART format conversion
- [X] T007 Create typeChartService.ts in src/services/typeChart/ orchestrating fetch/cache/transform/fallback logic
- [X] T008 Create Pinia store typeChart.ts in src/stores/ with state (typeChart, isLoading, source, error) and actions (loadTypeChart, refreshTypeChart)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Dynamic Type Data Loading on First Battle (Priority: P1) 🎯 MVP

**Goal**: Fetch Pokemon type effectiveness from PokeAPI on first battle access, cache in localStorage, use for damage calculations

**Independent Test**: Start app fresh (clear localStorage), navigate to battle, verify network call to PokeAPI, confirm battle uses fetched data, reload app, confirm no new API call (uses cache)

### Implementation for User Story 1

- [ ] T009 [US1] Implement fetchAllTypes() in src/services/typeChart/pokeApiClient.ts using Promise.allSettled() for 18 parallel type requests
- [ ] T010 [US1] Implement saveCache() in src/services/typeChart/typeChartCache.ts with 7-day expiration calculation (fetchedAt + 604800000ms)
- [ ] T011 [US1] Implement loadCache() in src/services/typeChart/typeChartCache.ts with JSON parsing and validation
- [ ] T012 [US1] Implement transformPokeAPIToTypeChart() in src/services/typeChart/typeChartTransformer.ts mapping double_damage_to→2, half_damage_to→0.5, no_damage_to→0, default→1
- [ ] T013 [US1] Implement loadTypeChart() action in src/stores/typeChart.ts with flow: check cache validity → load from cache OR fetch from API → transform → save to cache → update store state
- [ ] T014 [US1] Update computeTypeMultiplier() in src/domain/battle/calc/typeChart.ts to read from useTypeChartStore().typeChart instead of hardcoded TYPE_CHART
- [ ] T015 [US1] Add lazy loading trigger in battle store initialization (src/stores/battle.ts) to call typeChartStore.loadTypeChart() on first battle access
- [ ] T016 [US1] Add isLoading state handling in battle UI components to show loading indicator while type chart loads

**Checkpoint**: At this point, User Story 1 should be fully functional - battle fetches type data from PokeAPI, caches it, and reuses cache on reload

---

## Phase 4: User Story 2 - Graceful Fallback When API Unavailable (Priority: P2)

**Goal**: Ensure battles always work by falling back to hardcoded TYPE_CHART if PokeAPI is down, network is unavailable, or cache is invalid

**Independent Test**: Block network requests to pokeapi.co, start battle, verify battle works with hardcoded data and no user-facing errors

### Implementation for User Story 2

- [ ] T017 [P] [US2] Add timeout handling in src/services/typeChart/pokeApiClient.ts using AbortController.abort() after 5 seconds
- [ ] T018 [P] [US2] Add retry logic with exponential backoff in src/services/typeChart/pokeApiClient.ts for 429 rate limit responses
- [ ] T019 [US2] Implement isCacheValid() in src/services/typeChart/typeChartCache.ts checking version, schema, and expiration
- [ ] T020 [US2] Add try-catch error handling in src/services/typeChart/typeChartService.ts for all API/cache/transform operations
- [ ] T021 [US2] Implement fallback logic in src/services/typeChart/typeChartService.ts: if any operation fails, import and return hardcoded TYPE_CHART from src/data/typeChart.ts
- [ ] T022 [US2] Update loadTypeChart() in src/stores/typeChart.ts to set source='fallback' and log warning when using hardcoded data
- [ ] T023 [US2] Add error state management in src/stores/typeChart.ts with error message for debugging (not shown to user)
- [ ] T024 [US2] Verify battle initialization does not block or show errors when API is unavailable

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - battle fetches from API when available, falls back to hardcoded data when not

---

## Phase 5: User Story 3 - Pokemon Type Validation Against Official Data (Priority: P3)

**Goal**: Validate Pokemon types used in battles exist in the loaded type chart, ensuring data consistency with official Pokemon universe

**Independent Test**: Create a Pokemon with an invalid type (e.g., "faketype"), verify system logs validation warning and uses fallback for that type

### Implementation for User Story 3

- [ ] T025 [P] [US3] Create validatePokemonType() function in src/services/typeChart/typeChartService.ts checking if type exists in loaded type chart
- [ ] T026 [P] [US3] Create isValidTypeChart() function in src/services/typeChart/typeChartCache.ts verifying all 18 POKEMON_TYPES exist as keys
- [ ] T027 [US3] Add type validation in battle store (src/stores/battle.ts) when Pokemon are loaded, calling validatePokemonType() for each Pokemon's types
- [ ] T028 [US3] Add validation warning logging in src/stores/battle.ts when invalid type detected (console.warn with type name and Pokemon name)
- [ ] T029 [US3] Implement fallback-per-type logic in src/domain/battle/calc/typeChart.ts: if type missing from chart, use hardcoded TYPE_CHART for that specific calculation
- [ ] T030 [US3] Add schema validation in src/services/typeChart/typeChartCache.ts: verify cache has correct structure before using (version, typeChart, fetchedAt, expiresAt, source fields)

**Checkpoint**: All user stories should now be independently functional - type data loads from API, falls back gracefully, and validates data integrity

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T031 [P] Add console.log statements in src/services/typeChart/typeChartService.ts indicating data source: "Type chart loaded from: [api|cache|fallback]"
- [ ] T032 [P] Add TSDoc comments to all public functions in src/services/typeChart/ files
- [ ] T033 [P] Handle localStorage quota exceeded error in src/services/typeChart/typeChartCache.ts (catch and skip cache save, use fallback)
- [ ] T034 Add devtools debugging helper in src/stores/typeChart.ts exposing store state (source, lastUpdated, isLoading) for inspection
- [ ] T035 Update quickstart.md with actual usage examples matching implemented API
- [ ] T036 Verify bundle size increase is <10KB gzipped by running `npm run build` and comparing dist/ size
- [ ] T037 [P] Add runtime type guard isPokeAPITypeResponse() validation before transforming API responses in src/services/typeChart/typeChartTransformer.ts
- [ ] T038 Test cache expiration by manually setting expiresAt to past date in localStorage, verify fresh fetch occurs
- [ ] T039 Verify all existing battle tests still pass with new store-based type chart system
- [ ] T040 Run quickstart.md validation scenarios (basic usage, cache refresh, error handling)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May build on US1 but should be independently testable by blocking network
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on US1 (needs type chart loaded) but independently testable with invalid types

### Within Each User Story

**User Story 1 (P1)**:
- T009-T012 can run in parallel (different files)
- T013 depends on T009-T012 (needs all services)
- T014-T015 depend on T013 (need store)
- T016 depends on T014-T015 (needs store integration in battle)

**User Story 2 (P2)**:
- T017-T019 can run in parallel (different concerns)
- T020-T021 depend on T017-T019 (error handling needs timeout/retry/validation)
- T022-T024 depend on T020-T021 (store updates need service fallback logic)

**User Story 3 (P3)**:
- T025-T026 can run in parallel (different files)
- T027-T028 depend on T025-T026 (battle validation needs validation functions)
- T029-T030 can run in parallel (different files)

### Parallel Opportunities

**Phase 1 (Setup)**: T003 can run in parallel with T001-T002

**Phase 2 (Foundational)**: T005-T006 can run in parallel after T004 completes

**User Story 1**: T009-T012 (all service implementations) can run in parallel

**User Story 2**: T017-T019 (timeout, retry, validation) can run in parallel

**User Story 3**: T025-T026 (validation functions) can run in parallel, T029-T030 (fallback logic) can run in parallel

**Phase 6 (Polish)**: T031-T033, T035, T037 can all run in parallel

---

## Parallel Example: User Story 1

```bash
# After T008 (store creation) completes, launch these in parallel:

# Different files, no dependencies:
Task T009: "Implement fetchAllTypes() in src/services/typeChart/pokeApiClient.ts"
Task T010: "Implement saveCache() in src/services/typeChart/typeChartCache.ts"
Task T011: "Implement loadCache() in src/services/typeChart/typeChartCache.ts"
Task T012: "Implement transformPokeAPIToTypeChart() in src/services/typeChart/typeChartTransformer.ts"

# Then T013 (needs all above services):
Task T013: "Implement loadTypeChart() action in src/stores/typeChart.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T008) - CRITICAL
3. Complete Phase 3: User Story 1 (T009-T016)
4. **STOP and VALIDATE**: 
   - Clear localStorage
   - Start battle
   - Verify PokeAPI network call
   - Verify battle works with fetched data
   - Reload app
   - Verify no new API call (uses cache)
5. Deploy/demo if ready - MVP delivers dynamic type data loading!

### Incremental Delivery

1. **Foundation Ready** (Phase 1-2): Service layer structure + Pinia store
2. **MVP** (+ Phase 3): Dynamic type loading from PokeAPI with cache
3. **Resilient** (+ Phase 4): Graceful fallback when API unavailable
4. **Validated** (+ Phase 5): Type validation against official data
5. **Polished** (+ Phase 6): Documentation, debugging, optimization

Each increment adds value without breaking previous functionality.

### Parallel Team Strategy

With multiple developers:

1. **Team completes Setup + Foundational together** (T001-T008)
2. **Once Foundational is done**:
   - Developer A: User Story 1 (T009-T016) - Core API integration
   - Developer B: User Story 2 (T017-T024) - Error handling & fallback
   - Developer C: User Story 3 (T025-T030) - Validation logic
3. **Stories merge independently** - each adds resilience/features

---

## Summary

- **Total Tasks**: 40 tasks
- **MVP Scope**: T001-T016 (Phase 1-3, User Story 1 only) = 16 tasks
- **Full Feature**: All 40 tasks (all 3 user stories + polish)
- **Estimated Effort**: ~13 hours total (per plan.md)
  - Setup + Foundational: ~2 hours (T001-T008)
  - User Story 1: ~4 hours (T009-T016)
  - User Story 2: ~3 hours (T017-T024)
  - User Story 3: ~2 hours (T025-T030)
  - Polish: ~2 hours (T031-T040)
- **Parallel Opportunities**: 12 tasks marked [P] can run in parallel
- **Independent Testing**: Each user story has clear test criteria and can be validated independently

---

## Notes

- **[P] tasks**: Different files, no dependencies - can run in parallel
- **[Story] label**: Maps task to specific user story (US1, US2, US3) for traceability
- **No test tasks**: Specification does not explicitly request TDD or test implementation, so tests excluded per template guidelines
- **File paths**: All paths are absolute from repository root (src/, specs/)
- **Checkpoints**: Stop after each phase to validate story works independently before proceeding
- **Fallback strategy**: All-or-nothing (if any type fails, use complete hardcoded TYPE_CHART for consistency)
- **Cache expiration**: 7 days (604800000ms) from fetchedAt timestamp
- **API timeout**: 5 seconds via AbortController
- **Bundle target**: <10KB gzipped increase (verified in T036)
