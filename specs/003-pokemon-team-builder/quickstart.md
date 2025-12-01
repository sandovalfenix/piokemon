# Quickstart Guide: Pokemon Team Builder

**Feature**: 003-pokemon-team-builder  
**Audience**: Developers implementing this feature  
**Purpose**: Fast-track guide to understanding and implementing the team builder

---

## 🎯 What We're Building

A Pokemon team builder that lets users:
1. Browse 1000+ Pokemon from PokeAPI
2. Select 4 moves per Pokemon
3. Build teams of 1-6 Pokemon
4. Start battles with custom teams

**Integration Point**: Replaces hardcoded `SAMPLE_PLAYER` in existing battle system.

---

## 🏗️ Architecture at a Glance

```
User → TeamBuilderView → PokemonCatalog → pokemonService → PokeAPI
                       ↓
                   MoveSelector → moveService → PokeAPI
                       ↓
                   TeamRoster → team store (Pinia) → localStorage
                       ↓
              "Start Battle" → battle store → BattleUI
```

**Data Flow**:
1. Fetch Pokemon from PokeAPI → transform → display
2. User selects Pokemon + moves → create TeamMember
3. Add to team store → persist to localStorage
4. Start battle → pass team[0] to battle store

---

## 📁 Files You'll Create

### Core Services (5 files)
```
src/services/teamBuilder/
├── types.ts              # PokeAPI response interfaces
├── pokemonService.ts     # Fetch & transform Pokemon
├── moveService.ts        # Fetch & transform moves
├── teamCache.ts          # localStorage persistence
└── index.ts              # Barrel export
```

### Pinia Store (1 file)
```
src/stores/
└── team.ts               # Team roster state management
```

### Vue Components (4 files)
```
src/components/teamBuilder/
├── PokemonCatalog.vue    # Pokemon list with pagination
├── PokemonCard.vue       # Individual Pokemon display
├── MoveSelector.vue      # Move selection interface
└── TeamRoster.vue        # Team management UI
```

### View & Route (2 modifications)
```
src/views/
└── TeamBuilderView.vue   # NEW: Main team builder page

src/router/index.ts       # MODIFY: Add /team-builder route
```

### Modifications (2 files)
```
src/stores/battle.ts      # MODIFY: Accept custom team
src/views/HomeView.vue    # MODIFY: Add team builder link
```

### Models (1 file)
```
src/models/
└── teamBuilder.ts        # TypeScript interfaces (Pokemon, Move, TeamMember, Team)
```

---

## 🚀 Implementation Phases

### Phase 1: Setup & Models (30 min)
1. Create `src/models/teamBuilder.ts` with all interfaces
2. Create `src/services/teamBuilder/types.ts` with PokeAPI types
3. Copy-paste interfaces from `data-model.md`

**Validation**: TypeScript compiles with no errors.

---

### Phase 2: Services Layer (2 hours)

#### Step 1: Reuse PokeAPI Client (15 min)
```typescript
// src/services/teamBuilder/pokemonService.ts
import { fetchType } from '../typeChart/pokeApiClient' // Reuse!

// Adapt for /pokemon endpoint
async function fetchPokemon(id: number): Promise<Pokemon> {
  // Similar pattern to fetchType from Feature 002
}
```

#### Step 2: Transform Functions (45 min)
```typescript
// pokemonService.ts
function transformPokeAPIToPokemon(api: PokeAPIResponse): Pokemon {
  // See data-model.md for exact mapping
}

// moveService.ts
function transformPokeAPIToMove(api: PokeAPIMoveResponse): Move {
  // Handle nullable power for status moves
}
```

#### Step 3: Caching (30 min)
```typescript
// teamCache.ts
export function saveTeamToLocalStorage(team: Team): void {
  try {
    localStorage.setItem('pokemon-team-v1', JSON.stringify(team))
  } catch (error) {
    console.error('localStorage full:', error)
  }
}

export function loadTeamFromLocalStorage(): Team | null {
  // Parse + validate
}
```

#### Step 4: Tests (30 min)
```bash
npm run test -- services/teamBuilder
```

**Validation**: All service tests pass, 100% coverage.

---

### Phase 3: Pinia Store (1 hour)

```typescript
// src/stores/team.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Team, TeamMember } from '@/models/teamBuilder'
import { loadTeamFromLocalStorage, saveTeamToLocalStorage } from '@/services/teamBuilder'

export const useTeamStore = defineStore('team', () => {
  // State
  const roster = ref<TeamMember[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  function addPokemonToTeam(member: TeamMember) {
    if (roster.value.length >= 6) {
      error.value = 'Team is full (6/6)'
      return
    }
    member.position = roster.value.length
    roster.value.push(member)
    saveTeamToLocalStorage({ members: roster.value, version: 1, createdAt: Date.now(), updatedAt: Date.now() })
  }

  function removePokemonFromTeam(position: number) {
    roster.value.splice(position, 1)
    // Reindex positions
    roster.value.forEach((m, idx) => m.position = idx)
    saveTeamToLocalStorage(/* ... */)
  }

  function loadTeam() {
    const cached = loadTeamFromLocalStorage()
    if (cached) roster.value = cached.members
  }

  return { roster, isLoading, error, addPokemonToTeam, removePokemonFromTeam, loadTeam }
})
```

**Validation**: Store tests pass, can add/remove Pokemon.

---

### Phase 4: UI Components (3 hours)

#### Component 1: PokemonCatalog (1 hour)
```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchPokemonList } from '@/services/teamBuilder'
import PokemonCard from './PokemonCard.vue'

const pokemon = ref<Pokemon[]>([])
const currentPage = ref(1)
const pageSize = 20

async function loadPage(page: number) {
  const offset = (page - 1) * pageSize
  pokemon.value = await fetchPokemonList(pageSize, offset)
}

onMounted(() => loadPage(1))
</script>

<template>
  <div class="catalog">
    <PokemonCard v-for="p in pokemon" :key="p.id" :pokemon="p" @select="$emit('select-pokemon', p)" />
    <button @click="loadPage(currentPage - 1)">Prev</button>
    <button @click="loadPage(currentPage + 1)">Next</button>
  </div>
</template>
```

#### Component 2: MoveSelector (1 hour)
```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { Pokemon, Move } from '@/models/teamBuilder'

const props = defineProps<{ pokemon: Pokemon }>()
const selectedMoves = ref<Move[]>([])

function addMove(move: Move) {
  if (selectedMoves.value.length >= 4) return
  selectedMoves.value.push(move)
}
</script>

<template>
  <div class="move-selector">
    <h3>Select moves for {{ pokemon.name }}</h3>
    <div v-for="move in pokemon.moves" :key="move.id">
      <button @click="addMove(move)">{{ move.name }}</button>
    </div>
    <button @click="$emit('confirm', selectedMoves)">Add to Team</button>
  </div>
</template>
```

#### Component 3: TeamRoster (1 hour)
```vue
<script setup lang="ts">
import { useTeamStore } from '@/stores/team'

const teamStore = useTeamStore()
</script>

<template>
  <div class="team-roster">
    <h2>Your Team ({{ teamStore.roster.length }}/6)</h2>
    <div v-for="member in teamStore.roster" :key="member.position">
      <img :src="member.pokemon.sprite" :alt="member.pokemon.name" />
      <span>{{ member.pokemon.name }}</span>
      <button @click="teamStore.removePokemonFromTeam(member.position)">Remove</button>
    </div>
    <button @click="startBattle" :disabled="teamStore.roster.length === 0">Start Battle</button>
  </div>
</template>
```

**Validation**: Components render, can select Pokemon/moves, add to team.

---

### Phase 5: Battle Integration (1 hour)

#### Modify battle.ts store
```typescript
// src/stores/battle.ts
import { useTeamStore } from './team'

export const useBattleStore = defineStore('battle', () => {
  // ... existing code

  function startBattleWithCustomTeam() {
    const teamStore = useTeamStore()
    if (teamStore.roster.length === 0) {
      throw new Error('Team is empty')
    }

    const customPlayer = transformTeamMemberToBattlePokemon(teamStore.roster[0])
    state.player = customPlayer
    state.npc = SAMPLE_NPC // Unchanged
    state.currentTurn = 'player'
  }

  return { /* ... */, startBattleWithCustomTeam }
})
```

#### Update TeamBuilderView
```typescript
function startBattle() {
  const battleStore = useBattleStore()
  battleStore.startBattleWithCustomTeam()
  router.push('/battle')
}
```

**Validation**: Battle starts with custom Pokemon, moves work correctly.

---

## 🧪 Testing Checklist

### Unit Tests
- ✅ `pokemonService.transformPokeAPIToPokemon()` with various inputs
- ✅ `moveService.transformPokeAPIToMove()` with status moves (power: null)
- ✅ `teamCache` localStorage save/load
- ✅ `team.ts` store actions (add/remove/reorder)

### Integration Tests
- ✅ Load Pokemon catalog → pagination works
- ✅ Select Pokemon → move selector appears
- ✅ Select 4 moves → add to team
- ✅ Team persists across page refresh
- ✅ Start battle → custom Pokemon appears

### Manual Testing
1. Navigate to `/team-builder`
2. Browse Pokemon (pagination)
3. Click Pokemon → select 4 moves
4. Add to team (repeat 6 times)
5. Try adding 7th (should show error)
6. Remove Pokemon from team
7. Refresh page (team persists)
8. Start battle → verify custom Pokemon
9. Use moves → verify damage calculations

---

## 🐛 Common Issues & Solutions

### Issue: localStorage quota exceeded
**Solution**: Add try-catch, fallback to in-memory only
```typescript
try {
  localStorage.setItem(key, value)
} catch (e) {
  console.warn('localStorage full, using memory cache')
  inMemoryCache.set(key, value)
}
```

### Issue: PokeAPI rate limiting (429)
**Solution**: Already handled in `pokeApiClient.ts` from Feature 002 (retry with backoff)

### Issue: Pokemon with no learnable moves
**Solution**: Validate moves array length, show warning
```typescript
if (pokemon.moves.length === 0) {
  console.warn(`Pokemon ${pokemon.name} has no learnable moves`)
  // Still allow adding to team, but show warning UI
}
```

### Issue: Battle system crashes with custom Pokemon
**Solution**: Ensure transformation matches exact interface
```typescript
// Battle system expects:
interface BattlePokemon {
  name: string
  level: number
  types: string[]
  stats: { hp, attack, defense, spAttack, spDefense, speed }
  moves: Move[]
  currentHp: number
  maxHp: number
}
```

---

## 📚 Key Files Reference

| Need | File | Purpose |
|------|------|---------|
| **Interfaces** | `specs/003-pokemon-team-builder/data-model.md` | All TypeScript types |
| **API Schemas** | `specs/003-pokemon-team-builder/contracts/*.json` | PokeAPI response formats |
| **Research** | `specs/003-pokemon-team-builder/research.md` | Technical decisions, best practices |
| **Existing Client** | `src/services/typeChart/pokeApiClient.ts` | Reuse for HTTP calls |
| **Existing Store** | `src/stores/battle.ts` | Integration point |

---

## 🎓 Learning Resources

- **PokeAPI Docs**: https://pokeapi.co/docs/v2
- **Pinia Docs**: https://pinia.vuejs.org/
- **Vue 3 Composition API**: https://vuejs.org/guide/extras/composition-api-faq.html
- **TypeScript Strict Mode**: https://www.typescriptlang.org/tsconfig#strict

---

## ⏱️ Time Estimates

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| 1. Setup & Models | Interfaces, types | 30 min |
| 2. Services Layer | HTTP client, transformers, cache | 2 hours |
| 3. Pinia Store | State management, actions | 1 hour |
| 4. UI Components | Catalog, selector, roster | 3 hours |
| 5. Battle Integration | Modify battle.ts, routing | 1 hour |
| 6. Testing | Unit + integration tests | 2 hours |
| 7. Polish | Error handling, loading states, styling | 1.5 hours |

**Total**: ~11 hours (1.5 working days)

---

## ✅ Definition of Done

- [ ] All TypeScript interfaces defined in `models/teamBuilder.ts`
- [ ] Services layer: Pokemon/move fetch and transform working
- [ ] Team cache: localStorage save/load functional
- [ ] Pinia store: Add/remove/reorder Pokemon actions work
- [ ] UI: Can browse Pokemon, select moves, build team
- [ ] Integration: Battle starts with custom team
- [ ] Tests: 100% coverage for services, store tests pass
- [ ] Manual: Full flow works (browse → select → build → battle)
- [ ] Bundle size: <10KB increase (monitor `npm run build`)
- [ ] Constitution: All checks pass (see plan.md)

---

## 🚦 Next Steps After Phase 1

1. Run `/speckit.tasks` to generate detailed task breakdown
2. Implement tasks in order (setup → foundational → user stories)
3. Commit after each completed task
4. Run `npm run build` and `npm run type-check` before PR
5. Merge to main when all tasks complete

**Questions?** Refer to `research.md` for technical decisions or `data-model.md` for entity details.
