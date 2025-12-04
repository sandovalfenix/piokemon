# Quickstart: Wild Encounter & Capture Module

**Feature**: 007-wild-encounter-capture  
**Date**: 2025-12-04

## Prerequisites

- Node.js 20.19+ or 22.12+
- pnpm installed
- Project dependencies installed (`pnpm install`)
- Development server running (`pnpm dev`)

## Feature Overview

This feature adds wild Pokémon capture functionality to the battle system:

1. **Expanded Encounter Pool**: 50 base-stage Pokémon (up from 6)
2. **Capture in Battle**: "Capturar" button appears during wild battles
3. **Gen 3 Capture Formula**: Uses existing `captureEngine.ts` (unchanged)
4. **PC Box Storage**: Overflow when team is full (6 Pokémon)

## Quick Test Flow

### 1. Start Wild Encounter

```
HomeView → Click "Explorar" → Buscar animation → Capturar preview
```

### 2. Enter Battle

```
Capturar preview → Click "¡Batalla!" → BattleView loads (wild mode)
```

### 3. Attempt Capture

```
BattleView → Click "Capturar" → Select ball → Watch shake animation
```

### 4. Capture Result

- **Success**: FinalCaptura shows → Pokémon saved to team or PC Box
- **Failure**: Overlay closes → Battle continues → Try again

## Key Files

| File | Purpose |
|------|---------|
| `src/data/encounterWhitelist.ts` | 50 Pokémon IDs for encounters |
| `src/composables/useCapture.ts` | Capture state management |
| `src/components/capture/CaptureOverlay.vue` | Ball selection + shake animation |
| `src/stores/pcBox.ts` | PC Box storage |
| `src/stores/battle.ts` | Modified - `isWildBattle` flag |
| `src/views/BattleView.vue` | Modified - "Capturar" button |
| `src/components/Capturar.vue` | Modified - "¡Batalla!" button |

## Development Commands

```bash
# Start dev server
pnpm dev

# Type check (REQUIRED before commit)
pnpm type-check

# Run tests
pnpm test

# Lint
pnpm lint
```

## Testing Checklist

- [ ] Wild encounter generates Pokémon from 50-ID pool
- [ ] Capturar.vue shows real types from PokéAPI (not name-based)
- [ ] "Capturar" button only appears in wild battles
- [ ] Ball selection opens inventarioball.vue overlay
- [ ] Shake animation plays (0-3 shakes)
- [ ] Capture success ends battle, shows FinalCaptura
- [ ] Capture failure continues battle
- [ ] Captured Pokémon saved to team (if < 6)
- [ ] Captured Pokémon saved to PC Box (if team = 6)
- [ ] Data persists after browser refresh

## Common Issues

### PokéAPI timeout
- Check network connection
- Pokémon data is cached after first fetch

### Capture always fails
- Verify `captureEngine.ts` is unchanged
- Lower HP = higher catch rate (work as intended)

### PC Box not persisting
- Check browser localStorage quota
- Verify `pcbox-pokemon` key in DevTools → Application → LocalStorage

## Constitution Compliance

This feature follows all constitution principles:

- ✅ **Tailwind-Only**: No `<style>` blocks (except keyframe animation with justification)
- ✅ **Component-First**: New components are self-contained
- ✅ **Type Safety**: All code is TypeScript strict
- ✅ **Pinia State**: pcBoxStore follows existing patterns
- ✅ **PokéAPI**: All Pokémon data from API
- ✅ **shadcn-vue**: Uses Dialog, Button components
