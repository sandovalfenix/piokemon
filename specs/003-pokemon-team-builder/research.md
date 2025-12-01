# Technical Research: Pokemon Team Builder

**Feature**: 003-pokemon-team-builder  
**Date**: November 29, 2025  
**Purpose**: Document technical decisions, API patterns, and best practices for implementing Pokemon team builder with PokeAPI integration

## Phase 0: Research & Technical Decisions

### 1. PokeAPI Endpoint Analysis

#### Decision: Use `/pokemon` and `/move` endpoints with pagination
**Rationale**:
- `/pokemon?limit=20&offset=0` returns paginated Pokemon list (1000+ total)
- `/pokemon/{id}` returns full Pokemon details including moves array
- `/move/{id}` returns complete move data with power, accuracy, type, damage class
- These endpoints are stable, well-documented, and match Feature 002 type chart pattern

**Alternatives Considered**:
- GraphQL endpoints: Not officially supported by PokeAPI v2
- Local Pokemon database: Adds complexity, requires maintenance for new generations
- Third-party Pokemon APIs: Less reliable, potential breaking changes

**Implementation Notes**:
- Reuse `pokeApiClient.ts` pattern from Feature 002 (timeout: 5s, retry with exponential backoff)
- Pokemon list endpoint returns minimal data (name, url), requires secondary fetch for details
- Move data includes nullable `power` field (status moves have no damage)
- Sprites available at `pokemon.sprites.front_default` URL

---

### 2. Data Transformation Strategy

#### Decision: Create transformation layer PokeAPI → Battle System entities
**Rationale**:
- Existing battle system expects specific interfaces: `Pokemon`, `Move` in `src/domain/battle/engine/entities.ts`
- PokeAPI uses different naming conventions (e.g., `special-attack` vs `spAttack`)
- Transformation layer provides loose coupling, allows PokeAPI changes without battle system refactor

**Transformation Mappings**:

**PokeAPI Pokemon → Battle Pokemon**:
```typescript
{
  id: number,                    // Direct mapping
  name: string,                  // Capitalize first letter
  types: string[],               // Extract from types[].type.name array
  stats: {                       // Transform stats array to object
    hp: stats.find(s => s.stat.name === 'hp').base_stat,
    attack: stats.find(s => s.stat.name === 'attack').base_stat,
    defense: stats.find(s => s.stat.name === 'defense').base_stat,
    spAttack: stats.find(s => s.stat.name === 'special-attack').base_stat,
    spDefense: stats.find(s => s.stat.name === 'special-defense').base_stat,
    speed: stats.find(s => s.stat.name === 'speed').base_stat
  },
  moves: Move[],                 // Transform from moves array
  level: 50,                     // Default for all Pokemon
  currentHp: computed from hp    // Initialize to max HP
}
```

**PokeAPI Move → Battle Move**:
```typescript
{
  id: number,                    // Direct mapping
  name: string,                  // Capitalize first letter
  type: string,                  // Extract from type.name
  power: number | null,          // Nullable for status moves
  accuracy: number,              // Direct mapping (percentage)
  category: 'Physical' | 'Special' | 'Status', // Map from damage_class.name
  pp: number                     // Direct mapping (informational only for MVP)
}
```

**Alternatives Considered**:
- Direct PokeAPI data usage: Breaks battle system assumptions, requires battle refactor
- Adapter pattern in battle system: Couples battle to PokeAPI, reduces reusability
- Backend transformation: Out of scope (frontend-only feature)

---

### 3. State Management Architecture

#### Decision: New Pinia store `team.ts` for team roster, integrate with `battle.ts`
**Rationale**:
- Pinia stores follow single-responsibility principle (Constitution §III)
- Team building state (roster, selection) is distinct from battle state (turn, HP)
- Battle store already exists, modification safer than replacement

**Store Responsibilities**:

**`stores/team.ts` (NEW)**:
```typescript
State:
- roster: TeamMember[] (max 6)
- selectedPokemon: Pokemon | null (current selection context)
- selectedMoves: Move[] (max 4, during build)
- isLoading: boolean
- error: string | null

Actions:
- loadTeamFromCache(): Load persisted team from localStorage
- addPokemonToTeam(pokemon: Pokemon, moves: Move[]): Add to roster
- removePokemonFromTeam(index: number): Remove from roster
- reorderTeam(fromIndex: number, toIndex: number): Change lead
- clearTeam(): Reset roster
- saveTeamToCache(): Persist to localStorage
```

**`stores/battle.ts` (MODIFY)**:
```typescript
Modification:
- Add method: startBattleWithCustomTeam(team: TeamMember[])
- Replace SAMPLE_PLAYER with team[0] (lead Pokemon)
- Validate team before battle start (min 1 Pokemon, all have ≥1 move)
```

**Alternatives Considered**:
- Single unified store: Violates single-responsibility, increases complexity
- Component-local state: Loses persistence across navigation, complicates battle integration
- Vuex: Deprecated in favor of Pinia per constitution

---

### 4. Caching & Performance Strategy

#### Decision: Two-tier caching (memory + localStorage)
**Rationale**:
- Pokemon/move data rarely changes, aggressive caching reduces API calls
- localStorage persists across sessions, reduces initial load times
- Memory cache (Map) faster than localStorage parsing, used for session
- Pattern proven in Feature 002 type chart (7-day cache with validation)

**Cache Implementation**:

**Pokemon Catalog Cache** (`teamCache.ts`):
```typescript
Memory Cache:
- Map<number, Pokemon> for fetched Pokemon details
- Eviction: None (session-scoped, ~1000 Pokemon * 2KB = ~2MB)

localStorage Cache:
- Key: 'pokemon-cache-v1'
- Schema: { timestamp: number, pokemon: Record<id, Pokemon> }
- Expiration: 7 days (same as type chart)
- Validation: Check timestamp, schema version
```

**Team Roster Persistence**:
```typescript
localStorage:
- Key: 'pokemon-team-v1'
- Schema: { 
    version: 1, 
    team: TeamMember[], 
    createdAt: number, 
    updatedAt: number 
  }
- No expiration (user data)
- Quota handling: Try-catch, fallback to in-memory only
```

**Alternatives Considered**:
- IndexedDB: Overkill for <10MB data, more complex API
- Session storage: Lost on tab close, poor UX
- No caching: Excessive API calls, slow UX, rate limit risk
- Server-side caching: Out of scope (frontend-only)

---

### 5. Pagination Strategy

#### Decision: Client-side pagination with 20 Pokemon per page
**Rationale**:
- PokeAPI `/pokemon?limit=20&offset=0` naturally supports pagination
- 20 Pokemon balances performance (card rendering) and UX (scrolling)
- Offset-based pagination simple, no cursor complexity
- Total count available in API response for page calculation

**Implementation Pattern**:
```typescript
State:
- currentPage: number (1-based for UX)
- pageSize: 20 (constant)
- totalPokemon: number (from API response.count)

Computed:
- totalPages: Math.ceil(totalPokemon / pageSize)
- offset: (currentPage - 1) * pageSize

Actions:
- loadPage(page: number): Fetch with offset, update currentPage
- nextPage(): Increment currentPage, load
- prevPage(): Decrement currentPage, load
```

**Alternatives Considered**:
- Infinite scroll: More complex state management, harder to test
- Virtual scrolling: Overkill for 20-item pages, adds complexity
- Load all 1000+ Pokemon: Poor performance, 5-10s load time
- Server-side pagination: Out of scope (no backend)

---

### 6. Error Handling & Fallback

#### Decision: Graceful degradation with retry, cached fallback, user feedback
**Rationale**:
- PokeAPI rate limits (429) and network failures expected
- Users should never see blank screen or crash
- Pattern proven in Feature 002 (retry with exponential backoff)

**Error Handling Tiers**:

**Tier 1: Retry with Backoff** (Network Errors, 429):
```typescript
- Retry count: 3 attempts
- Backoff: 1s, 2s, 4s (exponential)
- Timeout: 5s per request
- Scope: All PokeAPI fetch operations
```

**Tier 2: Cached Fallback** (API Down):
```typescript
- Load from localStorage cache if available
- Show warning: "Using cached data (offline mode)"
- Allow team building with cached Pokemon
- Disable "Refresh Data" if cache empty
```

**Tier 3: User Feedback** (All Failures):
```typescript
- Toast notifications for errors
- "Retry" button for failed operations
- Loading skeletons during fetch (<100ms display)
- Empty state: "No Pokemon available. Check connection."
```

**Alternatives Considered**:
- Fail fast: Poor UX, blocks feature usage
- Silent failures: User confusion, lost actions
- Infinite retry: Wastes resources, poor UX

---

### 7. UI Component Architecture

#### Decision: Atomic design pattern with Vue Composition API
**Rationale**:
- Constitution §I mandates component-first architecture
- Atomic design (atoms → molecules → organisms) scales well
- Composition API with `<script setup>` reduces boilerplate

**Component Hierarchy**:

```
TeamBuilderView.vue (Page/Template)
├── PokemonCatalog.vue (Organism)
│   ├── PokemonCard.vue (Molecule) [repeats]
│   │   ├── PokemonSprite.vue (Atom)
│   │   ├── TypeBadge.vue (Atom) [reuse from battle]
│   │   └── StatBar.vue (Atom)
│   └── Pagination.vue (Molecule)
├── MoveSelector.vue (Organism)
│   ├── MoveCard.vue (Molecule) [repeats]
│   │   ├── TypeBadge.vue (Atom)
│   │   └── PowerIndicator.vue (Atom)
│   └── SelectedMovesList.vue (Molecule)
└── TeamRoster.vue (Organism)
    ├── TeamMemberCard.vue (Molecule) [repeats]
    │   ├── PokemonSprite.vue (Atom)
    │   ├── MiniMoveDisplay.vue (Atom)
    │   └── RemoveButton.vue (Atom)
    └── StartBattleButton.vue (Molecule)
```

**Component Contracts** (Props/Events):
```typescript
// PokemonCatalog.vue
Props: { pokemon: Pokemon[], isLoading: boolean }
Events: { 'select-pokemon': Pokemon, 'change-page': number }

// MoveSelector.vue
Props: { pokemon: Pokemon, selectedMoves: Move[] }
Events: { 'add-move': Move, 'remove-move': Move }

// TeamRoster.vue
Props: { team: TeamMember[] }
Events: { 'remove-member': number, 'reorder': {from, to}, 'start-battle': void }
```

**Alternatives Considered**:
- Monolithic component: Violates SRP, untestable
- Over-atomization: Excessive indirection, hard to follow
- Options API: Forbidden by constitution

---

### 8. Testing Strategy

#### Decision: Three-tier testing (unit → integration → E2E)
**Rationale**:
- Constitution §IV requires tests for stores, utils, components
- Unit tests for business logic (transformers, cache, stores)
- Integration tests for critical user flows
- E2E tests for happy path only (build team → start battle)

**Test Coverage Targets**:

**Unit Tests** (100% coverage):
```typescript
services/teamBuilder/pokemonService.ts:
- transformPokeAPIToPokemon() with various inputs
- Handle missing/null fields gracefully

services/teamBuilder/moveService.ts:
- transformPokeAPIToMove() including status moves (power: null)
- Damage class mapping (physical/special/status)

services/teamBuilder/teamCache.ts:
- localStorage save/load with quota exceeded handling
- Cache validation (schema version, expiration)
- Fallback when cache corrupted

stores/team.ts:
- addPokemonToTeam() with max 6 validation
- removePokemonFromTeam() updates roster
- reorderTeam() changes lead position
- saveTeamToCache() persists correctly
```

**Integration Tests** (Critical Flows):
```typescript
Team Building Flow:
1. Load Pokemon catalog → pagination works
2. Select Pokemon → move selector appears
3. Select 4 moves → add to team
4. Add 6 Pokemon → team full validation
5. Start battle → battle.ts receives custom team

Error Handling Flow:
1. Simulate API failure → cached fallback loads
2. localStorage full → in-memory fallback works
3. Invalid Pokemon data → graceful error message
```

**E2E Tests** (Smoke Only):
```typescript
Happy Path:
1. Navigate to /team-builder
2. Click first Pokemon
3. Click 4 moves
4. Click "Add to Team"
5. Click "Start Battle"
6. Verify battle starts with custom Pokemon
```

**Alternatives Considered**:
- No tests: Violates constitution, high regression risk
- Only E2E tests: Slow, brittle, poor debugging
- 100% coverage everywhere: Diminishing returns on UI tests

---

## Summary of Key Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| **API** | PokeAPI `/pokemon`, `/move` with pagination | Stable, proven, matches Feature 002 pattern |
| **Data Transform** | Transformation layer PokeAPI → Battle entities | Loose coupling, protects battle system |
| **State** | New Pinia store `team.ts` + modify `battle.ts` | Single-responsibility, clear boundaries |
| **Caching** | Two-tier (memory + localStorage) | Performance, persistence, offline capability |
| **Pagination** | 20 Pokemon/page, offset-based | Balance performance and UX |
| **Errors** | Retry → Cache → User feedback | Graceful degradation, never blank screen |
| **Components** | Atomic design, Composition API | Constitution compliance, scalability |
| **Testing** | Unit (100% services) + Integration (flows) | Constitution compliance, regression prevention |

---

## Technology Best Practices

### Vue 3 Composition API
- Use `<script setup lang="ts">` syntax
- `ref()` for primitives, `reactive()` for objects
- `computed()` for derived state
- Avoid `watch()` unless necessary (prefer computed)
- Component lifecycle: `onMounted()` for API calls

### TypeScript Strict Mode
- Enable `strict: true` in tsconfig.json (already set)
- Use runtime type guards for API responses
- Prefer `interface` for objects, `type` for unions
- Use `unknown` over `any` for uncertain types
- Exhaustive switch statements with `never`

### Pinia Store Patterns
- State: reactive data only
- Getters: computed properties (derived state)
- Actions: async operations, mutations
- Use `storeToRefs()` for reactive destructuring
- Avoid direct state mutation outside actions

### localStorage Best Practices
- Always try-catch quota exceeded errors
- Version schemas for migration support
- Validate on load (schema + data integrity)
- Use JSON.stringify/parse for serialization
- Graceful fallback when unavailable (private mode)

### PokeAPI Best Practices
- Respect rate limits (cache aggressively)
- Use AbortController for timeouts
- Handle 429 with exponential backoff
- Parallel fetches with Promise.allSettled()
- Cache sprites (browser cache handles URLs)

---

## Phase 0 Complete

All technical unknowns from Technical Context have been researched and resolved. No "NEEDS CLARIFICATION" items remain. Ready to proceed to Phase 1 (Design & Contracts).
