# Clarification: Lobby UI & Battle Flow Refactor

**Date**: 2025-12-03  
**Status**: ✅ RESOLVED  
**Requester**: User  
**Related Spec**: `006-battle-module-update/spec.md`

---

## Summary

This clarification addresses 5 strict corrections to the current Battle Module implementation:

1. **Lobby UI Simplification**: Remove opponent previews, show only buttons ✅
2. **Flow Guard with Starter Check**: Redirect logic based on LocalStorage starter ✅
3. **Data Source Migration**: Replace SAMPLE_NPC with ThematicNPCs/GymLeaders ✅
4. **PokéAPI Integration**: Fetch real stats/moves instead of dummy data ✅
5. **Battle Outcomes**: Redirect to Lobby on both Win and Loss ✅

---

## 1. Lobby UI Simplification

### Current Implementation
`HomeView.vue` shows:
- Badge display with progress
- Current gym info (leader name, location, type)
- NPC challenge cards with quotes
- Gym Leader challenge cards with quotes
- Wild Battle section

### Required Changes
Simplify to show **ONLY**:
- **"Battle" button** - Starts story progression (NPC → Gym Leader)
- **"Wild Encounter" button** - Starts random wild battle

### Questions for Clarification

> **Q1**: Should we keep the badge/progress display at the top, or remove ALL UI except the two buttons?

> **Q2**: The "Battle" button behavior - should it automatically pick the next available opponent (first undefeated NPC, or Gym Leader if all NPCs beaten)?

> **Q3**: Should there be any visual feedback about what opponent the "Battle" button will initiate (e.g., tooltip: "Challenge Carlos" or completely hidden)?

---

## 2. Flow Guard with Starter Check

### Required Logic
```
On "Battle" or "Wild Encounter" click:
  IF no starter in LocalStorage:
    → Redirect to '/starter-selection'
  ELSE:
    → Start battle

On direct URL access to '/starter-selection':
  IF starter already exists:
    → Show alert: "Ya tienes un starter"
    → Redirect to '/'
```

### Questions for Clarification

> **Q4**: What LocalStorage key should we check for starter existence? Options:
> - `teamStore.roster.length > 0` (any Pokémon in team)
> - A specific `starter-selected` flag
> - Check if `roster[0]` is one of the Gen 1 starters

> **Q5**: The alert message when blocking `/starter-selection` - should it be:
> - Native browser `alert()`
> - A styled modal/toast
> - Silent redirect with no notification

---

## 3. Data Source Migration (Delete SAMPLE_NPC)

### Current SAMPLE_NPC Usage (11 references)
```
src/components/BattleScreen.vue:52    - import
src/components/BattleScreen.vue:401   - fallback usage
src/stores/battle.ts:12               - import
src/stores/battle.ts:121              - initial state npc
src/stores/battle.ts:123              - initial state npcTeam
src/stores/battle.ts:249              - startBattleWithCustomTeam fallback
```

### Required Migration
- **Story battles**: Use `ThematicNPCs` (random NPC for first battle) or `GymLeaders`
- **Initial state**: Use placeholder Pokemon (not a real opponent)
- **startBattleWithCustomTeam**: Should not have NPC fallback - always require explicit opponent

### Questions for Clarification

> **Q6**: "Pick random for first battle" - does this mean:
> - Random NPC from Gym 1's pool (Excursionista Carlos, Montañista María, Guardián del Cerro)?
> - The first NPC in order (always Carlos)?
> - Truly random from ALL ThematicNPCs (breaks progression)?

> **Q7**: The file `src/data/pokemon.ts` that exports `SAMPLE_NPC` - should we:
> - Delete the entire file?
> - Keep file but remove SAMPLE_NPC export?
> - The file doesn't exist anymore - confirm deletion already happened?

---

## 4. PokéAPI Integration

### Current State
- `ThematicNPCs` has hardcoded stats and moves
- `GymLeaders` has `pokemonId` but stats are calculated via `getBaseStatsForPokemon()` (hardcoded map)
- `battleInitService.ts` uses dummy `getMovesForPokemon()` function

### Required Changes
Replace hardcoded data with PokéAPI fetches:

```typescript
// For each Pokemon in opponent team:
const pokemonData = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`)
const speciesData = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`)

// Extract:
// - Base stats from pokemonData.stats
// - Types from pokemonData.types
// - Moves from pokemonData.moves (filter by level-up, select 4)
```

### Questions for Clarification

> **Q8**: PokéAPI rate limits and caching strategy:
> - Should we cache fetched Pokémon data in LocalStorage?
> - Should we pre-fetch all opponent data on app load?
> - What's the fallback if PokéAPI is unavailable?

> **Q9**: Move selection from PokéAPI (Pokémon can learn 50+ moves):
> - How many moves per Pokémon? (spec says 4-move limit for player)
> - Selection criteria: level-up moves only? Exclude status moves?
> - Should move power/accuracy come from PokéAPI or our existing move data?

> **Q10**: Should ThematicNPC teams also be converted to just `pokemonId` references (like GymLeaders), then hydrated from PokéAPI? This would be a significant data model change.

---

## 5. Battle Outcomes

### Required Behavior
- **Win**: Redirect to `/` (Lobby)
- **Loss**: Redirect to `/` (Lobby)

### Current Implementation
- Victory: Calls `handleVictory()`, sets `phase: 'ended'`
- Defeat: Sets `winner: 'npc'`, sets `phase: 'ended'`
- No automatic redirect implemented

### Questions for Clarification

> **Q11**: On **Win**, before redirecting:
> - Should auto-heal happen? (spec says yes)
> - Should Move Learning modal appear? (spec says yes, if eligible)
> - Should we show a victory message/animation first?

> **Q12**: On **Loss**, before redirecting:
> - Should Defeat Modal appear first? (spec says yes - Shadcn Dialog)
> - Should auto-heal happen? (spec says yes)
> - Should there be a delay before redirect?

> **Q13**: The redirect mechanism - should it be:
> - `router.push('/')` immediately after battle ends
> - `router.replace('/')` to prevent back-button to battle
> - Delayed redirect with animation/message

---

## Implementation Impact Assessment

### Files to Modify
| File | Changes |
|------|---------|
| `src/views/HomeView.vue` | Simplify to 2 buttons only |
| `src/router/index.ts` | Add route guard for `/starter-selection` |
| `src/stores/battle.ts` | Remove SAMPLE_NPC, add redirect on end |
| `src/components/BattleScreen.vue` | Remove SAMPLE_NPC fallback |
| `src/services/battle/battleInitService.ts` | Add PokéAPI fetch calls |
| `src/data/thematicNpcs.ts` | Convert to pokemonId-only (if Q10 = yes) |

### Files to Delete
| File | Reason |
|------|--------|
| `src/data/pokemon.ts` | Contains only SAMPLE_NPC (if exists) |

### New Files Needed
| File | Purpose |
|------|---------|
| `src/services/pokeapi/pokemonService.ts` | PokéAPI integration with caching |

---

## Confirmed Answers

All questions have been answered by the user:

| Question | Confirmed Answer |
|----------|-----------------|
| Q1 | **Remover TODO**. Solo texto de bienvenida simple y 2 botones ("Battle", "Wild Encounter") |
| Q2 | **Sí**, auto-seleccionar siguiente en progresión lineal, escalando nivel dinámicamente |
| Q3 | **Completamente oculto**. El jugador no sabe contra quién va hasta que carga la batalla |
| Q4 | Usar **Flag específico** en store/LocalStorage (`hasStarter`) |
| Q5 | **Modal estilizado (Shadcn)**, no alert nativo |
| Q6 | **Selección aleatoria** del pool de TrainerNpcs (Thematic NPCs) |
| Q7 | **Eliminar archivo completo**. Limpieza total de dummy data antigua |
| Q8 | **Cachear** respuestas por PokemonID en Pinia/LocalStorage. Si falla, mostrar error y reintentar (no usar data dummy) |
| Q9 | Filtrar moves por "**nivel aprendizaje <= nivel actual**" y **excluir Status**. De ese pool, elegir 4 al azar |
| Q10 | **Sí**, convertir todo a solo IDs en configs y "hidratar" consultando API al iniciar batalla |
| Q11 | Pantalla Victoria → **UI Aprender Movimiento** → **Auto-Heal** → Redirección al Lobby |
| Q12 | **Modal Derrota estilizado** → Usuario cierra → Redirección al Lobby |
| Q13 | **`router.replace('/')`** para evitar volver a la batalla con botón "Atrás" |

---

## Implementation Tasks

Based on confirmed answers, these tasks will be executed:

### Phase A: Cleanup & Data Model (ID-only)
- [ ] Delete `src/data/pokemon.ts` (SAMPLE_NPC)
- [ ] Convert `thematicNpcs.ts` to ID-only format (pokemonId, level)
- [ ] Remove all SAMPLE_NPC imports and usages

### Phase B: PokéAPI Service
- [ ] Create `src/services/pokeapi/pokemonHydrationService.ts`
- [ ] Add caching layer with Pinia store + LocalStorage
- [ ] Implement move filtering (level-up, non-status, 4 random)

### Phase C: Lobby Simplification
- [ ] Simplify `HomeView.vue` to welcome text + 2 buttons
- [ ] Add `hasStarter` flag to team store
- [ ] Create `StarterRequiredModal.vue` (Shadcn Dialog)
- [ ] Add route guard for starter check

### Phase D: Battle Outcomes
- [ ] Implement Victory flow: modal → move learning → heal → redirect
- [ ] Implement Defeat flow: modal → heal → redirect
- [ ] Use `router.replace('/')` for all redirects

---
