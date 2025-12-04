# Feature Specification: Wild Encounter & Capture Module

**Feature Branch**: `007-wild-encounter-capture`  
**Created**: 2025-01-20  
**Status**: Draft  
**Input**: User description: "Wild Encounter and Capture module with Encounter Whitelist, PokéAPI integration, useCapture composable, and PC Box persistence"

## Executive Summary

Enhance the wild encounter and capture experience with **minimal modifications** to existing collaborative components:
1. Expand the Pokémon pool from 6 hardcoded to ~50 via an **Encounter Whitelist** (not a Safari Zone - just the available wild Pokémon)
2. Integrate PokéAPI for real Pokémon data while preserving existing `Buscar.vue` search animation
3. Consolidate scattered logic into a `useCapture` composable while **keeping existing component presence**
4. Add PC Box storage for captured Pokémon when team is full

### Key Design Principle
**Minimal refactoring**: Existing components (`Buscar.vue`, `Capturar.vue`, `inventarioball.vue`, `FinalCaptura.vue`) are **collaborative work** and must maintain their visual presence and core UX. Changes should enhance, not replace.

---

## Clarifications

### Session 2025-01-20

- Q: Is this a separate "Safari Zone" area or just an expanded Pokémon pool for existing encounters? → A: **Expanded pool for existing wild encounters** (not a Safari Zone)
- Q: Should existing capture components be heavily refactored or preserved? → A: **Preserved with minimal changes** - they are collaborative work and must maintain their visual presence
- Q: What is the flow after finding a wild Pokémon? → A: **Buscar → Capturar → Battle → Weaken → Capture** - Player must battle and weaken the Pokémon before throwing Pokéballs (like original games)
- Q: How should wild Pokémon battles work? → A: **Reuse existing BattleView + add "Capture" button** alongside Attack/Items during wild battles
- Q: When should the "Capture" button be available? → A: **Always available** - the Gen 3 formula already penalizes high HP captures, so players can try anytime but success rate improves as HP decreases
- Q: What role does `Capturar.vue` play in the new flow? → A: **Preview screen** - shows the wild Pokémon found with a "¡Batalla!" button that navigates to BattleView (preserves collaborative component)
- Q: Where should the Pokéball throw and capture animation be shown? → A: **Modal/overlay over BattleView** - shows Pokéball shaking animation
- Q: Do we need a new Pokéball PNG for animation? → A: **No** - reuse existing PokémonDB sprites (`https://img.pokemondb.net/sprites/items/{ball-type}.png`) already used in `inventarioball.vue`. CSS animations handle shake effect.

---

## Code Audit Summary

### Existing Components (Collaborative - Preserve Presence)

| Component | Purpose | Action |
|-----------|---------|--------|
| `Buscar.vue` | **Search/encounter animation** | KEEP - Main encounter trigger, preserve sprite animation and search UX |
| `Capturar.vue` | Wild Pokemon display | KEEP - Preserve HP bar display, sprite loading, overall structure |
| `inventarioball.vue` | Ball selection UI | KEEP - Preserve carousel, selection logic |
| `FinalCaptura.vue` | Result modal | KEEP - Preserve success/failure animations |
| `useEncounterStore.ts` | Encounter state | ENHANCE - Add PokéAPI fetch, keep `capturedPokemons` |
| `pokemonGenerator.ts` | Generate random Pokemon | ENHANCE - Expand `POKEMON_DATA` to Encounter Whitelist (~50 IDs) |
| `captureEngine.ts` | Capture formula | **PRESERVE INTACT** - Gen 3 formula, ball modifiers |

### Logic to Preserve (Critical)

```typescript
// captureEngine.ts - Gen 3 capture formula (KEEP AS-IS)
const BALL_MODIFIERS: Record<string, number> = {
  pokeball: 1,
  superball: 1.5, 
  ultraball: 2,
  masterball: 255
};

// HP-based catch chance formula
catchChance = ((3 * maxHP - 2 * currentHP) * baseCatchRate * ballModifier) / (3 * maxHP)
```

### Minimal Changes Required

1. **pokemonGenerator.ts**: Expand `POKEMON_DATA` from 6 to ~50 Pokémon IDs (Encounter Whitelist)
2. **useEncounterStore.ts**: Add PokéAPI fetch to hydrate Pokémon data for selected ID
3. **Capturar.vue**: Add "¡Batalla!" and "Huir" buttons, use real types from PokéAPI
4. **BattleView.vue**: Add "Capturar" button in action menu (only for wild battles)
5. **New**: `CaptureOverlay.vue` - Modal with ball selection + shake animation (uses `inventarioball.vue`)
6. **New**: `pcBoxStore` for overflow storage when team is full
7. **battle.ts store**: Add `isWildBattle` flag to distinguish wild vs trainer battles

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Wild Encounter via Buscar Animation (Priority: P1) 🎯 MVP

As a player, I want to click "Explorar" and experience the existing `Buscar.vue` search animation, then see a preview of the wild Pokémon in `Capturar.vue` before entering battle.

**Why this priority**: Core encounter experience using the **existing collaborative animation** - preserves team contribution while expanding variety.

**Independent Test**: Click "Explorar" → see `Buscar.vue` search animation → `Capturar.vue` shows Pokémon preview with "¡Batalla!" button → click to enter BattleView.

**Acceptance Scenarios**:

1. **Given** player is on HomeView, **When** player clicks "Explorar" button, **Then** `Buscar.vue` component displays with its existing search animation
2. **Given** search animation completes, **When** Pokémon is found, **Then** system picks random ID from Encounter Whitelist (~50 Pokémon) and fetches data from PokéAPI
3. **Given** PokéAPI fetch completes, **When** data loads, **Then** `Capturar.vue` displays Pokémon preview with real types (from API), sprite, scaled level, and "¡Batalla!" button
4. **Given** wild Pokémon preview is displayed, **When** player clicks "Huir", **Then** player returns to HomeView
5. **Given** wild Pokémon preview is displayed, **When** player clicks "¡Batalla!", **Then** player navigates to BattleView for wild battle

---

### User Story 2 - Battle Wild Pokémon with Capture Option (Priority: P1)

As a player, I want to battle wild Pokémon using the existing BattleView, with an added "Capturar" button that lets me attempt capture at any time during battle.

**Why this priority**: Core battle-capture mechanic - **reuses existing BattleView** with minimal addition of capture button.

**Independent Test**: Enter wild battle → see "Capturar" button alongside Attack → click Capturar → select ball from `inventarioball.vue` → see shake animation overlay → success or retry.

**Acceptance Scenarios**:

1. **Given** player enters wild battle, **When** BattleView loads, **Then** player sees existing battle UI plus new "Capturar" button in action menu
2. **Given** player clicks "Capturar" button, **When** button is clicked, **Then** `inventarioball.vue` opens as overlay for ball selection (infinite Pokéballs for MVP)
3. **Given** player selects and throws a Pokéball, **When** ball is thrown, **Then** modal overlay shows Pokéball shake animation (CSS animation, uses PokémonDB sprite)
4. **Given** capture calculation succeeds, **When** Pokéball stops shaking, **Then** battle ends and `FinalCaptura.vue` shows "¡Capturado!" message
5. **Given** capture calculation fails, **When** Pokéball stops shaking, **Then** overlay closes, battle continues, Pokémon "broke free" message shown
6. **Given** player defeats (faints) the wild Pokémon, **When** HP reaches 0, **Then** battle ends normally, capture opportunity lost

---

### User Story 3 - Save Captured Pokémon to Team or PC Box (Priority: P1)

As a player, I want my captured Pokémon to be saved properly - to my active team if there's room (< 6), or to a PC Box if my team is full.

**Why this priority**: Persistence completes the capture loop - without saving, captures are meaningless.

**Independent Test**: Capture Pokémon with team size 5 → Pokémon added to team. Capture with team size 6 → Pokémon added to PC Box. Both persist after refresh.

**Acceptance Scenarios**:

1. **Given** player captures a Pokémon AND team size < 6, **When** capture succeeds, **Then** Pokémon is added to team roster in `teamStore`
2. **Given** player captures a Pokémon AND team size = 6, **When** capture succeeds, **Then** Pokémon is added to new `pcBoxStore` state
3. **Given** Pokémon is saved (team or PC), **When** player refreshes browser, **Then** captured Pokémon persists via LocalStorage
4. **Given** capture succeeds, **When** save completes, **Then** player sees success message indicating where Pokémon was saved ("Added to team!" or "Sent to PC Box!")

---

### User Story 4 - useCapture Composable (Minimal Refactor) (Priority: P2)

As a developer, I want capture logic consolidated in a `useCapture` composable while **existing components retain their visual presence and core structure**.

**Why this priority**: Technical organization - centralizes logic without disrupting collaborative component ownership.

**Independent Test**: Composable provides state/methods; components remain visually identical but delegate logic.

**Acceptance Scenarios**:

1. **Given** useCapture composable is implemented, **When** imported, **Then** it exposes: `startEncounter()`, `throwBall()`, `flee()`, `captureState`
2. **Given** `Buscar.vue` uses useCapture, **When** encounter starts, **Then** component **retains its existing animation** but delegates state to composable
3. **Given** `inventarioball.vue` is used, **When** ball is selected, **Then** component **retains its carousel UI** but selection triggers composable method
4. **Given** `FinalCaptura.vue` is used, **When** result is shown, **Then** component **retains its animations** but reads result from composable state

---

### Edge Cases

- **PokéAPI unavailable**: Show error toast, allow retry, don't crash
- **Encounter Whitelist fallback**: If random selection fails, fallback to Pikachu (ID 25)
- **LocalStorage full**: Warn user, don't lose capture - retry save
- **PC Box limit**: For MVP, PC Box is unlimited. Future: implement box limit (30 per box)
- **Duplicate Pokémon**: Allow duplicates (can catch multiple Pikachu)
- **Pokémon at 0 HP**: Capture formula already handles this (higher catch rate)

---

## Requirements *(mandatory)*

### Functional Requirements

#### Encounter Whitelist & PokéAPI Integration

- **FR-001**: System MUST expand `POKEMON_DATA` in `pokemonGenerator.ts` to contain ~50 balanced base-stage Pokémon IDs (Encounter Whitelist)
- **FR-002**: System MUST pick a random ID from the Encounter Whitelist when player initiates exploration
- **FR-003**: System MUST fetch Pokémon data from PokéAPI (`/api/v2/pokemon/{id}`) for the selected ID
- **FR-004**: System MUST extract and display: name, types (from API, not name-deduced), official-artwork sprite, base stats
- **FR-005**: System MUST scale wild Pokémon level based on player progression (gym badges earned * 5 + 5)

#### Existing Component Integration (Minimal Changes)

- **FR-006**: `Buscar.vue` MUST retain its search/encounter animation as the primary encounter trigger
- **FR-007**: `Capturar.vue` MUST display wild Pokémon preview with "¡Batalla!" and "Huir" buttons (replacing direct battle navigation)
- **FR-008**: `inventarioball.vue` MUST retain its carousel UI for ball selection (opens as overlay during battle)
- **FR-009**: `FinalCaptura.vue` MUST retain its success/failure result animations

#### Wild Battle Integration

- **FR-010**: BattleView MUST display a "Capturar" button in the action menu during wild battles (not trainer battles)
- **FR-011**: "Capturar" button MUST open `inventarioball.vue` as overlay for ball selection
- **FR-012**: System MUST provide infinite Pokéballs (stubbed inventory) for MVP
- **FR-013**: System MUST use existing `captureEngine.ts` Gen 3 formula for capture calculations (NO MODIFICATIONS)
- **FR-014**: System MUST display ball shake animation as modal overlay using PokémonDB sprites + CSS animation
- **FR-015**: Capture success MUST end battle immediately and show `FinalCaptura.vue`
- **FR-016**: Capture failure MUST close overlay and continue battle (wild Pokémon gets a turn)
- **FR-017**: If wild Pokémon faints, capture opportunity is lost and battle ends normally

#### Persistence

- **FR-018**: System MUST save captured Pokémon to `teamStore` if team size < 6
- **FR-019**: System MUST save captured Pokémon to new `pcBoxStore` if team size = 6
- **FR-020**: System MUST persist both team and PC Box to LocalStorage
- **FR-021**: System MUST display message indicating save location ("Added to team!" / "Sent to PC Box!")

#### Refactoring (Minimal Impact)

- **FR-022**: System MUST create `useCapture` composable to centralize capture state management
- **FR-023**: Composable MUST expose: `attemptCapture(ballType, wildPokemon)`, `captureState`
- **FR-024**: Existing components MUST **retain their visual appearance and animations** while delegating logic to composable
- **FR-025**: `captureEngine.ts` formulas MUST be preserved **without any modification**

### Key Entities

- **EncounterWhitelist**: Static array of ~50 Pokémon IDs in `pokemonGenerator.ts` (expanded from current 6)
- **WildBattle**: Flag/mode in battle state indicating this is a wild encounter (enables capture button)
- **CapturedPokemon**: Full Pokémon object from PokéAPI + capture metadata (level, captureDate)
- **PCBox**: Array of CapturedPokemon stored separately from active team

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Player can complete full explore → capture flow in under 60 seconds using existing components
- **SC-002**: 100% of captures use the existing Gen 3 formula (no changes to `captureEngine.ts`)
- **SC-003**: Captured Pokémon persist across browser refresh (LocalStorage)
- **SC-004**: Team overflow correctly routes to PC Box (no lost Pokémon)
- **SC-005**: PokéAPI fetch completes in under 2 seconds (with caching)
- **SC-006**: All existing capture components (`Buscar`, `Capturar`, `inventarioball`, `FinalCaptura`) retain their visual appearance
- **SC-007**: Encounter Whitelist contains exactly 50 balanced Pokémon IDs

---

## Assumptions

- **ASM-001**: PokéAPI is available and reliable (has 99.9% uptime historically)
- **ASM-002**: Player has completed starter selection (has at least 1 team member)
- **ASM-003**: Infinite Pokéballs is acceptable for MVP (inventory system is future scope)
- **ASM-004**: PC Box has no size limit for MVP
- **ASM-005**: Wild Pokémon HP starts at max (no damage before capture)

---

## Out of Scope

- Ball inventory management (buying balls, different ball types with counts)
- Weakening Pokémon before capture (battling wild Pokémon)
- Shiny Pokémon encounters
- PC Box organization (multiple boxes, sorting)
- Evolution during capture
- Pokédex registration
- **Major visual redesign of existing capture components** (minimal changes only)

---

## Encounter Whitelist (Proposed ~50 Pokémon)

*Balanced mix of types, all base-stage, varying catch rates - replaces current 6 hardcoded Pokémon in `pokemonGenerator.ts`*

| ID | Name | Type | Catch Rate |
|----|------|------|------------|
| 1 | Bulbasaur | Grass/Poison | 45 |
| 4 | Charmander | Fire | 45 |
| 7 | Squirtle | Water | 45 |
| 10 | Caterpie | Bug | 255 |
| 13 | Weedle | Bug/Poison | 255 |
| 16 | Pidgey | Normal/Flying | 255 |
| 19 | Rattata | Normal | 255 |
| 21 | Spearow | Normal/Flying | 255 |
| 23 | Ekans | Poison | 255 |
| 25 | Pikachu | Electric | 190 |
| 27 | Sandshrew | Ground | 255 |
| 29 | Nidoran♀ | Poison | 235 |
| 32 | Nidoran♂ | Poison | 235 |
| 35 | Clefairy | Fairy | 150 |
| 37 | Vulpix | Fire | 190 |
| 39 | Jigglypuff | Normal/Fairy | 170 |
| 41 | Zubat | Poison/Flying | 255 |
| 43 | Oddish | Grass/Poison | 255 |
| 46 | Paras | Bug/Grass | 190 |
| 48 | Venonat | Bug/Poison | 190 |
| 50 | Diglett | Ground | 255 |
| 52 | Meowth | Normal | 255 |
| 54 | Psyduck | Water | 190 |
| 56 | Mankey | Fighting | 190 |
| 58 | Growlithe | Fire | 190 |
| 60 | Poliwag | Water | 255 |
| 63 | Abra | Psychic | 200 |
| 66 | Machop | Fighting | 180 |
| 69 | Bellsprout | Grass/Poison | 255 |
| 72 | Tentacool | Water/Poison | 190 |
| 74 | Geodude | Rock/Ground | 255 |
| 77 | Ponyta | Fire | 190 |
| 79 | Slowpoke | Water/Psychic | 190 |
| 81 | Magnemite | Electric/Steel | 190 |
| 84 | Doduo | Normal/Flying | 190 |
| 86 | Seel | Water | 190 |
| 88 | Grimer | Poison | 190 |
| 90 | Shellder | Water | 190 |
| 92 | Gastly | Ghost/Poison | 190 |
| 96 | Drowzee | Psychic | 190 |
| 98 | Krabby | Water | 225 |
| 100 | Voltorb | Electric | 190 |
| 102 | Exeggcute | Grass/Psychic | 90 |
| 104 | Cubone | Ground | 190 |
| 109 | Koffing | Poison | 190 |
| 111 | Rhyhorn | Ground/Rock | 120 |
| 116 | Horsea | Water | 225 |
| 118 | Goldeen | Water | 225 |
| 120 | Staryu | Water | 225 |
| 129 | Magikarp | Water | 255 |

**Total: 50 Pokémon** (balanced type distribution, varied catch rates from 45-255)
