# Quick Start: Modern BattleScreen UI

**Feature**: 004-modern-battle-ui  
**Created**: November 30, 2025  
**Audience**: Developers implementing this feature

## Overview

This guide provides essential patterns, code snippets, and best practices for implementing the modernized BattleScreen with animated sprites, neumorphic/glassy UI, and improved UX.

## Prerequisites

- Feature 003 (Pokemon Team Builder) completed and functional
- Tailwind CSS 3.4.17+ configured
- shadcn-vue components installed
- TypeScript 5.9+ with strict mode enabled

## Key Concepts

### 1. Animated Sprites from PokemonShowdown

**Pattern**: Use `useSpriteLoader` composable for automatic fallback handling

```typescript
// In BattleScreen.vue <script setup>
import { useSpriteLoader } from '@/composables/useSpriteLoader'

// Load player Pokemon sprite (back view)
const {
  spriteUrl: playerSpriteUrl,
  isLoading: playerSpriteLoading,
  error: playerSpriteError,
  tier: playerSpriteTier
} = useSpriteLoader({
  pokemonName: battleStore.player.name,
  view: 'back',
  timeout: 3000
})

// Load enemy Pokemon sprite (front view)
const {
  spriteUrl: enemySpriteUrl,
  isLoading: enemySpriteLoading,
  error: enemySpriteError,
  tier: enemySpriteTier
} = useSpriteLoader({
  pokemonName: battleStore.npc.name,
  view: 'front',
  timeout: 3000
})
```

**Template Usage**:
```vue
<template>
  <!-- Player sprite with loading state -->
  <div v-if="playerSpriteLoading" class="sprite-skeleton">
    <!-- Shimmer loading animation -->
    <div class="animate-pulse bg-gray-200 w-40 h-40 rounded-full"></div>
  </div>
  <img
    v-else
    :src="playerSpriteUrl"
    :alt="battleStore.player.name"
    class="pokemon-sprite player-sprite"
  />
</template>
```

**Fallback Behavior**:
1. Tries animated GIF: `https://play.pokemonshowdown.com/sprites/ani-back/charizard.gif`
2. Falls back to static PNG: `https://play.pokemonshowdown.com/sprites/dex/charizard.png`
3. Falls back to legacy sprite: Existing `getPokemonBackSpriteUrl()`
4. Final fallback: Placeholder image with name overlay

---

### 2. Neumorphic Button Styling

**Pattern**: Use Tailwind arbitrary shadow values for soft embossed effect

```vue
<template>
  <button
    class="
      bg-gray-100 
      shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.9)]
      hover:shadow-[2px_2px_4px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.9)]
      active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)]
      rounded-xl
      px-6 py-3
      transition-all duration-150
      disabled:opacity-50 disabled:cursor-not-allowed
    "
    :disabled="isAttacking"
    @click="handleFight"
  >
    <span class="text-sm font-bold text-gray-800">FIGHT</span>
  </button>
</template>
```

**Key Tailwind Classes**:
- `shadow-[...]`: Custom shadow for neumorphic effect (soft dual shadows)
- `hover:translate-x-[1px]`: Subtle movement on hover (press illusion)
- `active:shadow-[inset...]`: Inset shadow for pressed state
- `rounded-xl`: Soft rounded corners (16px)
- `transition-all duration-150`: Smooth state changes

---

### 3. Glassmorphic Panel Styling

**Pattern**: Use backdrop blur and semi-transparent backgrounds

```vue
<template>
  <div
    class="
      bg-white/20
      backdrop-blur-lg
      border border-white/30
      shadow-xl
      rounded-2xl
      p-4
    "
  >
    <!-- Panel content -->
    <div class="text-white">
      <h3 class="text-lg font-bold">Pokemon Info</h3>
      <p class="text-sm">HP: 100/100</p>
    </div>
  </div>
</template>
```

**Key Tailwind Classes**:
- `bg-white/20`: 20% opacity white background
- `backdrop-blur-lg`: Blur background content (frosted glass)
- `border-white/30`: Semi-transparent border
- `shadow-xl`: Depth shadow for elevation
- `rounded-2xl`: Larger rounded corners (24px)

**Browser Compatibility**: `backdrop-filter` supported in all target browsers (last 2 versions of Chrome/Firefox/Safari/Edge)

---

### 4. Attack Animation Sequence

**Pattern**: Manage attack state with reactive ref and setTimeout

```typescript
import { ANIMATION_TIMINGS } from '@/constants/animations'

// Attack state
const attackState = ref<AttackAnimationState>({
  isActive: false,
  target: 'player',
  phase: 'idle',
  startTime: 0,
  moveType: 'normal'
})

// Handle move selection
async function handleMoveSelected(moveId: string) {
  // Disable attack buttons
  attackState.value = {
    isActive: true,
    target: 'enemy',
    phase: 'charging',
    startTime: Date.now(),
    moveType: getMoveType(moveId) // Get type from move data
  }
  
  // Execute battle action (parallel with animation)
  await battleStore.selectPlayerMove(moveId)
  
  // Re-enable buttons after animation completes
  setTimeout(() => {
    attackState.value = {
      isActive: false,
      target: 'enemy',
      phase: 'idle',
      startTime: 0,
      moveType: 'normal'
    }
  }, ANIMATION_TIMINGS.ATTACK_TOTAL_MS) // 600ms
}
```

**Template Class Bindings**:
```vue
<template>
  <img
    :src="playerSpriteUrl"
    :alt="battleStore.player.name"
    :class="[
      'pokemon-sprite player-sprite',
      {
        'attack-charging': attackState.isActive && attackState.phase === 'charging' && attackState.target === 'enemy',
        'attack-impact': attackState.isActive && attackState.phase === 'impact' && attackState.target === 'enemy'
      }
    ]"
  />
</template>
```

**CSS Animation** (in `<style scoped>`):
```css
.pokemon-sprite {
  transition: transform 150ms ease-out;
}

.player-sprite.attack-charging {
  animation: chargeForward 300ms ease-out;
}

@keyframes chargeForward {
  0% {
    transform: translate(0, 0) scale(1);
  }
  100% {
    transform: translate(50px, -20px) scale(1.1);
  }
}

.player-sprite.attack-impact {
  animation: holdAndReturn 300ms ease-in;
}

@keyframes holdAndReturn {
  0% {
    transform: translate(50px, -20px) scale(1.1); /* Hold at peak */
  }
  33% {
    transform: translate(50px, -20px) scale(1.1); /* Hold 100ms */
  }
  100% {
    transform: translate(0, 0) scale(1); /* Return 200ms */
  }
}
```

**Timing Breakdown**:
- 0-300ms: Charge forward (player sprite moves toward enemy)
- 300-400ms: Hold at peak (impact moment, damage applied)
- 400-600ms: Return to origin (sprite returns to starting position)
- 600ms: Re-enable attack buttons

---

### 5. HP Bar Animation

**Pattern**: CSS transition on width property with easing

```vue
<template>
  <div class="hp-bar-outer">
    <div
      class="hp-bar-inner"
      :style="{
        width: `${hpPercent}%`,
        backgroundColor: getHpColor(hpPercent)
      }"
    />
  </div>
</template>

<style scoped>
.hp-bar-outer {
  width: 100%;
  height: 8px;
  background: #2d2d2d;
  border-radius: 4px;
  overflow: hidden;
}

.hp-bar-inner {
  height: 100%;
  transition: width 500ms cubic-bezier(0.4, 0, 0.2, 1); /* Spec requirement: 500ms */
}
</style>
```

**Color Function**:
```typescript
function getHpColor(percent: number): string {
  if (percent > 50) return '#10b981' // green-500
  if (percent > 25) return '#fbbf24' // yellow-400
  return '#ef4444' // red-500
}
```

---

### 6. Team Builder Integration

**Pattern**: Load team from `useTeamStore()` when starting battle

```typescript
// In BattleView.vue or route handler
import { useTeamStore } from '@/stores/team'
import { useRouter } from 'vue-router'

const teamStore = useTeamStore()
const router = useRouter()

async function startBattle() {
  // Check if user has custom team
  if (teamStore.roster.length > 0 && teamStore.hasLeadPokemon) {
    // Use custom team
    const playerTeam = teamStore.roster.map(member => 
      transformTeamMemberToBattlePokemon(member)
    )
    
    router.push({
      name: 'battle',
      params: { playerTeam } // Pass to BattleScreen
    })
  } else {
    // Fallback to default team (SAMPLE_PLAYER)
    router.push({ name: 'battle' })
  }
}
```

**BattleScreen Props**:
```typescript
interface Props {
  trainer?: Trainer
  playerTeam?: Pokemon[] // Custom team from Team Builder
}

const props = defineProps<Props>()

onMounted(() => {
  // Use custom team if provided, otherwise fallback
  const team = props.playerTeam || PLAYER_TEAM
  
  if (isTrainerBattle.value && props.trainer) {
    await startTrainerBattle(props.trainer, team)
  } else {
    await battleStore.startBattle(team, [SAMPLE_NPC])
  }
})
```

---

## Common Patterns

### Disabling Attack Buttons

```typescript
// Computed property for button disabled state
const attackButtonsDisabled = computed(() => {
  return attackState.value.isActive || currentView.value !== 'fight'
})
```

```vue
<template>
  <button
    v-for="move in battleStore.player.moves"
    :key="move.id"
    :disabled="attackButtonsDisabled"
    @click="handleMoveSelected(move.id)"
  >
    {{ move.name }}
  </button>
</template>
```

### Loading States with Skeletons

```vue
<template>
  <!-- While sprite is loading -->
  <div v-if="isLoading" class="sprite-placeholder">
    <div class="animate-pulse space-y-4">
      <div class="h-32 w-32 bg-gray-300 rounded-full mx-auto"></div>
      <div class="h-4 bg-gray-300 rounded w-24 mx-auto"></div>
    </div>
  </div>
  
  <!-- After sprite loads -->
  <img v-else :src="spriteUrl" class="pokemon-sprite" />
</template>
```

### Error Handling with Fallback UI

```vue
<template>
  <div v-if="spriteError" class="sprite-error">
    <div class="text-center p-4">
      <span class="text-red-500 text-sm">Failed to load sprite</span>
      <p class="text-gray-600 mt-2">{{ pokemonName }}</p>
      <button @click="retry" class="mt-2 text-blue-500 underline">
        Retry
      </button>
    </div>
  </div>
</template>
```

---

## Configuration Reference

### Animation Timings

```typescript
// src/constants/animations.ts
export const ANIMATION_TIMINGS = {
  ATTACK_CHARGE_MS: 300,
  ATTACK_HOLD_MS: 100,
  ATTACK_RETURN_MS: 200,
  ATTACK_TOTAL_MS: 600,
  DAMAGE_EFFECT_MS: 300,
  HP_BAR_TRANSITION_MS: 500,
  VIEW_TRANSITION_MS: 200,
  SPRITE_LOAD_TIMEOUT_MS: 3000,
  EASING_ATTACK: 'cubic-bezier(0.4, 0, 0.2, 1)',
  EASING_HP_BAR: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const
```

### Sprite URL Patterns

```typescript
// Animated back sprite (player)
https://play.pokemonshowdown.com/sprites/ani-back/{pokemon-name}.gif

// Animated front sprite (enemy)
https://play.pokemonshowdown.com/sprites/ani/{pokemon-name}.gif

// Static fallback
https://play.pokemonshowdown.com/sprites/dex/{pokemon-name}.png
```

**Name Normalization**:
- Lowercase: "Pikachu" → "pikachu"
- Spaces to hyphens: "Mr. Mime" → "mr-mime"
- Remove apostrophes: "Farfetch'd" → "farfetchd"
- Remove colons: "Type: Null" → "typenull"

---

## Testing Checklist

- [ ] Animated sprites load within 2 seconds for 95% of Pokemon
- [ ] Attack buttons remain disabled for full 600ms animation sequence
- [ ] HP bar animates smoothly over 500ms without jarring jumps
- [ ] Neumorphic buttons show hover/active states correctly
- [ ] Glassmorphic panels have proper backdrop blur effect
- [ ] Sprite fallback works when PokemonShowdown API fails
- [ ] Team Builder integration loads custom team correctly
- [ ] Fallback to SAMPLE_PLAYER works when no custom team exists
- [ ] Attack charge animation synchronizes with damage application
- [ ] View transitions fade smoothly in 200ms

---

## Troubleshooting

### Sprite not loading

**Symptom**: Sprite shows placeholder or fails to load  
**Solution**: Check Pokemon name normalization in browser console
```typescript
console.log(normalizePokemonName('Farfetch\'d')) // Should output 'farfetchd'
```

### Attack buttons not re-enabling

**Symptom**: Move buttons stay disabled after attack  
**Solution**: Verify `ANIMATION_TIMINGS.ATTACK_TOTAL_MS` matches CSS animation duration
```typescript
console.log(ANIMATION_TIMINGS.ATTACK_TOTAL_MS) // Should be 600
```

### Backdrop blur not working

**Symptom**: Glassmorphic panels don't show frosted glass effect  
**Solution**: Check browser support for `backdrop-filter` in DevTools. Add fallback:
```css
@supports not (backdrop-filter: blur(10px)) {
  .glassmorphic-panel {
    background: rgba(255, 255, 255, 0.9); /* Opaque fallback */
  }
}
```

### HP bar jumping instead of animating

**Symptom**: HP bar width changes instantly, no smooth transition  
**Solution**: Ensure CSS transition is applied to `.hp-bar-inner` class
```css
.hp-bar-inner {
  transition: width 500ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## Next Steps

1. Implement `useSpriteLoader` composable in `src/composables/useSpriteLoader.ts`
2. Create `spriteNormalizer.ts` utility for name normalization
3. Update `BattleScreen.vue` with animated sprites and neumorphic styling
4. Add attack animation state management and button disabling logic
5. Write unit tests for sprite normalization and image loading
6. Write integration tests for battle animation sequence
7. Test sprite fallback behavior with network throttling

For detailed implementation tasks, see `tasks.md` (generated via `/speckit.tasks` command).
