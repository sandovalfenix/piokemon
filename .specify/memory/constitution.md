<!--
SYNC IMPACT REPORT
==================
Version: 0.0.0 → 1.0.0
Change Type: MAJOR - Initial constitution ratification

Modified Principles:
- Initial creation of all core principles

Added Sections:
- Core Principles (Component-First, Type Safety, State Management, Testing Culture, Performance & Accessibility)
- Architecture & Tech Stack
- Development Workflow
- Governance

Templates Status:
✅ Constitution created (initial version)
⚠ Templates require review: plan-template.md, spec-template.md, tasks-template.md

Follow-up TODOs:
- Validate template alignment after initial usage
- Establish CI/CD pipeline configuration
- Define security scanning integration
-->

# Pokémon MMO Constitution

## Vision & Scope

**Vision**: Build a scalable, performant web-based Pokémon MMO that provides engaging multiplayer gameplay with team management, battles, and trading mechanics.

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

Test-first approach ENCOURAGED but not mandatory. All PRs MUST include tests for new functionality.

**Rationale**: Game logic complexity demands verifiable correctness; tests enable fearless refactoring.

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

## Architecture & Tech Stack

**Core Stack** (changes require constitutional amendment):
- **Framework**: Vue 3.5+ with Composition API
- **Build Tool**: Vite 7+ with HMR
- **Language**: TypeScript 5.9+ (strict mode)
- **State Management**: Pinia 3+
- **Routing**: Vue Router 4+
- **Linting**: ESLint 9+ with Vue/TypeScript configs
- **Formatting**: Prettier 3.6+

**Approved Libraries** (additions require discussion):
- Vue DevTools for development
- Type utilities as needed

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
  components/     # Reusable UI components
  views/          # Route-level components
  stores/         # Pinia state stores
  models/         # TypeScript interfaces/types
  services/       # API/external integrations
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
- Scoped styles only (`<style scoped>`)
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
- `npm run type-check` - Zero TypeScript errors
- `npm run lint` - Zero linting errors
- Tests passing (when implemented)
- No console errors in browser
- Accessibility audit for UI changes

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

**Version**: 1.0.0 | **Ratified**: 2025-11-28 | **Last Amended**: 2025-11-28
