# Research Notes: Battle Module Update

**Feature**: 006-battle-module-update  
**Date**: 2025-12-03  
**Status**: Complete

## Research Tasks

### 1. Dynamic Level Scaling Implementation

**Question**: How to implement `OpponentLevel - 2` formula without breaking existing battle mechanics?

**Decision**: Modify level at battle initialization, not in team store

**Rationale**:
- Team store (`src/stores/team.ts`) maintains original Pokémon levels for persistence
- Battle store (`src/stores/battle.ts`) already clones Pokémon at battle start (see `clonePokemon` function)
- Apply level scaling to cloned Pokémon in `createBattleState()` or equivalent initialization
- Minimum level clamped to 1 (per edge case in spec)

**Alternatives considered**:
- Modify team store directly → Rejected: breaks persistence and other features
- Calculate on-the-fly during damage calc → Rejected: inconsistent stats display
- Create separate "battle Pokémon" entities → Already exists via cloning pattern

**Implementation location**: `src/stores/battle.ts` in battle initialization logic

---

### 2. Status Move Exclusion

**Question**: How to filter status moves from battle UI while keeping them in data model?

**Decision**: Filter at UI layer (move selection), not at data layer

**Rationale**:
- Move category already typed: `Category = 'physical' | 'special' | 'status'` (see `src/domain/battle/engine/entities.ts:8`)
- Filter in move selector component: `moves.filter(m => m.category !== 'status')`
- Engine already handles status moves specially (lines 344-346 in battle store)
- Keep status moves in data for future feature expansion

**Alternatives considered**:
- Remove status moves from data entirely → Rejected: breaks existing moves.ts structure
- Add `usableInBattle` flag → Rejected: over-engineering for simple filter
- Filter at store level → Acceptable but UI filter is cleaner separation

**Implementation location**: `src/components/MoveSelector.vue` or equivalent move selection UI

---

### 3. Thematic NPC Structure

**Question**: Where to define Thematic NPCs (trainers before each Gym Leader)?

**Decision**: Create new `thematicNpcs.ts` data file following `gymLeaders.ts` pattern

**Rationale**:
- `gymLadders.ts` has Trainer interface but uses Kanto trainers (TRAINER_BROCK, etc.)
- Need Cali-themed NPCs aligned with 5 Gym Leader locations
- ~3-5 Thematic NPCs per gym = ~15-25 trainers total
- Each NPC has type alignment with upcoming Gym Leader

**Structure**:
```typescript
interface ThematicNpc {
  id: string
  name: string
  gymId: number  // Links to gymLeaders[].id
  team: Pokemon[]
  quote: string
  defeated: boolean  // Tracked in progress store
}
```

**Alternatives considered**:
- Add to existing `gymLadders.ts` → Rejected: file has stale Kanto data
- Embed in `gymLeaders.ts` → Rejected: different entity type
- Generate dynamically from PokeAPI → Rejected: need curated teams

**Implementation location**: New file `src/data/thematicNpcs.ts`

---

### 4. Progress Persistence Pattern

**Question**: Best pattern for Pinia + LocalStorage synchronization?

**Decision**: Use `watch` with debounced save, `onMounted` rehydration

**Rationale**:
- Existing team store uses similar pattern with `saveTeamToLocalStorage`/`loadTeamFromLocalStorage`
- Pinia 3+ supports `$subscribe` but watch is more explicit
- Debounce prevents excessive writes during rapid state changes

**Pattern**:
```typescript
// In store setup
watch(progressState, (newState) => {
  localStorage.setItem('pkmn-progress', JSON.stringify(newState))
}, { deep: true, debounce: 500 })

// On store creation
const saved = localStorage.getItem('pkmn-progress')
if (saved) progressState.value = JSON.parse(saved)
```

**Alternatives considered**:
- Pinia persist plugin → Rejected: adds dependency, existing pattern works
- Manual save on specific actions → Rejected: error-prone, easy to miss saves
- IndexedDB → Over-engineering for simple progress data

**Implementation location**: New file `src/stores/progress.ts`

---

### 5. Move Learning Trigger Mechanism

**Question**: When and how to trigger Move Learning UI?

**Decision**: Check eligibility post-victory in battle outcome handler

**Rationale**:
- Move learning tied to level thresholds (Pokémon-specific)
- Check after victory, before navigation to lobby
- Show modal if any party member eligible, process sequentially
- Use shadcn Dialog for consistency (Constitution Principle VIII)

**Flow**:
1. Victory confirmed → Check all party Pokémon for new moves
2. If eligible moves exist → Show MoveLearningModal
3. For each eligible Pokémon → Process move decision (learn/skip)
4. After all decisions → Navigate to lobby

**Data needed**: Move learn thresholds per Pokémon (can derive from PokeAPI or static data)

**Alternatives considered**:
- Check during battle → Rejected: interrupts flow, irrelevant if player loses
- Check on lobby load → Rejected: disconnected from battle context

**Implementation location**: 
- Logic: `src/services/battle/moveLearnService.ts`
- UI: `src/components/battle/MoveLearningModal.vue`

---

### 6. Wild Pokémon Pool Definition

**Question**: Which Pokémon should appear in wild encounters?

**Decision**: Gen 1 common Pokémon (IDs 1-151), weighted by type diversity

**Rationale**:
- Spec assumption ASM-007: Gen 1 for consistency
- Exclude legendaries (Articuno, Zapdos, Moltres, Mewtwo, Mew)
- Weight toward common species: Rattata, Pidgey, Caterpie, etc.
- Level scales to team average - 2 (minimum 3)

**Pool composition** (~30-40 species):
- Normal: Rattata, Pidgey, Meowth, Eevee
- Grass: Bulbasaur, Oddish, Bellsprout
- Water: Squirtle, Psyduck, Poliwag, Magikarp
- Fire: Charmander, Vulpix, Growlithe
- Electric: Pikachu, Magnemite
- Bug: Caterpie, Weedle, Venonat
- Others: Geodude, Machop, Abra, Gastly

**Alternatives considered**:
- All Gen 1 → Too many, includes starters/legendaries
- Gym-aligned typing → Over-constrains, wild should be varied
- Random from PokeAPI → Unpredictable, could return non-Gen1

**Implementation location**: `src/data/wildPokemonPool.ts`

---

### 7. Shadcn Dialog Best Practices

**Question**: How to implement Defeat Modal and Move Learning with shadcn-vue?

**Decision**: Use Dialog component with controlled open state

**Rationale**:
- shadcn-vue Dialog provides accessible modal with proper focus trap
- Already installed per Constitution (components.json configured)
- Use `v-model:open` for Vue 3 binding

**Pattern**:
```vue
<Dialog v-model:open="isOpen">
  <DialogContent>
    <DialogHeader>
      <DialogTitle>{{ title }}</DialogTitle>
      <DialogDescription>{{ description }}</DialogDescription>
    </DialogHeader>
    <!-- Content -->
    <DialogFooter>
      <Button @click="handleAction">{{ actionLabel }}</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Components needed**:
- Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
- Button for actions
- Select for move replacement choice

**Implementation location**: `src/components/battle/DefeatModal.vue`, `MoveLearningModal.vue`

---

### 8. Gym Progression Order Validation

**Question**: How to enforce linear gym progression José → Manuel → Rafael → Sofía → Valeria?

**Decision**: Track `currentGym` index in progress store, validate before battle start

**Rationale**:
- Progress store maintains `currentGym: 1-5` (1-indexed to match gymLeaders)
- Gym Leader only available if all Thematic NPCs defeated for current gym
- After Gym Leader defeat → increment `currentGym`, unlock next NPCs

**State structure**:
```typescript
interface ProgressState {
  defeatedTrainers: string[]  // NPC IDs
  earnedBadges: number[]      // Gym Leader IDs
  currentGym: number          // 1-5
  timestamp: number
}
```

**Alternatives considered**:
- Use badge array length → Ambiguous, doesn't track partial progress
- Store separately per gym → Over-normalized, harder to query

**Implementation location**: `src/stores/progress.ts`

---

## Resolved Clarifications Summary

| Original Unknown | Resolution |
|-----------------|------------|
| Thematic NPC source | New `thematicNpcs.ts` file |
| Level scaling location | Battle store initialization |
| Status move handling | UI-layer filter |
| Progress persistence | Pinia watch + LocalStorage |
| Move learning trigger | Post-victory handler |
| Wild pool definition | Static Gen 1 common pool |
| Dialog implementation | shadcn-vue Dialog controlled |
| Progression enforcement | `currentGym` index in progress |

## Next Steps

- Phase 1: Create `data-model.md` with TypeScript interfaces
- Phase 1: Generate API contracts in `contracts/`
- Phase 1: Write `quickstart.md` development guide
