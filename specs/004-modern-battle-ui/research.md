# Research: Modern BattleScreen UI with Animated Sprites and Enhanced UX

**Feature**: 004-modern-battle-ui  
**Created**: November 30, 2025  
**Phase**: 0 - Technical Research & Decision Log

## Purpose

This document resolves all technical unknowns from the feature specification and establishes architectural decisions for implementing animated Pokemon sprites, neumorphic/glassy UI design, improved battle UX, and Team Builder integration.

## Research Areas

### 1. PokemonShowdown Sprite API

**Question**: How reliable is the PokemonShowdown sprite API? What naming conventions and variants are supported?

**Research Findings**:

**API Endpoint Patterns**:
- Player (back view): `https://play.pokemonshowdown.com/sprites/ani-back/{pokemon-name}.gif`
- Enemy (front view): `https://play.pokemonshowdown.com/sprites/ani/{pokemon-name}.gif`
- Static fallback: `https://play.pokemonshowdown.com/sprites/dex/{pokemon-name}.png`

**Naming Conventions**:
- All lowercase names
- Spaces replaced with hyphens: "Mr. Mime" → "mr-mime"
- Special characters removed: "Farfetch'd" → "farfetchd", "Type: Null" → "typenull"
- Gendered forms: "nidoran-f", "nidoran-m"
- Regional forms: "rattata-alola", "vulpix-alola"
- Mega evolutions: "charizard-megax", "charizard-megay"
- Alternate forms: "deoxys-attack", "deoxys-defense", "deoxys-speed"

**Availability**: 
- API is publicly accessible, no authentication required
- No official rate limiting documented, but should implement conservative caching
- Sprites available up to Generation 9 (as of 2024)
- Missing sprites return 404 (handle with fallback)

**Decision**: Use PokemonShowdown as primary sprite source with fallback to existing static sprites. Implement name normalization utility to handle special cases.

**Rationale**: PokemonShowdown is the most comprehensive free sprite resource with animated GIFs. Community-maintained with high reliability. Fallback mechanism ensures battles never break due to sprite unavailability.

**Alternatives Considered**:
- PokeAPI sprites: Only provides static PNGs, no animated versions
- Local sprite hosting: Would require ~50MB+ of sprite assets, violating bundle size constraints
- Self-hosted conversion: Complex pipeline to convert static to animated, ongoing maintenance burden

---

### 2. Neumorphism & Glassmorphism Implementation with Tailwind

**Question**: How to implement neumorphic and glassmorphic design patterns using only Tailwind utility classes?

**Research Findings**:

**Glassmorphism Utilities** (already available in Tailwind):
```css
/* Frosted glass effect */
bg-white/10                    /* Semi-transparent background */
backdrop-blur-md               /* Blur background content */
border border-white/20         /* Subtle borders */
shadow-xl                      /* Depth shadow */
```

**Neumorphism Utilities** (requires custom shadows):
```css
/* Soft embossed appearance */
shadow-[8px_8px_16px_rgba(0,0,0,0.15),-8px_-8px_16px_rgba(255,255,255,0.7)]

/* Debossed (inset) appearance */
shadow-[inset_8px_8px_16px_rgba(0,0,0,0.15),inset_-8px_-8px_16px_rgba(255,255,255,0.7)]
```

**Tailwind Configuration**:
- Existing `tailwind.config.js` supports arbitrary values via `shadow-[...]` syntax
- No additional plugins required
- `backdrop-filter` supported in all target browsers (Chrome/Firefox/Safari/Edge last 2 versions)

**Component Patterns**:
- Buttons: `bg-gray-100 shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.9)] hover:shadow-[2px_2px_4px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.9)] active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)]`
- Panels: `bg-white/20 backdrop-blur-lg border border-white/30 shadow-xl rounded-2xl`
- Cards: `bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md border border-white/20`

**Decision**: Use Tailwind's arbitrary value syntax for neumorphic shadows and built-in utilities for glassmorphism. No custom CSS classes needed for design patterns.

**Rationale**: Maintains constitution compliance (Tailwind-first approach), keeps styling maintainable, avoids CSS bloat. Arbitrary values provide necessary flexibility for precise shadow definitions.

**Alternatives Considered**:
- CSS-in-JS library (styled-components): Violates constitution, adds bundle weight, complicates styling
- Custom CSS classes: Would require extensive utility definitions, harder to maintain than inline Tailwind
- UI library (Vuetify, PrimeVue): Heavy dependencies, opinionated styling conflicts with design system

---

### 3. Attack Animation Timing & Synchronization

**Question**: How to synchronize attack button disabling with animation timing and damage application?

**Research Findings**:

**Animation Sequence Requirements** (from spec):
1. Attack button clicked → Disable all move buttons
2. Charge animation: 300ms (sprite moves toward target)
3. Hold at peak: 100ms (impact moment)
4. Return animation: 200ms (sprite returns to original position)
5. Damage application: synchronized with hold phase
6. Re-enable buttons: after complete sequence (600ms total)

**Implementation Patterns**:

**Option A: CSS Animations + State Management**
```typescript
const isAttacking = ref(false)

function handleAttack(moveId: string) {
  isAttacking.value = true // Disables buttons
  
  // Trigger CSS animation via class binding
  // Animation duration: 600ms defined in CSS
  
  // Execute battle logic
  await battleStore.selectPlayerMove(moveId)
  
  // Re-enable after animation completes
  setTimeout(() => {
    isAttacking.value = false
  }, 600)
}
```

Pros: Simple state management, CSS handles animation performance
Cons: Manual timing coordination, risk of desync if CSS durations change

**Option B: Animation Events API**
```typescript
function handleAttack(moveId: string) {
  isAttacking.value = true
  
  const sprite = spriteRef.value
  sprite.addEventListener('animationend', () => {
    isAttacking.value = false
  }, { once: true })
  
  sprite.classList.add('attack-animation')
  await battleStore.selectPlayerMove(moveId)
}
```

Pros: Guaranteed synchronization, no hardcoded timeouts
Cons: More complex event handling, requires ref management

**Decision**: Use Option A (CSS animations + state management) with centralized timing constants.

**Rationale**: Simpler implementation, easier to maintain timing constants in one place, lower risk of bugs. CSS animations are already performant and well-optimized by browsers. Spec explicitly defines timing requirements, so hardcoded durations are acceptable.

**Implementation Details**:
```typescript
// Animation timing constants (single source of truth)
const ANIMATION_TIMINGS = {
  CHARGE_DURATION: 300,
  HOLD_DURATION: 100,
  RETURN_DURATION: 200,
  get TOTAL_DURATION() { return this.CHARGE_DURATION + this.HOLD_DURATION + this.RETURN_DURATION }
} as const

// CSS keyframes match these constants
@keyframes chargeAttack {
  0% { transform: translate(0, 0) scale(1); } /* Start */
  50% { transform: translate(var(--charge-x), var(--charge-y)) scale(1.1); } /* 300ms - peak */
  66.7% { transform: translate(var(--charge-x), var(--charge-y)) scale(1.1); } /* 400ms - hold */
  100% { transform: translate(0, 0) scale(1); } /* 600ms - return */
}
```

**Alternatives Considered**:
- JavaScript animation libraries (GSAP, Framer Motion): Violates bundle size constraints, unnecessary for simple transforms
- Web Animations API: More complex than needed, browser support less universal than CSS animations
- Vue Transition component: Not designed for this use case (multi-step sprite transforms), would require custom JavaScript hooks

---

### 4. Team Builder Integration Strategy

**Question**: How to integrate custom Pokemon teams from Feature 003 into battle initialization?

**Research Findings**:

**Existing Integration Points**:

**Team Store** (`src/stores/team.ts`):
```typescript
interface TeamMember {
  pokemon: Pokemon
  selectedMoves: Move[]
  position: number
}

const roster = ref<TeamMember[]>([]) // Current team (max 6)
const hasLeadPokemon = computed(() => roster.value[0]?.selectedMoves.length > 0)
```

**Battle Store** (`src/stores/battle.ts`):
```typescript
import { transformTeamMemberToBattlePokemon } from '@/services/teamBuilder'

// Already has Team Builder integration!
// Line 82: Feature: 003-pokemon-team-builder
```

**Transform Service** (`src/services/teamBuilder/index.ts`):
```typescript
function transformTeamMemberToBattlePokemon(member: TeamMember): BattlePokemon {
  // Converts TeamMember to Battle Pokemon format
  // Maps moves, stats, name, level, etc.
}
```

**Current BattleScreen Props**:
```typescript
interface Props {
  trainer?: Trainer
  playerTeam?: Pokemon[]  // Already accepts custom team!
}
```

**Integration Flow**:
1. User builds team in Team Builder (Feature 003)
2. Team saved to `useTeamStore().roster`
3. When starting battle, pass `roster` as `playerTeam` prop
4. BattleScreen uses first Pokemon in roster as battle lead
5. Battle store transforms TeamMember to BattlePokemon format

**Decision**: Use existing integration pattern - no new services needed. BattleScreen already accepts `playerTeam` prop, just need to connect Team Builder's roster to it.

**Rationale**: Feature 003 already provides all necessary infrastructure. Battle store has transformation logic. Only UI routing needed to pass team from builder to battle view.

**Implementation Requirements**:
- Modify battle route/view to load team from `useTeamStore()`
- Add fallback to `SAMPLE_PLAYER` if no custom team exists (as per spec FR-015)
- Validate team lead has at least 1 move before battle starts

**Alternatives Considered**:
- Create new integration service: Unnecessary duplication, existing services sufficient
- Duplicate team data in battle store: Violates single source of truth principle
- Build team selection UI in battle: Wrong separation of concerns, belongs in Team Builder view

---

### 5. HP Bar Animation Best Practices

**Question**: How to implement smooth HP bar animations that maintain 60fps performance?

**Research Findings**:

**Performance Considerations**:
- HP bar width changes frequently during battle (every attack)
- Must avoid layout thrashing (reflow/repaint)
- Target: <16ms per update for 60fps

**CSS Properties Performance**:
- ✅ `transform: scaleX()`: GPU-accelerated, no reflow, best performance
- ✅ `width`: Triggers repaint but not reflow if element size doesn't affect layout
- ❌ `max-width`: Same as width but more specificity confusion
- ❌ JavaScript-based interpolation: Unnecessary overhead, CSS transitions sufficient

**Current Implementation** (BattleScreen.vue line 303):
```vue
<div
  class="hp-bar-inner"
  :style="{
    width: playerHpPercent + '%',
    backgroundColor: getHpColor(playerHpPercent)
  }"
/>
```

With CSS:
```css
.hp-bar-inner {
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Analysis**: Current implementation uses `width` with CSS transition. This is acceptable performance-wise since HP bars are small elements that don't affect layout of other components.

**Spec Requirement** (FR-018): "animate HP bar changes smoothly over 500ms with easing function"

**Decision**: Keep `width`-based approach but update timing to 500ms per spec. Consider `transform: scaleX()` optimization if performance issues arise in testing.

**Rationale**: Current pattern works, changing to `transform` requires refactoring HTML structure (origin point, reverse scaling for text), adds complexity without proven need. Spec explicitly requires 500ms, not current 400ms.

**Optimized Implementation** (if needed):
```vue
<div class="hp-bar-outer">
  <div class="hp-bar-fill" :style="{ transform: `scaleX(${playerHpPercent / 100})` }">
    <div class="hp-bar-content"><!-- Text with reverse scale --></div>
  </div>
</div>
```

Pros: GPU-accelerated, guaranteed 60fps
Cons: More complex HTML, text needs counter-scaling, harder to maintain

**Decision**: Start with width-based animation (500ms), monitor performance, optimize to transform if frame drops detected in testing.

**Alternatives Considered**:
- Spring physics (React Spring, Vue Use Motion): Overkill for simple percentage interpolation, bundle weight concern
- RAF-based manual animation: Reinventing CSS transitions, more bugs, worse performance
- FLIP technique: Designed for element position changes, not applicable to bar width

---

### 6. Sprite Loading & Fallback Strategy

**Question**: How to handle sprite loading errors gracefully without breaking battle flow?

**Research Findings**:

**Error Scenarios**:
1. PokemonShowdown API unreachable (network error)
2. Sprite URL returns 404 (Pokemon variant not available)
3. Image fails to decode (corrupt GIF)
4. Slow loading (>3 seconds)

**Fallback Hierarchy**:
```
1. Animated sprite (PokemonShowdown): https://play.pokemonshowdown.com/sprites/ani-back/{name}.gif
2. Static sprite (PokemonShowdown): https://play.pokemonshowdown.com/sprites/dex/{name}.png
3. Existing sprite map: getPokemonBackSpriteUrl(name) [current implementation]
4. Placeholder: Generic Pokemon silhouette with name overlay
```

**Implementation Pattern**:

**Composable: `useSpriteLoader.ts`**
```typescript
interface SpriteLoaderOptions {
  pokemonName: string
  view: 'front' | 'back'
  timeout?: number // Default 3000ms
}

interface SpriteLoaderResult {
  spriteUrl: Ref<string>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
  retry: () => void
}

export function useSpriteLoader(options: SpriteLoaderOptions): SpriteLoaderResult {
  const spriteUrl = ref('')
  const isLoading = ref(true)
  const error = ref<Error | null>(null)
  
  const loadSprite = async () => {
    try {
      const animatedUrl = buildPokemonShowdownUrl(options.pokemonName, options.view, 'animated')
      const loaded = await testImageLoad(animatedUrl, options.timeout)
      if (loaded) {
        spriteUrl.value = animatedUrl
        return
      }
      
      // Fallback to static
      const staticUrl = buildPokemonShowdownUrl(options.pokemonName, options.view, 'static')
      const staticLoaded = await testImageLoad(staticUrl, options.timeout)
      if (staticLoaded) {
        spriteUrl.value = staticUrl
        return
      }
      
      // Fallback to existing sprite map
      spriteUrl.value = options.view === 'back' 
        ? getPokemonBackSpriteUrl(options.pokemonName)
        : getPokemonFrontSpriteUrl(options.pokemonName)
        
    } catch (err) {
      error.value = err as Error
      // Final fallback
      spriteUrl.value = PLACEHOLDER_SPRITE_URL
    } finally {
      isLoading.value = false
    }
  }
  
  onMounted(loadSprite)
  
  return { spriteUrl, isLoading, error, retry: loadSprite }
}
```

**Image Load Testing**:
```typescript
function testImageLoad(url: string, timeout: number): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    const timer = setTimeout(() => {
      img.src = '' // Cancel loading
      resolve(false)
    }, timeout)
    
    img.onload = () => {
      clearTimeout(timer)
      resolve(true)
    }
    
    img.onerror = () => {
      clearTimeout(timer)
      resolve(false)
    }
    
    img.src = url
  })
}
```

**Decision**: Implement `useSpriteLoader` composable with 3-tier fallback hierarchy and 3-second timeout.

**Rationale**: Encapsulates loading logic, reusable for both player and enemy sprites, provides loading states for UI feedback, gracefully degrades without breaking battles.

**UI Loading States**:
- `isLoading === true`: Show skeleton/shimmer placeholder
- `error !== null && spriteUrl === PLACEHOLDER`: Show error icon with Pokemon name overlay
- Success: Display sprite normally

**Alternatives Considered**:
- Synchronous loading with immediate fallback: Poor UX, no loading feedback, jarring sprite pop-in
- Preload all sprites at app start: Memory intensive, slow initial load, violates performance budget
- Service worker caching: Over-engineered for this use case, adds complexity without clear benefit
- Suspense boundaries: Vue 3 Suspense not yet stable for production use, unnecessary for single component

---

## Technology Stack Summary

### Core Technologies
- **Vue 3.5.22**: Composition API with `<script setup>` syntax
- **TypeScript 5.9+**: Strict mode, all new code fully typed
- **Vite 7.1.11**: Build tool, HMR for dev experience
- **Pinia 3.0.3**: State management (battle, team stores)

### Styling & UI
- **Tailwind CSS 3.4.17**: Utility-first styling, neumorphism/glassmorphism via arbitrary values
- **shadcn-vue**: Component library (buttons, cards, skeletons) - customized for design system
- **Radix Vue 1.9.17**: Headless UI primitives (shadcn-vue dependency)
- **class-variance-authority 0.7.1**: Component variant management

### External APIs
- **PokemonShowdown Sprite API**: Animated Pokemon sprites (primary source)
- **Existing sprite map**: Static fallback sprites (already implemented)

### Testing
- **Vitest 4.0.14**: Unit and integration testing
- **@vue/test-utils 2.4.6**: Vue component testing utilities

### Performance
- **Bundle size budget**: <500KB gzipped (current: ~350KB, room for ~50KB new code)
- **Animation target**: 60fps (<16ms frame time)
- **Sprite loading target**: <2 seconds (95th percentile)

---

## Decisions Summary

| Decision | Chosen Approach | Rationale |
|----------|----------------|-----------|
| **Sprite Source** | PokemonShowdown API with fallback hierarchy | Most comprehensive animated sprites, free/public, graceful degradation |
| **Design Implementation** | Tailwind utilities with arbitrary shadow values | Constitutional compliance, maintainable, no custom CSS needed |
| **Animation Timing** | CSS animations with centralized timing constants | Simple, performant, easy to maintain, matches spec requirements |
| **Attack Button State** | Reactive `isAttacking` ref with setTimeout | Straightforward state management, predictable timing |
| **Team Integration** | Existing Battle/Team store infrastructure | Already implemented in Feature 003, no duplication needed |
| **HP Bar Animation** | CSS `width` transition (500ms cubic-bezier) | Acceptable performance, simple implementation, spec-compliant |
| **Sprite Loading** | `useSpriteLoader` composable with 3-tier fallback | Reusable, encapsulated, provides loading states, error resilient |

---

## Next Steps (Phase 1)

With all technical unknowns resolved, proceed to:

1. **data-model.md**: Define TypeScript interfaces for sprite loader state, animation timing, UI state
2. **contracts/**: Create type definitions for PokemonShowdown API responses and battle UI state
3. **quickstart.md**: Document sprite URL patterns, Tailwind neumorphism classes, animation timing constants

All decisions logged here will guide Phase 1 design and Phase 2 implementation.
