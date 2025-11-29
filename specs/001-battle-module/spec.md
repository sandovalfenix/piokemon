# Feature Specification: Battle Module

**Feature Branch**: `001-battle-module`  
**Created**: 2025-11-28  
**Status**: Draft  
**Input**: User description: "Define the Battle module for a modern Vue 3 Pokémon-style web app. Focus on the what and why (not the tech stack). Goals: Deliver an MVP for 1v1 battles that mirrors core Pokémon mechanics with a modern UI."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Core Turn-Based Combat (Priority: P1)

A player engages in a 1v1 Pokémon battle where they select moves each turn, see immediate feedback on effectiveness, and battle continues until one Pokémon faints.

**Why this priority**: This is the absolute foundation - without functional turn-based combat, there is no battle system. This delivers the core value proposition of Pokémon battles.

**Independent Test**: Can be fully tested by loading a battle screen with two Pokémon (player and NPC), selecting any valid move, and verifying the battle progresses through multiple turns until one Pokémon's HP reaches zero, triggering a win/lose state.

**Acceptance Scenarios**:

1. **Given** a battle has started with player Pokémon (100 HP) and NPC Pokémon (80 HP), **When** player selects "Tackle" (40 base power), **Then** damage is calculated and applied to NPC, NPC's turn executes automatically, and UI updates to show new HP values for both Pokémon
2. **Given** a battle is in progress, **When** player's move reduces NPC Pokémon HP to 0, **Then** battle ends immediately showing "You Win!" message and no further turns are processed
3. **Given** a battle is in progress, **When** NPC's move reduces player Pokémon HP to 0, **Then** battle ends immediately showing "You Lose!" message and no further turns are processed
4. **Given** both Pokémon are alive, **When** a turn completes, **Then** player is presented with move selection for the next turn

---

### User Story 2 - Type Effectiveness System (Priority: P2)

Players experience authentic Pokémon type matchups where moves deal super effective (2x), normal (1x), or not very effective (0.5x) damage based on attacker move type vs defender Pokémon type.

**Why this priority**: Type effectiveness is the strategic core of Pokémon battles. Without it, the battle system lacks depth and doesn't feel like Pokémon. This is essential for MVP but can be implemented after basic combat works.

**Independent Test**: Create a battle between a Water-type Pokémon using a Water move against a Fire-type (should be super effective) and verify damage is doubled compared to a neutral matchup.

**Acceptance Scenarios**:

1. **Given** player's Water-type Pokémon uses Water Gun against NPC's Fire-type Pokémon, **When** damage is calculated, **Then** UI displays "It's super effective!" and damage is multiplied by 2x
2. **Given** player's Fire-type Pokémon uses Ember against NPC's Water-type Pokémon, **When** damage is calculated, **Then** UI displays "It's not very effective..." and damage is multiplied by 0.5x
3. **Given** player's Normal-type Pokémon uses Tackle against NPC's any-type Pokémon, **When** damage is calculated, **Then** no effectiveness message appears and damage is standard (1x multiplier)
4. **Given** player's Electric-type move is used against Ground-type Pokémon, **When** damage is calculated, **Then** UI displays "It has no effect..." and damage is 0

---

### User Story 3 - Accurate Move Mechanics with RNG (Priority: P2)

Moves with accuracy <100% have a chance to miss based on their accuracy stat, with clear visual feedback when a move misses vs. hits.

**Why this priority**: RNG accuracy is a defining mechanic of Pokémon battles, adding tension and requiring strategic thinking. Critical for authenticity but doesn't block basic battle functionality.

**Independent Test**: Select a move with 90% accuracy (like Thunder) repeatedly (e.g., 100 times in automated tests) and verify approximately 90% hit and 10% miss, with "Attack missed!" message displayed on misses.

**Acceptance Scenarios**:

1. **Given** player selects a move with 95% accuracy, **When** RNG roll is ≤95, **Then** move executes normally with damage applied and no miss message
2. **Given** player selects a move with 95% accuracy, **When** RNG roll is >95, **Then** move fails, UI displays "[Pokémon]'s attack missed!", no damage is dealt, and turn ends
3. **Given** player selects a move with 100% accuracy (most moves), **When** move executes, **Then** move never misses regardless of RNG
4. **Given** a move misses, **When** turn ends, **Then** opponent still gets their turn (missing doesn't skip opponent action)

---

### User Story 4 - Strategic NPC Opponent (Priority: P3)

NPC opponent selects moves using basic strategy logic (e.g., prefers super effective moves, uses status moves occasionally) rather than purely random selection, creating a more engaging battle experience.

**Why this priority**: Elevates player experience from trivial to engaging. A random-only opponent feels broken and frustrating. This is important for player satisfaction but battles are functional without it.

**Independent Test**: Set up multiple battles where NPC has both super effective and neutral moves available, observe that NPC selects the super effective move significantly more often (>70% of the time).

**Acceptance Scenarios**:

1. **Given** NPC has a super effective move and neutral move available, **When** NPC's turn begins, **Then** NPC selects the super effective move at least 70% of the time
2. **Given** NPC has only neutral effectiveness moves, **When** NPC's turn begins, **Then** NPC selects from available moves using weighted randomness (higher power moves preferred)
3. **Given** NPC's Pokémon is at low HP (<30%) and has a healing move, **When** NPC's turn begins, **Then** NPC has increased probability (40%+) of using the healing move
4. **Given** NPC has no advantageous options, **When** NPC's turn begins, **Then** NPC selects a random valid move to avoid predictability

---

### User Story 5 - Visual Battle State Clarity (Priority: P3)

Players can clearly see current HP, Pokémon names, types, and available moves at all times, with immediate visual feedback for damage numbers, effectiveness messages, and status changes.

**Why this priority**: Good UX is essential for player engagement but can be improved iteratively. A minimal functional UI unblocks testing of game mechanics while polish can be added later.

**Independent Test**: Start a battle and verify all information is visible: both Pokémon names, types, current/max HP displayed as numbers and bars, four move buttons with names clearly labeled.

**Acceptance Scenarios**:

1. **Given** a battle screen is loaded, **When** player views the interface, **Then** both Pokémon sprites/names are visible, HP bars show current/max HP with percentages, and player's four moves are displayed as clickable buttons
2. **Given** damage is dealt to a Pokémon, **When** turn resolves, **Then** HP bar animates smoothly to new value, damage number appears above Pokémon briefly (-45 HP), and current HP text updates
3. **Given** a type effectiveness modifier applies, **When** attack lands, **Then** message appears in battle log area ("It's super effective!" or "It's not very effective...") and remains visible for 2 seconds
4. **Given** a move misses, **When** turn resolves, **Then** message "[Pokémon name]'s attack missed!" appears prominently and no damage animation plays

---

### Edge Cases

- What happens when both Pokémon faint simultaneously (e.g., from recoil damage)? → Rare edge case: treat as player loss to simplify initial logic
- How does system handle rapid clicking on move buttons during turn resolution? → Disable move buttons during turn animation/processing to prevent double-submission
- What if NPC's strategy logic takes too long to compute? → Implement timeout (500ms max) and fallback to random move selection
- How are tie scenarios in speed stats resolved (who goes first)? → Use true random 50/50 coin flip for speed ties
- What if a Pokémon has fewer than 4 moves? → Display only available moves, disable/hide empty move slots
- How does the system handle zero damage after all calculations? → Display "But it failed!" message, treat as valid turn

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support turn-based 1v1 battles where player selects a move, system resolves both player and NPC actions in sequence, and battle continues until one Pokémon reaches 0 HP
- **FR-002**: System MUST calculate damage using core Pokémon formula: `Damage = ((2 * Level / 5 + 2) * Power * Attack/Defense / 50 + 2) * TypeEffectiveness * RandomFactor(0.85-1.0)`
- **FR-003**: System MUST implement type effectiveness multipliers (2x super effective, 1x neutral, 0.5x not very effective, 0x immune) for all 18 Pokémon types
- **FR-004**: System MUST validate move accuracy before damage calculation using RNG, with moves missing if random roll (1-100) exceeds accuracy percentage
- **FR-005**: System MUST prevent player from selecting moves or performing actions during NPC turn or animation phases
- **FR-006**: System MUST display current and maximum HP for both player and NPC Pokémon at all times during battle
- **FR-007**: System MUST provide immediate visual feedback for: damage dealt, type effectiveness messages, move misses, and battle end conditions (win/lose)
- **FR-008**: System MUST implement deterministic RNG using seeded random number generator for reproducible battle outcomes in testing
- **FR-009**: NPC opponent MUST select moves using strategy logic (prefer super effective moves, consider HP thresholds) rather than pure random selection
- **FR-010**: System MUST end battle immediately when any Pokémon's HP reaches 0, displaying win/lose state with no further turn processing
- **FR-011**: System MUST support all standard Pokémon stats: HP, Attack, Defense, Special Attack, Special Defense, Speed (for future use)
- **FR-012**: System MUST maintain battle state as self-contained module data that can be serialized/restored without external dependencies
- **FR-013**: System MUST handle all 18 Pokémon types: Normal, Fire, Water, Electric, Grass, Ice, Fighting, Poison, Ground, Flying, Psychic, Bug, Rock, Ghost, Dragon, Dark, Steel, Fairy
- **FR-014**: Each move MUST have defined properties: name, type, power, accuracy, physical/special category
- **FR-015**: System MUST apply damage calculation correctly for both physical (uses Attack/Defense) and special (uses Sp.Atk/Sp.Def) moves

### Key Entities

- **Pokémon**: Represents a single battle participant with attributes: name, type(s), level, stats (HP, Attack, Defense, Sp.Atk, Sp.Def, Speed), current HP, and moveset (up to 4 moves)
- **Move**: Represents a battle action with attributes: name, type, base power, accuracy percentage, physical/special category, and optional effects
- **BattleState**: Contains complete battle context: player Pokémon, NPC Pokémon, current turn number, battle phase (move selection, resolving, ended), winner (null/player/npc), and battle log history
- **TurnResult**: Captures outcome of a single turn: attacker, defender, move used, damage dealt, effectiveness multiplier, hit/miss status, and resulting HP values
- **TypeChart**: Lookup table mapping attacker type + defender type → effectiveness multiplier (0, 0.5, 1, or 2)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Player can complete a full 1v1 battle from start to win/lose condition in under 90 seconds for an average battle (6-10 turns)
- **SC-002**: Type effectiveness calculations produce correct multipliers (0x, 0.5x, 1x, 2x) for 100% of type matchup combinations when tested against official Pokémon type chart
- **SC-003**: RNG accuracy mechanics miss at the expected rate (±5% tolerance) over 1000+ move attempts (e.g., 90% accuracy move misses 8-12% of the time)
- **SC-004**: NPC opponent selects super effective moves at least 70% of the time when available, demonstrating strategic behavior rather than random selection
- **SC-005**: All battle state transitions (move selection → turn resolution → next turn) complete within 100ms excluding intentional animation delays
- **SC-006**: Battle module operates independently without requiring external game state, team management, or server integration - can be tested in isolation
- **SC-007**: Zero crashes or errors during 100 consecutive battles with varied Pokémon/move combinations
- **SC-008**: UI displays HP updates, effectiveness messages, and win/lose states with <16ms frame-time impact (maintains 60fps)
- **SC-009**: Damage calculation produces deterministic results - same battle scenario (same Pokémon, moves, RNG seed) produces identical outcome across repeated runs
- **SC-010**: Players can immediately understand battle state from UI - 90%+ of test users correctly identify current HP, whose turn it is, and available actions within 3 seconds of viewing battle screen

## Assumptions

- **ASM-001**: Pokémon data (stats, types, moves) will be loaded from static configuration files or JSON rather than fetched from external API
- **ASM-002**: All battles are 1v1; double battles, triple battles, and rotation battles are explicitly out of scope for this module
- **ASM-003**: Status conditions (burn, paralysis, sleep, etc.) and stat changes (buffs/debuffs) are deferred to future iterations beyond MVP
- **ASM-004**: Abilities and held items are not included in MVP - all Pokémon battle using base stats and moves only
- **ASM-005**: Move animations are simple and fast (<1 second per move) - elaborate animations deferred to polish phase
- **ASM-006**: Battle UI is designed for desktop/tablet screen sizes first; mobile optimization is a future enhancement
- **ASM-007**: NPC difficulty level is fixed at "moderate strategy" - difficulty scaling is out of scope for MVP
- **ASM-008**: Pokémon levels are predefined when battle starts - no level scaling or dynamic adjustments during battle
- **ASM-009**: Critical hits, which add additional RNG, are deferred to post-MVP to simplify initial damage calculations
- **ASM-010**: Battle does not require network communication - all logic runs client-side with local state management

## Dependencies

- **DEP-001**: Pokémon data structure definition (name, types, base stats, learnable moves) - can be mocked with sample data for development
- **DEP-002**: Move database with all required properties (name, type, power, accuracy, category) - initial implementation can use subset of ~20 common moves
- **DEP-003**: Type effectiveness chart mapping - can be implemented as static lookup table from official Pokémon type relationships

## Out of Scope (Explicitly Excluded)

- Double battles, triple battles, or any multi-Pokémon formats
- Advanced AI with predictive logic or player behavior learning
- Complex status conditions beyond HP (poison, paralysis, confusion, sleep, etc.)
- Stat stage changes (Attack +1, Defense -2, etc.)
- Weather effects (rain, sandstorm, sunny day)
- Terrain effects (electric terrain, grassy terrain)
- Abilities (special Pokémon traits that modify battle rules)
- Held items (berries, choice items, etc.)
- Pokémon switching mid-battle
- Running/fleeing from battle
- Critical hit mechanics (added complexity for RNG)
- Move priority system (all moves treated as same priority)
- Multi-turn moves (charging moves like Solar Beam)
- Recoil damage, healing moves, or HP-draining attacks
- Experience points, leveling up, or stat increases from battle
- Battle replay/recording functionality
- Online multiplayer synchronization
- Move PP (power points) tracking - moves can be used unlimited times
- Pokémon gender differences affecting battle
- Friendship or affection mechanics

## Constraints

- **CON-001**: Battle module must remain framework-agnostic in its core logic layer - UI binding is Vue-specific but game logic should be pure TypeScript
- **CON-002**: Battle state must be fully serializable to JSON for future features (save/load, battle replay)
- **CON-003**: All calculations must use integer math where possible to avoid floating-point precision errors in damage calculation
- **CON-004**: Maximum turn limit of 100 turns to prevent infinite battle loops (extremely rare but possible with defensive strategies)
- **CON-005**: Move execution must complete within 2 seconds total (including animations) to maintain battle pacing
- **CON-006**: Type effectiveness chart must match official Pokémon type relationships exactly - no custom type matchups
- **CON-007**: RNG seed must be exposed for testing purposes to enable deterministic test scenarios