# Quickstart Guide: Battle Module Update

**Feature**: 006-battle-module-update  
**Date**: 2025-12-03  
**Branch**: `006-battle-module-update`

## Prerequisites

- Node.js 18+
- npm 9+
- Git
- VS Code with Vue Official extension

## Setup

### 1. Clone and Install

```bash
git clone <repo-url>
cd pkmn-mmo
git checkout 006-battle-module-update
npm install
```

### 2. Verify Development Environment

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Tests
npm run test

# Start dev server
npm run dev
```

The app should be running at `http://localhost:5173`

## Project Structure for This Feature

```
src/
├── components/battle/
│   ├── DefeatModal.vue        # NEW - Shadcn Dialog for defeats
│   ├── MoveLearningModal.vue  # NEW - Move replacement UI
│   └── WildBattleButton.vue   # NEW - Wild encounter trigger
├── data/
│   ├── gymLeaders.ts          # EXISTING - 5 Cali gym leaders ✓
│   ├── thematicNpcs.ts        # NEW - NPCs per gym
│   └── wildPokemonPool.ts     # NEW - Wild encounter pool
├── models/
│   ├── progressState.ts       # NEW - Progress interfaces
│   ├── battleOutcome.ts       # NEW - Outcome types
│   └── moveLearning.ts        # NEW - Move learning types
├── services/
│   ├── battle/                # MODIFY - Add outcome handlers
│   └── progress/              # NEW - Progress persistence
├── stores/
│   ├── battle.ts              # MODIFY - Level scaling, outcomes
│   ├── team.ts                # EXISTING - Team management ✓
│   └── progress.ts            # NEW - Story progression
└── views/
    ├── HomeView.vue           # MODIFY - Progress UI, wild button
    └── BattleView.vue         # MODIFY - Outcome integration

specs/006-battle-module-update/
├── spec.md                    # Feature specification
├── plan.md                    # This implementation plan
├── research.md                # Research findings
├── data-model.md              # Entity definitions
├── quickstart.md              # This file
└── contracts/                 # TypeScript interfaces
    ├── progress-state.ts
    ├── battle-outcomes.ts
    └── move-learning.ts
```

## Development Workflow

### Step 1: Create New Files

```bash
# Create new data files
touch src/data/thematicNpcs.ts
touch src/data/wildPokemonPool.ts

# Create new models
touch src/models/progressState.ts
touch src/models/battleOutcome.ts
touch src/models/moveLearning.ts

# Create new store
touch src/stores/progress.ts

# Create new services
mkdir -p src/services/progress
touch src/services/progress/progressService.ts

# Create new components
touch src/components/battle/DefeatModal.vue
touch src/components/battle/MoveLearningModal.vue
touch src/components/battle/WildBattleButton.vue
```

### Step 2: Add Required Shadcn Components

```bash
# Ensure Dialog is available
npx shadcn-vue@latest add dialog

# Ensure Select is available (for move selection)
npx shadcn-vue@latest add select

# Verify button is available
npx shadcn-vue@latest add button
```

### Step 3: Implementation Order

1. **Models first** - Define TypeScript interfaces
2. **Store second** - Create progress store with persistence
3. **Data third** - Create thematic NPCs and wild pool
4. **Services fourth** - Implement progress and outcome services
5. **Components fifth** - Build UI components
6. **Integration last** - Wire everything together

## Key Implementation Patterns

### Level Scaling (battle store)

```typescript
// In battle initialization
function initializeBattle(opponentLevel: number, playerTeam: Pokemon[]) {
  const scaledLevel = Math.max(1, opponentLevel - 2)
  
  const scaledTeam = playerTeam.map(p => ({
    ...p,
    level: scaledLevel,
    // Recalculate stats based on new level
    stats: calculateStats(p.baseStats, scaledLevel),
    currentHp: calculateMaxHp(p.baseStats.hp, scaledLevel)
  }))
  
  return { scaledTeam, scaledLevel }
}
```

### Status Move Filtering (move selector)

```typescript
// In MoveSelector.vue
const usableMoves = computed(() => 
  pokemon.moves.filter(m => m.category !== 'status')
)
```

### Progress Persistence (store)

```typescript
// In progress store
import { watch } from 'vue'

const progress = ref<ProgressState>(DEFAULT_PROGRESS)

// Auto-save on change
watch(progress, (newVal) => {
  localStorage.setItem('pkmn-progress', JSON.stringify(newVal))
}, { deep: true })

// Load on mount
function loadProgress() {
  const saved = localStorage.getItem('pkmn-progress')
  if (saved) {
    try {
      progress.value = JSON.parse(saved)
    } catch {
      resetProgress()
    }
  }
}
```

### Defeat Modal (shadcn Dialog)

```vue
<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>¡Derrota!</DialogTitle>
        <DialogDescription>{{ defeatMessage }}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button @click="handleReturn">Volver al Lobby</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
```

## Testing Strategy

### Unit Tests (priority)

```bash
# Level scaling
tests/unit/domain/battle/levelScaling.spec.ts

# Status move filter
tests/unit/domain/battle/statusMoveFilter.spec.ts

# Progress persistence
tests/unit/stores/progress.spec.ts
```

### Integration Tests

```bash
# Linear progression flow
tests/integration/components/progressFlow.spec.ts

# Battle outcomes
tests/integration/components/battleOutcomes.spec.ts
```

### Manual Testing Checklist

- [ ] Start fresh game, verify Gym 1 NPCs available
- [ ] Defeat NPC, verify marked as complete
- [ ] Defeat all NPCs, verify Gym Leader unlocked
- [ ] Defeat Gym Leader, verify next gym unlocked
- [ ] Lose battle, verify Defeat Modal shows
- [ ] Win battle, verify full heal and lobby redirect
- [ ] Test move learning with 4-move Pokémon
- [ ] Test wild battle button functionality
- [ ] Refresh browser, verify progress persisted

## Common Issues & Solutions

### Issue: Level scaling not applying

**Solution**: Ensure scaling happens in battle store initialization, not team store.

### Issue: Status moves still appearing

**Solution**: Check filter is in move selector component, not data layer.

### Issue: Progress not persisting

**Solution**: Verify localStorage key matches, check for JSON parse errors.

### Issue: Shadcn Dialog not working

**Solution**: Ensure `Dialog` components are imported from `@/components/ui/dialog`.

## Useful Commands

```bash
# Run type checking in watch mode
npm run type-check -- --watch

# Run specific test file
npm run test -- levelScaling

# Check for lint errors
npm run lint

# Build for production (verify no errors)
npm run build

# Preview production build
npm run preview
```

## Resources

- [Spec Document](./spec.md) - Full requirements
- [Data Model](./data-model.md) - Entity definitions
- [Research](./research.md) - Technical decisions
- [Contracts](./contracts/) - TypeScript interfaces
- [Constitution](../../.specify/memory/constitution.md) - Project principles

## Need Help?

1. Check the spec for acceptance criteria
2. Review data-model.md for entity structures
3. Reference contracts/ for TypeScript interfaces
4. Consult constitution.md for code standards
