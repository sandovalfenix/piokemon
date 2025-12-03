# Feature Specification: Battle Module Update

**Feature Branch**: `006-battle-module-update`  
**Created**: 2025-12-03  
**Status**: Draft  
**Input**: User description: "Update Battle Module specs: 1) Combat: Full turn-based logic excluding 'Status' moves; Disable all Item usage; remove XP system (Player Pokémon level dynamically scales to Opponent Level minus 2). 2) Flow: Use LocalStorage starter, follow linear Thematic NPC -> Gym Leader progression (extract Gym Leader types/teams directly from their specific definition docs), discard defeated foes; remove currency. 3) Outcomes: On Win -> Return to Lobby ('/'), auto-full-heal team, trigger Move Learning (4-move limit w/ replace UI). On Loss -> Display high-fidelity Defeat Modal (Shadcn), return to Lobby. 4) Wild Encounters: Separate button for random combat-only battles (Capture disabled) with scaled spawns. 5) State: Persist story progress via Pinia/LocalStorage. 6) Assets: Use transparent PNGs."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Turn-Based Combat with Dynamic Level Scaling (Priority: P1)

A player enters battle using their starter Pokémon from LocalStorage. The player's Pokémon level is dynamically calculated as Opponent Level minus 2. Battles follow full turn-based mechanics with Physical and Special moves only (Status moves excluded). Items are completely disabled during combat.

**Why this priority**: This is the core battle foundation. Without functional combat with proper scaling, the entire game loop fails. Dynamic leveling ensures fair challenges without XP grinding.

**Independent Test**: Load a battle with opponent level 15, verify player Pokémon scales to level 13, select moves from available Physical/Special only, confirm no Item menu appears, and complete battle to win/lose state.

**Acceptance Scenarios**:

1. **Given** player starts a battle against an opponent with level 20, **When** battle initializes, **Then** player's Pokémon level is set to 18 (opponent level minus 2)
2. **Given** battle screen loads, **When** player views move options, **Then** only Physical and Special category moves are displayed (Status moves hidden/disabled)
3. **Given** battle is in progress, **When** player looks for Item usage option, **Then** no Item menu or button exists in the battle interface
4. **Given** player selects a Physical move, **When** turn resolves, **Then** damage is calculated using Attack vs Defense stats
5. **Given** player selects a Special move, **When** turn resolves, **Then** damage is calculated using Sp.Atk vs Sp.Def stats
6. **Given** opponent Pokémon HP reaches 0, **When** battle ends, **Then** victory state triggers without any XP gain or currency reward

---

### User Story 2 - Linear Story Progression: Thematic NPC to Gym Leader (Priority: P1)

Player follows a linear progression path where they must defeat Thematic NPCs before challenging the corresponding Gym Leader. Each Gym has themed trainers that prepare the player for the Gym Leader battle. Gym Leaders have predefined teams extracted from gymLeaders.ts with their specific types.

**Why this priority**: The progression system defines the entire game structure. Without it, players have no clear objectives or sense of achievement.

**Independent Test**: Start fresh game, verify first available challenge is Thematic NPC for Gym 1 (Rock), defeat them, confirm Gym Leader Brock becomes available with his Rock-type team (Geodude, Onix, etc.).

**Acceptance Scenarios**:

1. **Given** player has not defeated any trainers, **When** viewing available battles, **Then** only the first Thematic NPC (pre-José trainers) is available
2. **Given** player defeats all Thematic NPCs for Gym 1, **When** progression updates, **Then** Gym Leader José becomes challengeable
3. **Given** José battle loads, **When** checking opponent team, **Then** team matches gymLeaders.ts definition with Rock/Ground type Pokémon (Rocazaur as signature)
4. **Given** player defeats José, **When** progression updates, **Then** Thematic NPCs for Gym 2 (Water/Grass - Manuel) become available
5. **Given** player defeats a trainer/gym leader, **When** returning to lobby, **Then** defeated trainer is marked as complete and cannot be re-battled
6. **Given** player views progression, **When** checking Gym order, **Then** order follows: José (Roca/Tierra - Cristo Rey) → Manuel (Agua/Planta - Parque de la Caña) → Rafael (Sonido/Eléctrico - Plazoleta Jairo Varela) → Sofía (Volador/Eléctrico - La Ermita) → Valeria (Planta/Tierra - Zoológico de Cali)

---

### User Story 3 - Victory Outcome: Auto-Heal and Move Learning (Priority: P1)

Upon winning a battle, player automatically returns to the Lobby ('/'), their entire team is fully healed, and if their Pokémon is eligible to learn a new move, the Move Learning UI appears with 4-move limit and replace functionality.

**Why this priority**: Victory rewards and progression mechanics are essential for player satisfaction and game loop completion.

**Independent Test**: Win a battle, verify redirect to '/', check all team Pokémon have full HP, trigger move learning scenario and verify 4-move limit with replace UI.

**Acceptance Scenarios**:

1. **Given** player wins a battle, **When** victory is confirmed, **Then** screen transitions to Lobby route ('/')
2. **Given** player wins a battle, **When** returning to lobby, **Then** all Pokémon in player's team have currentHp equal to maxHp
3. **Given** player's Pokémon is eligible to learn a new move, **When** battle ends with victory, **Then** Move Learning modal appears before returning to lobby
4. **Given** Move Learning modal appears, **When** player views their Pokémon's moves, **Then** all 4 current moves are displayed with option to replace one
5. **Given** Pokémon already has 4 moves, **When** player wants to learn a new move, **Then** player must select which move to forget or cancel learning
6. **Given** player selects a move to replace, **When** confirming, **Then** old move is removed and new move takes its place
7. **Given** player chooses not to learn the new move, **When** canceling, **Then** Pokémon keeps current moveset and proceeds to lobby

---

### User Story 4 - Defeat Outcome: High-Fidelity Modal and Lobby Return (Priority: P2)

Upon losing a battle, a high-fidelity Defeat Modal (using Shadcn components) displays with appropriate messaging. After dismissing, player returns to Lobby. No penalties, currency loss, or other negative consequences apply.

**Why this priority**: A polished defeat experience maintains player engagement even after failure. Important for UX but not blocking core gameplay.

**Independent Test**: Intentionally lose a battle, verify Shadcn-styled modal appears with defeat message, dismiss modal, confirm redirect to '/'.

**Acceptance Scenarios**:

1. **Given** all player's Pokémon faint, **When** battle loss is detected, **Then** high-fidelity Defeat Modal appears using Shadcn Dialog component
2. **Given** Defeat Modal is displayed, **When** viewing content, **Then** modal shows: defeat message, opponent name, and "Return to Lobby" button
3. **Given** Defeat Modal is displayed, **When** player clicks "Return to Lobby", **Then** modal closes and user is redirected to '/' route
4. **Given** player loses a battle, **When** returning to lobby, **Then** player's team HP is fully restored (same as victory)
5. **Given** player loses a battle, **When** checking game state, **Then** no currency is deducted (currency system removed)
6. **Given** player loses a battle, **When** checking progression, **Then** defeated trainer remains available for re-challenge

---

### User Story 5 - Wild Encounters: Random Combat-Only Battles (Priority: P2)

Player can initiate random Wild Pokémon encounters via a dedicated "Wild Battle" button. These battles are combat-only (no capture mechanics). Wild Pokémon levels scale to player's team average minus 2. No XP or rewards, purely for practice.

**Why this priority**: Provides a low-stakes practice option and variety from story battles. Enhances replayability without affecting progression.

**Independent Test**: Click "Wild Battle" button, verify random Pokémon spawns with scaled level, confirm no Pokéball/capture option exists, win/lose and return to lobby.

**Acceptance Scenarios**:

1. **Given** player is on the Lobby screen, **When** viewing battle options, **Then** a "Wild Battle" button is visible and distinct from story progression
2. **Given** player clicks "Wild Battle", **When** battle initializes, **Then** a random wild Pokémon spawns from available pool
3. **Given** wild battle starts, **When** checking wild Pokémon level, **Then** level equals player team average level minus 2 (minimum level 3)
4. **Given** wild battle is in progress, **When** viewing battle options, **Then** no capture/Pokéball option is available
5. **Given** player wins wild battle, **When** battle ends, **Then** no move learning triggers, immediate return to lobby with full heal
6. **Given** player loses wild battle, **When** battle ends, **Then** Defeat Modal appears same as story battles

---

### User Story 6 - Persistent Story Progress via Pinia/LocalStorage (Priority: P2)

All story progression (defeated trainers, gym badges, unlocked areas) is persisted using Pinia store backed by LocalStorage. Progress survives browser refresh and session changes.

**Why this priority**: Persistence is critical for meaningful progression but can be implemented alongside or after core battle mechanics.

**Independent Test**: Defeat a trainer, refresh browser, verify defeated trainer still marked as complete, progress still accessible.

**Acceptance Scenarios**:

1. **Given** player defeats a Thematic NPC, **When** checking LocalStorage, **Then** NPC defeat is recorded in progress object
2. **Given** player defeats a Gym Leader, **When** checking progress, **Then** badge is recorded and next gym unlocked
3. **Given** player has progress saved, **When** refreshing browser, **Then** Pinia store rehydrates from LocalStorage with correct state
4. **Given** player closes browser completely, **When** returning to game later, **Then** all progress is intact
5. **Given** player views progression UI, **When** checking badges, **Then** earned badges are displayed with visual distinction
6. **Given** player wants to reset progress, **When** using reset option (if available), **Then** LocalStorage is cleared and game starts fresh

---

### Edge Cases

- What if player has no starter Pokémon in LocalStorage? → Redirect to '/team-builder' (starter selection screen) before allowing any battles
- What if wild Pokémon pool is empty? → Use fallback pool of common Gen 1 Pokémon (Rattata, Pidgey, Caterpie, etc.)
- How does level scaling work if opponent level is 2 or lower? → Set minimum player level to 1 (never negative)
- What if Pokémon has fewer than 4 moves and learns a new one? → Simply add the move without triggering replace UI
- What happens if player rapidly clicks during battle resolution? → Disable all input during turn resolution animations
- How are ties in speed stat resolved for turn order? → Random 50/50 coin flip
- What if move learning eligible move is already known? → Skip move learning prompt entirely
- What if LocalStorage is corrupted? → Clear corrupted data and redirect to starter selection

## Requirements *(mandatory)*

### Functional Requirements

#### Combat System
- **FR-001**: System MUST calculate player Pokémon level as `OpponentLevel - 2` at battle start (minimum level 1)
- **FR-002**: System MUST exclude all Status category moves from battle; only Physical and Special moves are usable
- **FR-003**: System MUST NOT display or allow Item usage during any battle
- **FR-004**: System MUST NOT award experience points (XP) after any battle
- **FR-005**: System MUST NOT award currency after any battle (currency system removed)
- **FR-006**: System MUST calculate Physical move damage using Attack vs Defense stats
- **FR-007**: System MUST calculate Special move damage using Sp.Atk vs Sp.Def stats
- **FR-008**: System MUST implement type effectiveness chart for all 18 Pokémon types

#### Progression Flow
- **FR-009**: System MUST load player's team from LocalStorage using the starter Pokémon selection
- **FR-010**: System MUST enforce linear progression: Thematic NPCs → Gym Leader for each gym
- **FR-011**: System MUST use Gym Leader data directly from `gymLeaders.ts` for team composition
- **FR-012**: System MUST mark defeated trainers/gym leaders as complete and prevent re-battles
- **FR-013**: System MUST unlock next gym's Thematic NPCs only after defeating current Gym Leader
- **FR-014**: Gym progression order MUST follow: José (Roca/Tierra) → Manuel (Agua/Planta) → Rafael (Sonido/Eléctrico) → Sofía (Volador/Eléctrico) → Valeria (Planta/Tierra)

#### Battle Outcomes
- **FR-015**: On victory, system MUST navigate to Lobby route ('/')
- **FR-016**: On victory, system MUST fully heal all Pokémon in player's team (currentHp = maxHp)
- **FR-017**: On victory with eligible move learning, system MUST display Move Learning UI
- **FR-018**: Move Learning UI MUST enforce 4-move limit with replace functionality
- **FR-019**: On defeat, system MUST display Defeat Modal using Shadcn Dialog component
- **FR-020**: Defeat Modal MUST include defeat message, opponent info, and "Return to Lobby" button
- **FR-021**: On defeat, system MUST fully heal player's team upon returning to lobby
- **FR-022**: On defeat, defeated trainer MUST remain available for re-challenge

#### Wild Encounters
- **FR-023**: System MUST provide "Wild Battle" button on Lobby screen
- **FR-024**: Wild battles MUST spawn random Pokémon from Gen 1 pool
- **FR-025**: Wild Pokémon level MUST equal `PlayerTeamAverageLevel - 2` (minimum level 3)
- **FR-026**: Wild battles MUST NOT include capture/Pokéball mechanics
- **FR-027**: Wild battles MUST NOT trigger move learning on victory

#### State Persistence
- **FR-028**: System MUST persist story progress (defeated trainers, badges) using Pinia store
- **FR-029**: Pinia progress store MUST synchronize with LocalStorage
- **FR-030**: System MUST rehydrate progress from LocalStorage on page load
- **FR-031**: System MUST handle corrupted LocalStorage by clearing and redirecting to starter selection

#### Assets
- **FR-032**: All Pokémon sprites MUST use transparent PNG format
- **FR-033**: All trainer sprites MUST use transparent PNG format
- **FR-034**: All UI elements requiring transparency MUST use PNG format

### Key Entities

- **PlayerTeam**: Collection of 1-6 Pokémon loaded from LocalStorage, with dynamically scaled levels per battle. Contains selectedMoves (max 4 per Pokémon), currentHp, maxHp.

- **Opponent**: Either a Thematic NPC, Gym Leader, or Wild Pokémon. Has fixed level that determines player scaling. NPCs/Gym Leaders have predefined teams; Wild Pokémon are single random spawns.

- **BattleState**: Current battle context including: player team, opponent data, current turn, active Pokémon indices, move history, battle phase (selection/resolution/ended), outcome (win/lose/ongoing).

- **ProgressState**: Persistent progression data: defeatedTrainers[], earnedBadges[], currentGym (1-5), unlockedGyms[], timestamp. Synchronized to LocalStorage.

- **Move**: Battle action with name, type, power, accuracy, category (Physical/Special only - Status excluded). Used for damage calculation and UI display.

- **GymLeader**: Imported from gymLeaders.ts. Contains: id, name, city, badge, type, team[]. Teams are 6 Pokémon with pokemonId and level.

- **DefeatModal**: Shadcn Dialog component state including: isOpen, opponentName, defeatMessage, onClose callback for navigation.

- **MoveLearningState**: Triggered on eligible victory. Contains: pokémonLearning, newMove, currentMoves[4], selectedReplaceIndex (nullable).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Player can complete a full battle (start to win/lose) within 90 seconds average (6-10 turns)
- **SC-002**: Player level scaling formula `OpponentLevel - 2` produces correct values for 100% of tested scenarios
- **SC-003**: 100% of Status moves are excluded from battle move selection interface
- **SC-004**: 0 Item usage options appear in any battle interface
- **SC-005**: Story progression correctly unlocks in linear order for all 5 Cali gyms with 100% accuracy
- **SC-006**: Gym Leader teams match gymLeaders.ts definitions with 100% accuracy
- **SC-007**: Full team heal occurs within 50ms of battle victory/defeat confirmation
- **SC-008**: Move Learning UI displays and functions correctly when triggered, with 4-move limit enforced
- **SC-009**: Defeat Modal renders using Shadcn components with consistent styling
- **SC-010**: Progress persists correctly through browser refresh with 100% data integrity
- **SC-011**: Wild Pokémon levels scale correctly to player team average minus 2
- **SC-012**: No capture UI appears in wild battles; purely combat-focused
- **SC-013**: All sprite assets display with transparent backgrounds (no white boxes or artifacts)
- **SC-014**: State transitions (battle end → modal → lobby) complete within 200ms excluding animations

## Assumptions

- **ASM-001**: Player has completed starter selection before accessing battle features; if not, redirect to '/team-builder'
- **ASM-002**: gymLeaders.ts contains accurate and complete Gym Leader team data for all 5 Cali gym leaders (José, Manuel, Rafael, Sofía, Valeria)
- **ASM-003**: Thematic NPCs for each gym will be defined or extracted from existing trainer data
- **ASM-004**: Shadcn UI components are already installed and configured in the project
- **ASM-005**: LocalStorage is available and not disabled in user's browser
- **ASM-006**: PokeAPI or local sprite sources provide transparent PNG sprites
- **ASM-007**: Wild Pokémon pool will use Gen 1 Pokémon (IDs 1-151) for consistency with gym progression
- **ASM-008**: Move eligibility for learning is determined by Pokémon level thresholds (to be defined in data)
