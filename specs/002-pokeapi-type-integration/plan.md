# Implementation Plan: PokeAPI Type Chart Integration

**Branch**: `002-pokeapi-type-integration` | **Date**: November 29, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-pokeapi-type-integration/spec.md`

## Summary

Integrate PokeAPI service to dynamically fetch Pokémon type effectiveness data from `https://pokeapi.co/api/v2/type/{id}` endpoint. System will cache data in localStorage with 7-day expiration, validate freshness on battle module load, and gracefully fall back to existing hardcoded TYPE_CHART if API is unavailable. This ensures battles always function while leveraging official Pokémon data when possible.

## Technical Context

**Language/Version**: TypeScript 5.9+ (strict mode)  
**Primary Dependencies**: Vue 3.5+, Pinia 3+, Vite 7+, native Fetch API  
**Storage**: Browser localStorage for type chart cache  
**Testing**: Vitest 2.1.4 with MSW (Mock Service Worker) for API mocking  
**Target Platform**: Modern evergreen browsers (last 2 versions)  
**Project Type**: Single-page web application (Vue 3 + Vite)  
**Performance Goals**: API fetch <3s, cache load <50ms, no battle startup delay  
**Constraints**: 5s timeout on API calls, <10KB cache size, must not block battle initialization  
**Scale/Scope**: 18 Pokemon types to fetch, single endpoint per type, one-time batch load

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **Component-First Architecture**: Type service will be implemented as pure service module in `src/services/`, consumed by battle store (no global state)  
✅ **Type Safety**: All PokeAPI responses validated with runtime type guards, full TypeScript typing for cache structures  
✅ **State Management**: Type chart loading managed by new Pinia store (`typeChartStore`) following domain-driven pattern  
✅ **Testing Culture**: Unit tests required for service layer (API fetch, cache, transformation), integration tests for battle store integration  
✅ **Performance & Accessibility**: Lazy loading ensures no impact on initial bundle size, no UI blocking during fetch (shows battle with fallback immediately)

**Constitution Compliance**: ✅ PASS - No violations. Proposal aligns with all core principles.

## Project Structure

### Documentation (this feature)

```text
specs/002-pokeapi-type-integration/
├── plan.md              # This file
├── research.md          # Phase 0: API schema analysis, cache strategy
├── data-model.md        # Phase 1: TypeChartCache, PokeAPIResponse types
├── quickstart.md        # Phase 1: Usage guide for developers
├── contracts/           # Phase 1: PokeAPI response schemas (TypeScript interfaces)
│   └── pokeapi-type-response.ts
└── tasks.md             # Phase 2: (created by /speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── services/
│   └── typeChart/
│       ├── pokeApiClient.ts      # Fetch logic with timeout/retry
│       ├── typeChartCache.ts     # localStorage operations
│       ├── typeChartTransformer.ts # PokeAPI → TYPE_CHART format
│       └── typeChartService.ts   # Main service orchestrating fetch/cache/fallback
├── stores/
│   └── typeChart.ts              # Pinia store managing type chart state
├── data/
│   └── typeChart.ts              # Existing hardcoded TYPE_CHART (becomes fallback)
└── domain/battle/
    └── calc/
        └── typeChart.ts          # Update computeTypeMultiplier to use store

tests/
├── unit/
│   └── services/
│       └── typeChart/
│           ├── pokeApiClient.test.ts
│           ├── typeChartCache.test.ts
│           ├── typeChartTransformer.test.ts
│           └── typeChartService.test.ts
└── integration/
    └── stores/
        └── typeChart.test.ts     # Test full load/fallback flow
```

**Structure Decision**: Using existing single-project Vue/Vite structure. New service layer in `src/services/typeChart/` follows domain-driven design with separation of concerns (API client, cache, transformation, orchestration). Pinia store provides reactive access to type chart data for battle calculations.

## Complexity Tracking

> No violations - this section is not applicable

---

## Phase 0: Outline & Research

### Research Tasks

1. **PokeAPI Schema Analysis**
   - Endpoint: `GET https://pokeapi.co/api/v2/type/{id or name}`
   - Response structure: `{ name, damage_relations: { double_damage_to[], half_damage_to[], no_damage_to[] } }`
   - Type IDs: 1-18 for all Pokemon types
   - Rate limits: Free tier, no documented limits but implement backoff strategy

2. **Cache Strategy Research**
   - localStorage max size: ~5-10MB (varies by browser)
   - Cache key: `pokemon-type-chart-v1` (version for future schema changes)
   - Expiration: 7 days (604800000ms) stored as ISO timestamp
   - Fallback order: Memory cache → localStorage → API fetch → hardcoded fallback

3. **Transformation Logic**
   - PokeAPI format: Arrays of types for double/half/no damage
   - Our format: Nested object `Record<AttackingType, Record<DefendingType, Multiplier>>`
   - Multiplier mapping: double_damage_to=2, half_damage_to=0.5, no_damage_to=0, default=1

### Research Findings (to be documented in research.md)

- **Decision**: Use native Fetch API (no axios needed, reduces bundle size)
- **Rationale**: Browser Fetch API supports timeout via AbortController, sufficient for our needs
- **Alternatives considered**: axios (rejected: adds 14KB gzipped), ky (rejected: overkill for single endpoint)

- **Decision**: Batch all 18 type requests with Promise.allSettled()
- **Rationale**: Allows partial success if some types fail, faster than sequential
- **Alternatives considered**: Sequential (rejected: too slow, ~10s total), Promise.all (rejected: fails entirely if one request fails)

- **Decision**: Validate cache with JSON schema validation
- **Rationale**: Prevents corrupted cache from breaking battles
- **Alternatives considered**: Trust cache blindly (rejected: risky with user-editable localStorage)

---

## Phase 1: Design & Contracts

### Data Model (to be documented in data-model.md)

#### TypeChartCache
```typescript
interface TypeChartCache {
  version: string                // "1.0.0" - for future schema migrations
  typeChart: TypeEffectivenessMap
  fetchedAt: string              // ISO 8601 timestamp
  expiresAt: string              // ISO 8601 timestamp (fetchedAt + 7 days)
  source: 'api' | 'fallback'     // Track data origin for debugging
}
```

#### PokeAPITypeResponse
```typescript
interface PokeAPITypeResponse {
  id: number
  name: string                   // e.g., "fire", "water"
  damage_relations: {
    double_damage_to: Array<{ name: string; url: string }>
    half_damage_to: Array<{ name: string; url: string }>
    no_damage_to: Array<{ name: string; url: string }>
    double_damage_from: Array<{ name: string; url: string }>  // unused
    half_damage_from: Array<{ name: string; url: string }>    // unused
    no_damage_from: Array<{ name: string; url: string }>      // unused
  }
}
```

#### TypeEffectivenessMap
```typescript
// Existing format (no changes)
type TypeEffectivenessMap = Record<string, Record<string, number>>
```

### API Contracts (to be created in contracts/)

File: `contracts/pokeapi-type-response.ts`
```typescript
export const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
] as const

export type PokemonType = typeof POKEMON_TYPES[number]

export interface PokeAPITypeResponse {
  id: number
  name: PokemonType
  damage_relations: {
    double_damage_to: Array<{ name: PokemonType }>
    half_damage_to: Array<{ name: PokemonType }>
    no_damage_to: Array<{ name: PokemonType }>
  }
}
```

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Battle Store                         │
│  (uses typeChartStore.typeChart for damage calculations)   │
└────────────────────────────┬────────────────────────────────┘
                             │ getTypeChart()
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      Type Chart Store (Pinia)               │
│  State: { typeChart, isLoading, source, error }            │
│  Actions: loadTypeChart(), refreshTypeChart()              │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   Type Chart Service                        │
│  Orchestrates: Fetch → Cache → Transform → Fallback        │
└──────┬────────────┬────────────┬─────────────┬─────────────┘
       │            │            │             │
       ▼            ▼            ▼             ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
│ PokeAPI  │ │  Cache   │ │Transform │ │  Hardcoded   │
│  Client  │ │ Manager  │ │  Service │ │  TYPE_CHART  │
│          │ │          │ │          │ │  (Fallback)  │
└──────────┘ └──────────┘ └──────────┘ └──────────────┘
```

### Quickstart Guide (to be created in quickstart.md)

#### For Developers Adding New Features

```typescript
// Using type chart in a new component/service
import { useTypeChartStore } from '@/stores/typeChart'

const typeChartStore = useTypeChartStore()

// Type chart loads automatically on first access to battle module
// Access it reactively:
const typeChart = computed(() => typeChartStore.typeChart)

// Check loading state:
if (typeChartStore.isLoading) {
  // Show loading indicator
}

// Use in calculations (existing computeTypeMultiplier automatically uses store):
import { computeTypeMultiplier } from '@/domain/battle/calc/typeChart'
const multiplier = computeTypeMultiplier('fire', 'grass') // returns 2
```

#### Refreshing Cache Manually

```typescript
const typeChartStore = useTypeChartStore()
await typeChartStore.refreshTypeChart() // Forces fresh API fetch
```

---

## Phase 2: Implementation Planning

### Task Breakdown

**Phase 2a: Service Layer (Foundation)**
- T001: Create `pokeApiClient.ts` with fetch + timeout + retry logic
- T002: Create `typeChartCache.ts` with localStorage read/write/validate
- T003: Create `typeChartTransformer.ts` to convert PokeAPI → TYPE_CHART format
- T004: Create `typeChartService.ts` orchestrating all services
- T005: Unit tests for all service modules (4 test files)

**Phase 2b: Store Integration**
- T006: Create Pinia `typeChartStore` with state/actions
- T007: Update `computeTypeMultiplier` to read from store instead of hardcoded
- T008: Add lazy loading trigger in battle store initialization
- T009: Integration tests for store + service interaction

**Phase 2c: Error Handling & Monitoring**
- T010: Add console logging for API errors (non-blocking)
- T011: Add validation for Pokemon types against loaded chart
- T012: Handle localStorage quota exceeded gracefully
- T013: Add telemetry/debugging helpers (source indicator in devtools)

**Phase 2d: Testing & Validation**
- T014: Create MSW mocks for PokeAPI endpoints
- T015: Test fallback scenarios (API down, timeout, malformed response)
- T016: Test cache expiration and refresh logic
- T017: Verify all existing battle tests still pass
- T018: Performance testing (load time, cache hit rate)

**Phase 2e: Documentation & Polish**
- T019: Document usage in quickstart.md
- T020: Add TSDoc comments to all public APIs
- T021: Update battle module docs with new data source
- T022: Final bundle size check (<10KB added)

### Dependencies & Order

```
T001-T004 (Service Layer) → T005 (Unit Tests)
T005 → T006-T007 (Store Integration)
T006-T007 → T008-T009 (Store Tests)
T009 → T010-T013 (Error Handling)
T013 → T014-T018 (Integration Testing)
T018 → T019-T022 (Documentation)
```

### Estimated Effort

- Phase 2a: 4 hours (service layer is straightforward)
- Phase 2b: 2 hours (store creation + integration)
- Phase 2c: 2 hours (error handling)
- Phase 2d: 4 hours (comprehensive testing)
- Phase 2e: 1 hour (docs)

**Total: ~13 hours** (1.5 days for single developer)

### Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| PokeAPI schema change | Low | High | Version cache key, validate response shape |
| localStorage disabled | Medium | Medium | Detect and skip cache, use fallback |
| Slow API response | Medium | Low | 5s timeout + immediate fallback |
| Cache corruption | Low | Medium | JSON validation before use |
| Type mismatch (API vs hardcoded) | Low | High | Unit tests comparing both sources |

---

## Success Metrics

- [ ] All 18 Pokemon types fetched successfully from PokeAPI
- [ ] Cache hit rate >95% after initial load
- [ ] API fetch completes in <3s (tested with network throttling)
- [ ] Fallback activates within 5s on API failure
- [ ] Zero test regressions (all existing battle tests pass)
- [ ] Bundle size increase <10KB gzipped
- [ ] Type effectiveness matches official Pokemon mechanics (verified against PokeAPI data)
- [ ] Console shows clear source indicator: "Type chart loaded from: [api|cache|fallback]"

---

## Phase 1: Agent Context Update

After completing Phase 1 design, run:
```powershell
.\.specify\scripts\powershell\update-agent-context.ps1 -AgentType copilot
```

This updates `.github/prompts/copilot-context.md` with:
- New services: `pokeApiClient`, `typeChartCache`, `typeChartService`
- New store: `typeChartStore`
- New testing approach: MSW for API mocking
- Cache strategy: localStorage with 7-day expiration

---

**Next Steps**: 
1. Execute Phase 0 research (fetch sample API responses, validate schema)
2. Create data model documentation (`data-model.md`)
3. Generate API contracts (`contracts/pokeapi-type-response.ts`)
4. Write quickstart guide (`quickstart.md`)
5. Re-run Constitution Check with concrete design
6. Proceed to `/speckit.tasks` for detailed task breakdown

