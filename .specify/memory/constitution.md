<!--
SYNC IMPACT REPORT
==================
Version: 1.4.0 → 1.5.0
Change Type: MINOR - Enhanced shadcn-vue as mandatory UI component system

Modified Principles:
- VI. UI/UX Design System → VI. shadcn-vue Component System (renamed and expanded)
  - Made shadcn-vue usage NON-NEGOTIABLE for all UI components
  - Added explicit component installation requirements
  - Added theme customization guidelines

Added Sections:
- None (principle expanded, not new)

Removed Sections:
- None

Templates Status:
✅ plan-template.md - No updates required (constitution check covers UI principles)
✅ spec-template.md - No updates required (functional requirements cover component needs)
✅ tasks-template.md - No updates required (follows from spec)
✅ checklist-template.md - No updates required
✅ Constitution updated

Follow-up TODOs:
- None - shadcn-vue configuration already in place (components.json, SHADCN-SETUP.md)
-->

# Pokémon MMO Constitution

## Vision & Scope

**Vision**: Build a scalable, performant web-based Pokémon MMO that provides engaging multiplayer gameplay with team management, battles, and trading mechanics.

**Project Name**: Pokémon MMO

**Success Criteria**:
- Sub-100ms UI response time for core interactions
- Type-safe codebase with zero runtime type errors in production
- 90%+ code coverage for critical game logic
- Accessible to WCAG 2.1 AA standards
- Clean, maintainable architecture supporting feature iteration

**Non-Goals**:
- Server-side implementation (focus on frontend architecture first)
- Mobile native apps (web-first, responsive design)
- Real-time multiplayer battles (turn-based acceptable initially)

**Constraints**:
- Node.js 20.19+ or 22.12+ required
- Must support modern evergreen browsers (last 2 versions)
- Bundle size budget: <500KB initial load (gzipped)

## Core Principles

### I. Component-First Architecture

Every feature MUST be implemented as a self-contained Vue component with clear, single responsibility. Components MUST:
- Have a defined interface (props, events, slots)
- Be independently testable without parent context
- Include TSDoc comments describing purpose and usage
- Avoid direct access to global state except through Pinia stores
- Use composition API with `<script setup>` syntax

**Rationale**: Ensures modularity, reusability, and prevents tight coupling that hinders refactoring.

### II. Type Safety (NON-NEGOTIABLE)

TypeScript MUST be used for all source code with `strict: true`. All rules:
- NO `any` types except in extraordinary circumstances with explicit justification comment
- All component props MUST be typed with interface/type definitions
- All Pinia stores MUST have typed state, getters, and actions
- External API responses MUST be validated with runtime type guards
- Type inference preferred over explicit annotations where clear

**Rationale**: Catches 80%+ of bugs at compile time, enables confident refactoring, serves as living documentation.

### III. State Management Discipline

Application state MUST follow clear data flow patterns:
- Global state ONLY in Pinia stores (no Vue.observable hacks)
- Store per domain: battle, team, trade, player, etc.
- Component local state using `ref`/`reactive` for UI-only concerns
- Props down, events up - NO prop mutation
- Async actions in stores, NOT in components

**Rationale**: Predictable state flow prevents debugging nightmares and enables time-travel debugging with Vue devtools.

### IV. Testing Culture

Testing requirements by component type:
- **Stores**: Unit tests REQUIRED covering all actions and state mutations
- **Utils/Models**: Unit tests REQUIRED with 100% coverage expectation
- **Components**: Integration tests REQUIRED for critical user flows (battle, trade, team management)
- **Views/Routes**: Smoke tests REQUIRED ensuring render without crash

**MANDATORY Quality Gates for Critical Features**:
- After implementing ANY feature touching battle logic, team builder, or state management: `npm run type-check` MUST pass with zero errors
- After implementing ANY feature touching battle logic, team builder, or state management: `npm run test` MUST be executed and all existing tests MUST pass
- New test failures introduced by feature changes MUST be resolved before feature completion
- Type errors MUST be fixed immediately - NO merging with type errors
- Component interfaces MUST be validated: ensure stores are called correctly, props are typed, events are emitted properly

Test-first approach ENCOURAGED but not mandatory. All PRs MUST include tests for new functionality.

**Rationale**: Game logic complexity demands verifiable correctness; tests enable fearless refactoring. Type safety catches integration bugs before runtime. Critical features like battle and team builder require validation to prevent cascading failures.

### V. Performance & Accessibility

Performance targets (MUST NOT regress):
- Lighthouse Performance score ≥90
- First Contentful Paint <1.5s
- Time to Interactive <3.5s
- Component re-render budget: <16ms (60fps)

Accessibility requirements (NON-NEGOTIABLE):
- Semantic HTML elements (no `<div>` soup)
- ARIA labels for interactive elements
- Keyboard navigation for all features
- Sufficient color contrast (4.5:1 minimum)
- Screen reader testing for critical flows

**Rationale**: Performance = user retention; accessibility = inclusive design and legal compliance.

### VII. Quality Enforcement (NON-NEGOTIABLE)

**Critical Feature Validation Checkpoints**:

After implementing changes to ANY of the following subsystems, developers MUST execute full validation:
1. **Battle System** (BattleScreen.vue, battle.ts store, battle domain logic)
2. **Team Builder** (Team components, team.ts store, localStorage integration)
3. **Type System** (Type chart, effectiveness calculation, move categories)
4. **State Management** (Any Pinia store modification)

**Required Validation Steps** (MUST be completed before considering feature "done"):
1. Run `npm run type-check` - MUST show zero errors
2. Run `npm run test` - ALL existing tests MUST pass (new failures = feature incomplete)
3. Manual smoke test of the affected feature in browser
4. Verify console has no errors during feature execution
5. Check that interfaces between components are correct (stores, props, events)

**Integration Bug Prevention**:
- When modifying store methods, VERIFY all components calling those methods
- When changing component interfaces, VERIFY parent components using those props/events
- When updating TypeScript types, VERIFY all files importing those types compile
- localStorage integration MUST be tested: save → refresh → load → verify data integrity

**Rationale**: Complex interactions between battle, team builder, and state management create high risk for integration bugs. Type checking catches interface mismatches. Test execution validates business logic. Manual testing catches UX regressions. This checkpoint prevents "feature complete but system broken" scenarios.

### VIII. PokeAPI as Single Source of Truth (NON-NEGOTIABLE)

ALL Pokémon game data MUST be sourced from [PokeAPI](https://pokeapi.co/). This includes:

**Required Data Sources** (MUST use PokeAPI endpoints):
- **Pokémon**: Species, stats, types, sprites → `https://pokeapi.co/api/v2/pokemon/{id or name}`
- **Moves**: Name, type, power, accuracy, category, effects → `https://pokeapi.co/api/v2/move/{id or name}`
- **Types**: Type chart, effectiveness relationships → `https://pokeapi.co/api/v2/type/{id or name}`
- **Status Conditions**: Effect descriptions → referenced via move/ability metadata
- **Abilities**: Name, effect descriptions → `https://pokeapi.co/api/v2/ability/{id or name}`

**Implementation Requirements**:
- NO hardcoded Pokémon/move/type data except for caching retrieved PokeAPI responses
- ALL services fetching game data MUST use PokeAPI client (`src/services/teamBuilder/`, `src/services/typeChart/`)
- Runtime type guards MUST validate PokeAPI responses before use
- Caching is ENCOURAGED to reduce API calls (localStorage, in-memory cache)
- Offline fallback data MAY be pre-fetched from PokeAPI, NOT manually created

**Forbidden**:
- Manually defining Pokémon stats, moves, or type effectiveness
- Creating fictional Pokémon or moves not in PokeAPI
- Hardcoding damage formulas or effectiveness values (derive from PokeAPI type chart)
- Using alternative data sources (Bulbapedia scraping, fan databases)

**Existing Services** (MUST be used for new features):
- `src/services/teamBuilder/pokemonService.ts` - Pokémon data fetching
- `src/services/teamBuilder/moveService.ts` - Move data fetching  
- `src/services/typeChart/pokeApiClient.ts` - Type effectiveness data
- `src/services/typeChart/typeChartService.ts` - Type chart calculations

**Exception**: UI-only data (trainer names, dialogue, game-specific mechanics not in mainline games) may be defined locally.

**Rationale**: PokeAPI provides canonical, accurate, and comprehensive Pokémon data. Using a single source ensures consistency, reduces maintenance burden, and guarantees correctness of game mechanics. Hardcoded data drifts from source and introduces bugs.

### VI. shadcn-vue Component System (NON-NEGOTIABLE)

ALL user interface components MUST be built using shadcn-vue as the primary component library. This is mandatory for maintaining consistency, accessibility, and design system coherence.

**Required Usage**:
- **Primitive Components**: ALL buttons, inputs, dialogs, dropdowns, cards, and form elements MUST use shadcn-vue components from `@/components/ui/`
- **Component Installation**: New components MUST be added via `npx shadcn-vue@latest add <component>` - never copy/paste from external sources
- **Import Pattern**: Always import from `@/components/ui/<component>` (e.g., `import { Button } from '@/components/ui/button'`)
- **Customization**: Direct modification of shadcn-vue components in `src/components/ui/` is ALLOWED and ENCOURAGED to match the project's glassomorphism/neumorphism aesthetic

**Design Language** (applied via Tailwind utilities):
- Use Tailwind utility classes for all styling (NO custom CSS except when absolutely necessary)
- Apply glassy, translucent backgrounds with backdrop blur effects (`backdrop-blur-*`, `bg-opacity-*`)
- Implement soft neumorphic shadows for depth and tactile feel (`shadow-*` with subtle inset effects)
- Maintain visual simplicity: clean layouts, generous whitespace, subtle animations
- Color palette: soft, muted tones with high-contrast accents for interactive elements
- Responsive by default: mobile-first approach using Tailwind breakpoints (`sm:`, `md:`, `lg:`, etc.)

**Component Configuration** (defined in `components.json`):
- Style: New York
- Base color: Neutral
- CSS variables: Enabled
- Icon library: Lucide
- Components path: `@/components/ui`
- Utils path: `@/lib/utils`

**Forbidden**:
- Creating custom button, input, dialog, or form components without using shadcn-vue as the base
- Using raw HTML elements (`<button>`, `<input>`, `<select>`) where shadcn-vue equivalents exist
- Installing alternative component libraries (Vuetify, Element Plus, PrimeVue, Naive UI, etc.)
- Copying shadcn-vue component code from external websites instead of using the CLI

**Available Components** (add more as needed via CLI):
- Button, Card, Dialog, Input, Select, Dropdown Menu, Tooltip, Toast, etc.
- Full list: https://www.shadcn-vue.com/docs/components

**Rationale**: shadcn-vue provides accessible, type-safe, and customizable components built on Radix Vue primitives. Using a single component system ensures consistency, reduces design debt, and enables rapid iteration while maintaining accessibility standards.

## Architecture & Tech Stack

**Core Stack** (changes require constitutional amendment):
- **Framework**: Vue 3.5+ with Composition API
- **Build Tool**: Vite 7+ with HMR
- **Language**: TypeScript 5.9+ (strict mode)
- **State Management**: Pinia 3+
- **Routing**: Vue Router 4+
- **Styling**: Tailwind CSS 3+ with JIT mode
- **UI Components**: shadcn-vue (with Radix Vue primitives)
- **Linting**: ESLint 9+ with Vue/TypeScript configs
- **Formatting**: Prettier 3.6+

**UI Component Library** (shadcn-vue configuration):
- Style: New York (recommended)
- Base color: Neutral
- CSS variables: Enabled
- Components path: `@/components/ui`
- Utils path: `@/lib/utils`
- All components MUST be added via `npx shadcn-vue@latest add <component>`
- Direct modification of shadcn-vue components is ALLOWED to match design system

**Approved Libraries** (additions require discussion):
- Vue DevTools for development
- Type utilities as needed
- Radix Vue (headless UI primitives, required by shadcn-vue)
- class-variance-authority (for component variants)
- clsx & tailwind-merge (for className utilities)

**Forbidden**:
- Options API (use Composition API)
- Class-based components
- Direct DOM manipulation (use Vue refs)
- `eval()` or `Function()` constructors

## Development Workflow

### Coding Conventions

**File Structure**:
```
src/
  components/
    ui/           # shadcn-vue components (auto-generated)
    [feature]/    # Feature-specific components (e.g., teamBuilder/)
  views/          # Route-level components
  stores/         # Pinia state stores
  models/         # TypeScript interfaces/types
  services/       # API/external integrations
  lib/            # Shared utilities (cn helper, etc.)
  utils/          # Pure utility functions
  router/         # Route definitions
```

**Naming**:
- Components: PascalCase (e.g., `PokemonBattle.vue`)
- Stores: camelCase (e.g., `battle.ts`)
- Files: Match primary export name
- Props/events: camelCase in script, kebab-case in templates

**Style Guidelines**:
- Use `<script setup lang="ts">` syntax
- Order: template → script → style
- Scoped styles only (`<style scoped>`) - prefer Tailwind utilities over custom styles
- Tailwind classes preferred: use utility-first approach, avoid `@apply` unless absolutely necessary
- ESLint/Prettier enforced (run `npm run lint` before commit)
- Max file length: 300 lines (split if exceeded)

### Branching & PR Workflow

**Branch Strategy**:
- `main`: Production-ready code (protected)
- Feature branches: `feature/<feature-name>` or descriptive names (e.g., `intercambio`)
- Bugfix branches: `fix/<bug-description>`
- Hotfix branches: `hotfix/<issue>`

**Pull Request Requirements**:
- Title: Clear, imperative mood (e.g., "Add NPC trading interface")
- Description: What/Why/How + screenshots for UI changes
- Checks passing: Type-check, lint, tests (when CI configured)
- Review required: At least one approval before merge
- Squash merge preferred for clean history

### Quality Gates

MUST pass before merge:
- `npm run type-check` - Zero TypeScript errors (NON-NEGOTIABLE)
- `npm run lint` - Zero linting errors
- `npm run test` - All tests passing (when test suite exists)
- No console errors in browser during feature testing
- Accessibility audit for UI changes

**Feature Completion Checklist** (for critical features):
- [ ] Type-check passes
- [ ] All existing tests pass
- [ ] New tests added for new functionality
- [ ] Manual testing completed in browser
- [ ] Console clean (no errors/warnings)
- [ ] localStorage integration verified (if applicable)
- [ ] Component integration verified (props/events/stores correct)
- [ ] README or docs updated (if feature changes user-facing behavior)

### Release Process

**Versioning** (Semantic Versioning):
- MAJOR: Breaking changes, architecture shifts
- MINOR: New features, component additions
- PATCH: Bugfixes, refactors, docs

**Deployment**:
- `npm run build` generates production bundle
- Preview with `npm run preview`
- Deploy `dist/` to hosting platform

## Governance

**Amendment Process**:
1. Propose change in GitHub issue with rationale
2. Discussion period (minimum 2 days for non-urgent)
3. Approval from project maintainer(s)
4. Update constitution with version bump
5. Propagate changes to affected templates/docs
6. Communicate changes to team

**Version Bump Rules**:
- MAJOR: Principle removal, tech stack change, workflow overhaul
- MINOR: New principle, section expansion, additional constraints
- PATCH: Clarifications, typos, formatting improvements

**Compliance**:
- All PRs MUST reference this constitution for architecture decisions
- Constitution violations MUST be flagged in code review
- Justified exceptions require inline comments with explanation
- Template files in `.specify/templates/` provide scaffolding aligned with these principles

**Decision Authority**:
- Architecture decisions: Team consensus or maintainer override
- Tech stack changes: Constitutional amendment required
- Library additions: Discussion required, approval for new dependencies

**Communication Norms**:
- Issues: Label with `bug`, `feature`, `documentation`, `constitution`, etc.
- PRs: Link related issues, explain non-obvious decisions
- Commit messages: Conventional Commits format encouraged (e.g., `feat:`, `fix:`, `docs:`)

**Performance Monitoring**:
- Lighthouse CI checks (when configured)
- Bundle size monitoring on each build
- Regression blocking: Performance score drops >5 points

**Security Practices**:
- Dependencies updated monthly minimum
- `npm audit` run before releases
- No secrets in source code (use environment variables)
- Input validation for all user-generated content

---

**Version**: 1.5.0 | **Ratified**: 2025-11-28 | **Last Amended**: 2025-12-02
