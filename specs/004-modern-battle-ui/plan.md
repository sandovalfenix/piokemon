# Implementation Plan: Modern BattleScreen UI with Animated Sprites and Enhanced UX

**Branch**: `004-modern-battle-ui` | **Date**: November 30, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-modern-battle-ui/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Modernize the BattleScreen component with animated Pokemon sprites from PokemonShowdown API, neumorphic/glassy UI design using Tailwind CSS and shadcn-vue components, improved UX (disabled attack buttons during animations, charge attack animations), and integration with Team Builder (Feature 003) to use custom Pokemon teams in battles against a sample NPC opponent.

## Technical Context

**Language/Version**: TypeScript 5.9+ (strict mode), Vue 3.5+ with Composition API  
**Primary Dependencies**: Vue 3.5.22, Vite 7.1.11, Tailwind CSS 3.4.17, Pinia 3.0.3, shadcn-vue (Radix Vue 1.9.17), class-variance-authority 0.7.1  
**Storage**: LocalStorage (via existing Team Builder service for team persistence), no new storage requirements  
**Testing**: Vitest 4.0.14 with Vue Test Utils 2.4.6, integration tests required for battle flow  
**Target Platform**: Modern evergreen browsers (last 2 versions), desktop-first with responsive design  
**Project Type**: Web application (single-page Vue app)  
**Performance Goals**: 60fps animations (<16ms re-render budget), sprite loading <2s, UI interactions <100ms response time  
**Constraints**: Bundle size <500KB gzipped, Lighthouse Performance ≥90, WCAG 2.1 AA accessibility  
**Scale/Scope**: Single BattleScreen component refactor (~800 lines), 5-7 new utility functions, integration with existing battle store and team store, external API dependency (PokemonShowdown sprites)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Principle I: Component-First Architecture
- BattleScreen.vue is self-contained component with clear props interface (trainer?, playerTeam?)
- Uses Composition API with `<script setup>` syntax (currently compliant)
- Will maintain single responsibility: battle UI rendering and interaction handling
- No new global state except through existing Pinia stores (battle, team)

### ✅ Principle II: Type Safety (NON-NEGOTIABLE)
- All code uses TypeScript strict mode (tsconfig.json verified)
- Props typed with interface definitions (`Props` interface present)
- Pinia stores already typed (battle.ts, team.ts)
- Will add type guards for PokemonShowdown API sprite URL construction
- No `any` types introduced

### ✅ Principle III: State Management Discipline
- Uses existing Pinia stores: useBattleStore() for battle state, useTeamStore() for team roster
- Component local state via ref() for UI concerns (currentView, damageEffect, attackEffect)
- Props down, events up pattern maintained
- No prop mutation

### ✅ Principle IV: Testing Culture
- Integration tests REQUIRED for battle flow with animated sprites
- Unit tests REQUIRED for new sprite URL construction utilities
- Will add tests for attack button disabling logic and animation timing
- Existing test infrastructure with Vitest available

### ✅ Principle V: Performance & Accessibility
- Animation timing designed for 60fps (<16ms re-render budget met with CSS transforms)
- Sprite loading optimization with fallback mechanism
- Accessibility: ARIA labels for attack buttons, keyboard navigation preserved
- Color contrast verified for neumorphic design (4.5:1 minimum maintained)

### ✅ Principle VI: UI/UX Design System
- Will use Tailwind CSS utility classes exclusively for styling
- Neumorphism/glassomorphism implemented with Tailwind utilities (backdrop-blur, shadow classes)
- shadcn-vue components customized for modern aesthetic (buttons, cards, dialogs if needed)
- Responsive design with mobile-first breakpoints
- NO custom CSS except for animation keyframes (battle-specific transform animations)

### 🟡 JUSTIFICATION REQUIRED: Custom CSS for Attack Animations
**Violation**: Custom `@keyframes` CSS for charge attack animations and damage effects  
**Why Needed**: Complex multi-step animations (charge forward 300ms → hold 100ms → return 200ms) with sprite transforms require custom keyframes beyond Tailwind's animation utilities  
**Simpler Alternative Rejected**: Tailwind's `animate-*` utilities insufficient for precise multi-step sprite transform sequences with easing control and state synchronization

### ✅ Architecture & Tech Stack Compliance
- Vue 3.5.22 ✅
- TypeScript 5.9+ strict ✅
- Vite 7.1.11 ✅
- Pinia 3.0.3 ✅
- Tailwind CSS 3.4.17 ✅
- shadcn-vue (Radix Vue) ✅
- Composition API only (no Options API) ✅

**GATE STATUS**: ✅ **PASS** - All constitutional requirements met. Custom animation CSS violation justified and minimal.

## Project Structure

### Documentation (this feature)

```text
specs/004-modern-battle-ui/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (in progress)
├── research.md          # Phase 0 output (next)
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API type contracts)
│   ├── pokemonshowdown-sprite.ts
│   └── battle-ui-state.ts
├── checklists/
│   └── requirements.md  # Spec quality checklist (completed)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── BattleScreen.vue          # [MODIFY] Main component - add animated sprites, neumorphic UI
│   ├── MoveSelector.vue          # [MODIFY] Update styling to neumorphic/glassy
│   ├── LogPanel.vue              # [MODIFY] Update styling to neumorphic/glassy
│   ├── StatusPanel.vue           # [MODIFY] Update styling to neumorphic/glassy
│   ├── BattleTeamSelector.vue    # [EXISTING] No changes
│   ├── PokemonTeamSwitcher.vue   # [EXISTING] No changes
│   ├── TrainerWaitingScreen.vue  # [EXISTING] No changes
│   └── ui/                       # [EXISTING] shadcn-vue components
│       ├── button/               # [MAY USE] For action buttons
│       ├── card/                 # [MAY USE] For info panels
│       └── skeleton/             # [MAY USE] For loading states
├── stores/
│   ├── battle.ts                 # [EXISTING] Uses Team Builder integration
│   └── team.ts                   # [EXISTING] Feature 003 store
├── services/
│   └── teamBuilder/              # [EXISTING] Feature 003 services
│       └── index.ts              # transformTeamMemberToBattlePokemon()
├── utils/
│   ├── pokemonSpriteMap.ts       # [MODIFY] Add PokemonShowdown sprite URL builders
│   ├── attackEffects.ts          # [EXISTING] Attack effect utilities
│   └── spriteNormalizer.ts       # [NEW] Normalize Pokemon names for sprite URLs
├── composables/
│   ├── useBattleLoop.ts          # [EXISTING] Battle logic
│   ├── useTrainerBattle.ts       # [EXISTING] Trainer battle flow
│   ├── useAudio.ts               # [EXISTING] Audio effects
│   └── useSpriteLoader.ts        # [NEW] Handle sprite loading with fallbacks
└── lib/
    └── utils.ts                  # [EXISTING] cn() helper for className merging

tests/
├── integration/
│   └── components/
│       └── BattleScreen.spec.ts  # [MODIFY] Add animated sprite tests
└── unit/
    ├── utils/
    │   └── spriteNormalizer.spec.ts  # [NEW] Test name normalization
    └── composables/
        └── useSpriteLoader.spec.ts   # [NEW] Test sprite loading logic
```

**Structure Decision**: Single project web application structure (Option 1). Feature modifies existing `BattleScreen.vue` component and adds utility functions for sprite handling. Integrates with existing Team Builder (Feature 003) store and services. No new routes or views required - all changes scoped to battle UI component layer.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Custom CSS `@keyframes` for animations | Multi-step sprite transform animations (charge forward → hold → return) with precise timing (300ms/100ms/200ms) and easing synchronization with damage application | Tailwind's `animate-*` utilities only support single-loop animations without multi-step sequencing or state-synchronized triggers. JavaScript-based animation libraries (GSAP, Motion One) add unnecessary bundle weight (~50KB) for just 2-3 animation sequences. |

**Impact Assessment**: Minimal - adds ~30 lines of scoped CSS for 3 keyframe definitions (chargeAttack, damageHit, effectPulse). Does not compromise maintainability or violate architectural principles. Alternatives would either sacrifice UX (no multi-step animations) or violate bundle size constraints.

## Phase 0: Research (COMPLETED)

**Output**: [research.md](./research.md)

All technical unknowns have been resolved:

1. **PokemonShowdown Sprite API**: Researched endpoint patterns, naming conventions, availability. Decision: Use as primary source with 3-tier fallback hierarchy.

2. **Neumorphism/Glassmorphism Implementation**: Validated Tailwind arbitrary shadow syntax for neumorphic effects and built-in backdrop-blur for glassmorphism. No additional plugins needed.

3. **Attack Animation Timing**: Determined CSS animations + state management pattern with centralized timing constants (600ms total: 300ms charge + 100ms hold + 200ms return).

4. **Team Builder Integration**: Confirmed existing infrastructure in Feature 003 provides all necessary services. No new integration code required, just UI routing.

5. **HP Bar Animation**: Validated CSS width transition approach meets 60fps requirement. Spec-compliant 500ms duration with cubic-bezier easing.

6. **Sprite Loading Strategy**: Designed `useSpriteLoader` composable with Image preloading, timeout handling, and 3-tier fallback (animated  static  legacy  placeholder).

**Key Decisions Logged**: All technology choices, patterns, and implementation strategies documented in research.md for Phase 2 implementation reference.

## Phase 1: Design (COMPLETED)

**Outputs**: 
- [data-model.md](./data-model.md) - Entity definitions and TypeScript interfaces
- [contracts/pokemonshowdown-sprite.ts](./contracts/pokemonshowdown-sprite.ts) - Sprite API type contracts
- [contracts/battle-ui-state.ts](./contracts/battle-ui-state.ts) - Battle UI state type contracts
- [quickstart.md](./quickstart.md) - Developer implementation guide

### Data Entities Defined

1. **SpriteLoaderState**: Tracks sprite loading, fallback tiers, error handling
2. **AttackAnimationState**: Controls multi-step attack animation sequence and button disabling
3. **DamageEffectState**: Visual feedback for Pokemon taking damage
4. **BattleViewState**: Tracks active UI panel (main/fight/bag/pokemon)
5. **SpriteUrlConfig**: PokemonShowdown URL building with normalization rules
6. **AnimationTimings**: Centralized timing constants (single source of truth)

### TypeScript Contracts Created

**pokemonshowdown-sprite.ts**:
- `SpriteLoaderOptions`, `SpriteLoaderResult` interfaces
- `SpriteUrlResult` with normalized name tracking
- `BuildSpriteUrlFn`, `NormalizePokemonNameFn`, `TestImageLoadFn` function signatures
- Normalization examples for edge cases (Mr. Mime, Farfetch'd, Type: Null, etc.)

**battle-ui-state.ts**:
- `AttackAnimationState`, `DamageEffectState` interfaces
- `BattleViewMode` union type (7 view modes)
- `AnimationTimings` interface with all duration/easing constants
- `NEUMORPHIC_CLASSES`, `GLASSMORPHIC_CLASSES` Tailwind configurations
- Initial state constants and validation helpers

### Developer Guide Published

**quickstart.md** provides:
- Copy-paste code snippets for all patterns
- Tailwind class configurations for neumorphism/glassmorphism
- Attack animation sequence timing breakdown
- Sprite loading composable usage examples
- Team Builder integration patterns
- Troubleshooting guide for common issues

## Phase 2: Tasks (PENDING)

**Command**: Run `/speckit.tasks` to generate [tasks.md](./tasks.md)

Phase 2 will break down implementation into actionable development tasks:
- Task prioritization and dependencies
- Estimated complexity/effort per task
- Acceptance criteria for each task
- Testing requirements

**Not included in this planning document** - tasks.md generated separately to allow iterative task planning based on developer feedback.

## Next Actions

### For Planning Completion
 Constitution check passed
 Phase 0 research completed (research.md)
 Phase 1 design completed (data-model.md, contracts/, quickstart.md)
 Agent context updated (GitHub Copilot instructions)

### For Implementation Start
 **Run `/speckit.tasks`** to generate implementation task breakdown
 Review generated tasks with development team
 Begin implementation with highest priority tasks (P1: Animated sprites, Neumorphic UI, Team Builder integration)

## References

- **Feature Spec**: [spec.md](./spec.md) - User stories, requirements, success criteria
- **Research**: [research.md](./research.md) - Technical decisions and alternatives considered
- **Data Model**: [data-model.md](./data-model.md) - Entity definitions and TypeScript interfaces
- **Contracts**: [contracts/](./contracts/) - Type definitions for API and state
- **Quick Start**: [quickstart.md](./quickstart.md) - Implementation patterns and code examples
- **Constitution**: [../../.specify/memory/constitution.md](../../.specify/memory/constitution.md) - Project principles and guidelines

---

**Plan Status**:  **COMPLETE** (Phases 0-1)  
**Ready For**: Task generation via `/speckit.tasks` command  
**Branch**: `004-modern-battle-ui`  
**Last Updated**: November 30, 2025
