# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add Pokemon Team Builder with PokeAPI integration allowing users to browse 1000+ Pokemon, view move details, build custom teams of 1-6 Pokemon with 1-4 moves each, and start battles with custom teams replacing SAMPLE_PLAYER. Technical approach: Extend existing PokeAPI client pattern from Feature 002, add new Pinia store for team management, create team builder UI components, integrate with existing battle system via entity transformation layer.

## Technical Context

**Language/Version**: TypeScript 5.9+ (strict mode enabled)  
**Primary Dependencies**: Vue 3.5+, Pinia 3+, Vue Router 4+, Vite 7+  
**Storage**: Browser localStorage for team persistence (5-10MB quota)  
**Testing**: Vitest (inherited from project setup)  
**Target Platform**: Modern web browsers (Chrome/Firefox/Safari last 2 versions)  
**Project Type**: Web application (Vue SPA)  
**Performance Goals**: <5s Pokemon page load, <100ms UI response, <16ms component re-render (60fps)  
**Constraints**: <500KB bundle size budget (total), localStorage quota 5-10MB, PokeAPI rate limits (free tier)  
**Scale/Scope**: 1000+ Pokemon catalog, 800+ moves, 6-Pokemon teams, single-Pokemon battles for MVP

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ PASS: Component-First Architecture
- Team builder will be self-contained Vue components (PokemonCatalog.vue, TeamBuilder.vue, MoveSelector.vue)
- Each component has clear single responsibility (browse/select/build)
- Components independently testable via props/events interface

### ✅ PASS: Type Safety
- TypeScript strict mode already enforced
- All PokeAPI responses validated with runtime type guards (pattern from Feature 002)
- Pinia stores will have typed state/actions
- Entity transformation layer types PokeAPI → Battle system interfaces

### ✅ PASS: State Management Discipline
- New Pinia store: `team.ts` for team roster state
- Reuse existing: `battle.ts` store for battle integration
- Props down, events up pattern for component communication
- No prop mutation, async actions in stores only

### ✅ PASS: Testing Culture
- Stores: Unit tests required for team.ts actions (add/remove/reorder Pokemon)
- Utils: 100% coverage for PokeAPI transformers (Pokemon/Move → Battle entities)
- Components: Integration tests for critical flow (browse → select → build → battle)
- Views: Smoke tests for TeamBuilder view render

### ✅ PASS: Performance & Accessibility
- Pagination (20 Pokemon/page) prevents performance degradation
- Lazy loading for Pokemon sprites
- Loading skeletons/spinners for async operations (<100ms display)
- Semantic HTML for catalog/team roster
- Keyboard navigation for Pokemon selection
- ARIA labels for interactive elements (add/remove buttons)

### ⚠️ WATCH: Bundle Size Budget
- Current: 158.50 KB (Feature 002 complete)
- Budget: <500KB total
- Risk: Pokemon/move data caching in localStorage (not counted in bundle)
- Mitigation: Monitor bundle size during development, use code splitting if needed

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── models/
│   └── teamBuilder.ts         # NEW: Pokemon, Move, TeamMember, Team interfaces
├── services/
│   ├── typeChart/             # EXISTING: From Feature 002
│   │   └── pokeApiClient.ts   # REUSE: HTTP client with retry/timeout
│   └── teamBuilder/           # NEW: Team builder services
│       ├── pokemonService.ts  # Pokemon catalog fetch & transform
│       ├── moveService.ts     # Move details fetch & transform
│       ├── teamCache.ts       # localStorage team persistence
│       └── types.ts           # PokeAPI response types
├── stores/
│   ├── battle.ts              # MODIFY: Accept custom team from team builder
│   ├── typeChart.ts           # EXISTING: From Feature 002
│   └── team.ts                # NEW: Team roster state management
├── components/
│   ├── BattleUI.vue           # EXISTING
│   └── teamBuilder/           # NEW: Team builder components
│       ├── PokemonCatalog.vue # Pokemon list with pagination
│       ├── PokemonCard.vue    # Individual Pokemon display
│       ├── MoveSelector.vue   # Move selection interface
│       └── TeamRoster.vue     # Team management UI
├── views/
│   ├── HomeView.vue           # MODIFY: Add team builder navigation
│   └── TeamBuilderView.vue    # NEW: Team builder route
└── router/
    └── index.ts               # MODIFY: Add /team-builder route

tests/
├── unit/
│   ├── stores/
│   │   └── team.spec.ts       # NEW: Team store unit tests
│   └── services/
│       └── teamBuilder/       # NEW: Service layer tests
│           ├── pokemonService.spec.ts
│           ├── moveService.spec.ts
│           └── teamCache.spec.ts
└── integration/
    └── teamBuilder.spec.ts    # NEW: E2E team building flow

specs/003-pokemon-team-builder/
├── plan.md                    # This file
├── research.md                # Phase 0 output (next)
├── data-model.md              # Phase 1 output
├── quickstart.md              # Phase 1 output
└── contracts/                 # Phase 1 output
    ├── pokeapi-pokemon.json   # PokeAPI /pokemon response schema
    ├── pokeapi-move.json      # PokeAPI /move response schema
    └── team-storage.json      # localStorage team schema
```

**Structure Decision**: Web application (Vue SPA) follows existing `src/` layout from Feature 001 and Feature 002. New feature adds `teamBuilder/` subdirectories in `services/`, `components/`, and test directories. Reuses existing `pokeApiClient.ts` HTTP client pattern from Feature 002 type chart integration. Team builder is self-contained with clear boundaries to existing battle system via `stores/battle.ts` modification.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Post-Phase 1 Re-evaluation**: All constitution checks remain ✅ PASS. No violations detected. Design follows Vue 3 Composition API patterns, TypeScript strict mode enforced, Pinia stores for state management, component-first architecture, and accessibility requirements addressed in component design.

---

## Phase 0: Research Summary

**Status**: ✅ COMPLETE

**Key Decisions Made**:
1. **API Strategy**: PokeAPI `/pokemon` and `/move` endpoints with 20-item pagination
2. **Data Transformation**: Separate transformation layer (PokeAPI → Battle entities) for loose coupling
3. **State Management**: New `team.ts` Pinia store + modify existing `battle.ts`
4. **Caching**: Two-tier (memory + localStorage) with 7-day expiration for Pokemon data
5. **Error Handling**: Three-tier (Retry → Cache → User Feedback) with exponential backoff
6. **Component Design**: Atomic design pattern with 4 core components
7. **Testing**: Unit tests (100% services) + integration tests (critical flows)
8. **Pagination**: Client-side with offset-based navigation

**Technologies Selected**:
- HTTP Client: Reuse `pokeApiClient.ts` from Feature 002 (proven pattern)
- Type Guards: Runtime validation for PokeAPI responses
- localStorage API: Team persistence with quota exceeded handling
- AbortController: Request timeout (5s) for PokeAPI calls

**Best Practices Documented**:
- Vue 3 Composition API with `<script setup>`
- TypeScript strict mode patterns
- Pinia store patterns (state/getters/actions)
- localStorage error handling
- PokeAPI rate limit respect

**Deliverables**: `research.md` (8 decisions documented with rationale and alternatives)

---

## Phase 1: Design & Contracts Summary

**Status**: ✅ COMPLETE

**Data Model** (`data-model.md`):
- **4 Entities Defined**: Pokemon, Move, TeamMember, Team
- **Complete Interfaces**: All TypeScript interfaces with validation rules
- **State Machine**: 4 states (Empty, Building, Full, ReadyForBattle)
- **3 Transformation Layers**: PokeAPI → Internal → Battle system
- **Storage Schema**: localStorage with versioning for migration support
- **Computed Properties**: HP calculation formula, team validation logic

**API Contracts** (`contracts/`):
- **pokeapi-pokemon.json**: JSON Schema for `/pokemon/{id}` response
- **pokeapi-move.json**: JSON Schema for `/move/{id}` response
- **team-storage.json**: localStorage schema with validation rules
- All schemas include examples and field descriptions

**Quickstart Guide** (`quickstart.md`):
- Architecture overview with data flow diagram
- File structure (12 files to create/modify)
- 5 implementation phases with time estimates (11 hours total)
- Code snippets for each major component
- Testing checklist (unit + integration)
- Common issues & solutions
- Definition of done (14 criteria)

**Agent Context Updated**:
- GitHub Copilot instructions updated with Feature 003 technologies
- Added: TypeScript 5.9+, Vue 3.5+, Pinia 3+, localStorage API

**Deliverables**: 
- `data-model.md` (4 entities, state transitions, transformations)
- `contracts/` (3 JSON schemas)
- `quickstart.md` (fast-track implementation guide)
- `.github/agents/copilot-instructions.md` (updated)

---

## Next Steps

**Phase 2**: Run `/speckit.tasks` to generate detailed task breakdown (`tasks.md`)

**Phase 3**: Run `/speckit.implement` to execute implementation following `tasks.md` checklist

**Dependencies Met**:
- ✅ All research complete (no NEEDS CLARIFICATION items)
- ✅ All design artifacts generated
- ✅ All contracts documented
- ✅ Constitution checks passing
- ✅ Agent context updated

**Ready to Proceed**: Yes, Feature 003 planning phase complete. Implementation can begin.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
