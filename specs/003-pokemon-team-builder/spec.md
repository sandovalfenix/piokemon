# Feature Specification: Pokemon Team Builder with PokeAPI Integration

**Feature Branch**: `003-pokemon-team-builder`  
**Created**: November 29, 2025  
**Status**: Draft  
**Input**: User description: "Add the PokeAPI to consult all the pokemons and moves with the necessary fields and before the battle the option I can build my pokemon team"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse Pokemon Catalog from PokeAPI (Priority: P1) 🎯 MVP

When a user opens the team builder before battle, they can browse a paginated list of all available Pokemon fetched from PokeAPI, view basic stats (HP, Attack, Defense, etc.), and see their types and sprite images. This allows users to discover Pokemon beyond the hardcoded SAMPLE_PLAYER/SAMPLE_NPC.

**Why this priority**: Core functionality that enables team customization. Without browsing Pokemon, users cannot build teams. This is the foundational requirement.

**Independent Test**: Can be fully tested by navigating to team builder screen, verifying Pokemon list loads from PokeAPI, pagination works, and Pokemon details display correctly (name, types, stats, sprite).

**Acceptance Scenarios**:

1. **Given** user is on team builder screen, **When** screen loads, **Then** system fetches first page (20 Pokemon) from PokeAPI endpoint `/pokemon?limit=20&offset=0`
2. **Given** Pokemon list is displayed, **When** user clicks "Next Page", **Then** system loads next 20 Pokemon with updated offset
3. **Given** Pokemon list is loaded, **When** user views a Pokemon card, **Then** card displays name, types, sprite image, and base stats (HP, Attack, Defense, Sp.Atk, Sp.Def, Speed)
4. **Given** PokeAPI request fails, **When** error occurs, **Then** system shows friendly error message and allows retry
5. **Given** Pokemon list is loading, **When** fetch is in progress, **Then** system displays loading skeleton/spinner

---

### User Story 2 - Select Pokemon and View Available Moves (Priority: P2)

When a user selects a Pokemon from the catalog, they can view all learnable moves for that Pokemon fetched from PokeAPI, including move details (type, power, accuracy, PP, category). Users can then assign up to 4 moves to build their team member.

**Why this priority**: Essential for team building strategy. Users need to see move options to make informed decisions about their team composition.

**Independent Test**: Can be tested by selecting any Pokemon, verifying moves list loads from PokeAPI, move details display correctly, and user can select up to 4 moves.

**Acceptance Scenarios**:

1. **Given** user clicks on a Pokemon in catalog, **When** Pokemon details screen opens, **Then** system fetches moves from PokeAPI endpoint `/pokemon/{id or name}` and displays learnable moves list
2. **Given** moves list is displayed, **When** user views a move, **Then** move shows name, type, power, accuracy, PP, and category (Physical/Special/Status)
3. **Given** user is selecting moves, **When** user clicks "Add Move" on a move card, **Then** move is added to selected moves list (max 4)
4. **Given** 4 moves are already selected, **When** user tries to add 5th move, **Then** system shows warning "Maximum 4 moves allowed" and prevents addition
5. **Given** user has selected moves, **When** user clicks "Remove Move", **Then** move is removed from selection and slot becomes available

---

### User Story 3 - Build Custom Team of 1-6 Pokemon (Priority: P2)

Users can add selected Pokemon (with their chosen moves) to a team roster, managing up to 6 team members. They can view their current team, remove Pokemon, and reorder team positions before starting a battle.

**Why this priority**: Completes the team building experience. Users need to assemble multiple Pokemon into a cohesive team before battle.

**Independent Test**: Can be tested by selecting multiple Pokemon with moves, adding them to team, verifying team roster displays correctly, and team can be modified (add/remove/reorder).

**Acceptance Scenarios**:

1. **Given** user has selected Pokemon with 1-4 moves, **When** user clicks "Add to Team", **Then** Pokemon is added to team roster (max 6 Pokemon)
2. **Given** team roster is displayed, **When** user views team, **Then** each team member shows sprite, name, types, level, and assigned moves
3. **Given** team has less than 6 Pokemon, **When** user tries to start battle, **Then** system allows battle with current team size (minimum 1 Pokemon)
4. **Given** user has 6 Pokemon in team, **When** user tries to add 7th Pokemon, **Then** system shows warning "Team is full (6/6)" and prevents addition
5. **Given** team roster is displayed, **When** user clicks "Remove" on a team member, **Then** Pokemon is removed from team and slot becomes available
6. **Given** team has multiple Pokemon, **When** user drags Pokemon card to reorder, **Then** team order updates and first Pokemon becomes battle lead

---

### User Story 4 - Start Battle with Custom Team (Priority: P1) 🎯 MVP

After building a team, users can start a battle using their first team Pokemon (lead) against the NPC. The custom Pokemon with selected moves replaces the hardcoded SAMPLE_PLAYER in the existing battle system.

**Why this priority**: Critical for MVP - connects team builder to existing battle functionality. Without this, team building has no purpose.

**Independent Test**: Can be tested by building a team, starting battle, and verifying custom Pokemon appears in battle with selected moves functional.

**Acceptance Scenarios**:

1. **Given** user has built a team with at least 1 Pokemon, **When** user clicks "Start Battle", **Then** system navigates to battle screen with team lead as player Pokemon
2. **Given** battle starts with custom Pokemon, **When** battle initializes, **Then** player Pokemon displays correct sprite, stats, types, and moves from team builder
3. **Given** battle is in progress, **When** user uses a move, **Then** move effects match PokeAPI data (type, power, accuracy) and damage calculations work correctly
4. **Given** player Pokemon faints, **When** HP reaches 0, **Then** system shows "Pokemon fainted" and battle ends (single Pokemon battles for MVP)
5. **Given** user wins battle, **When** battle ends, **Then** system returns to team builder with team intact

---

### Edge Cases

- What happens when PokeAPI is down or rate-limited during Pokemon/move fetch?
- How does system handle Pokemon with 0 learnable moves or moves with missing data fields?
- What if user builds team but localStorage is full and cannot save team roster?
- How does system behave if user refreshes page mid-team-building (data persistence)?
- What happens if PokeAPI returns Pokemon with missing sprites or stats?
- How does system handle moves with null power (status moves) in damage calculations?
- What if user tries to start battle with empty team (0 Pokemon)?
- How does system handle very long Pokemon/move names in UI layout?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST fetch Pokemon list from PokeAPI endpoint `/pokemon?limit={limit}&offset={offset}` with pagination support
- **FR-002**: System MUST display Pokemon catalog showing name, types, sprite, and base stats (hp, attack, defense, special-attack, special-defense, speed)
- **FR-003**: System MUST fetch detailed Pokemon data including moves from PokeAPI endpoint `/pokemon/{id or name}`
- **FR-004**: System MUST fetch move details from PokeAPI endpoint `/move/{id or name}` to display power, accuracy, PP, type, and damage class
- **FR-005**: System MUST allow users to select up to 4 moves per Pokemon with validation preventing 5th move selection
- **FR-006**: System MUST allow users to build a team of 1-6 Pokemon with each Pokemon having 1-4 assigned moves
- **FR-007**: System MUST persist team roster in browser localStorage to survive page refreshes
- **FR-008**: System MUST integrate custom team with existing battle system, replacing SAMPLE_PLAYER with team lead Pokemon
- **FR-009**: System MUST transform PokeAPI move data format to match existing battle system Move interface (id, name, type, power, accuracy, category, pp)
- **FR-010**: System MUST transform PokeAPI Pokemon data to match existing battle system Pokemon interface (name, level, types, stats, moves, currentHp)
- **FR-011**: System MUST handle PokeAPI errors gracefully with retry functionality and fallback to cached data if available
- **FR-012**: System MUST cache fetched Pokemon and move data in memory/localStorage to reduce API calls during session
- **FR-013**: System MUST provide team management UI allowing add/remove/reorder Pokemon before battle
- **FR-014**: System MUST validate team before battle start (minimum 1 Pokemon, all Pokemon have at least 1 move)
- **FR-015**: System MUST display loading states during PokeAPI fetch operations with skeleton UI or spinners

### Key Entities

- **Pokemon**: Represents a Pokemon from PokeAPI
  - Attributes: id, name, types (1-2 types), base stats (hp, attack, defense, sp.attack, sp.defense, speed), sprite URL, learnable moves list
  - Source: PokeAPI `/pokemon/{id}` endpoint
  
- **Move**: Represents a Pokemon move from PokeAPI
  - Attributes: id, name, type, power (may be null for status moves), accuracy, PP, damage class (physical/special/status), effect description
  - Source: PokeAPI `/move/{id}` endpoint
  
- **TeamMember**: User-customized Pokemon for battle
  - Attributes: Pokemon data (from PokeAPI), selected moves (1-4), level (default 50), current HP (initialized to max)
  - Storage: Browser localStorage
  
- **Team**: Collection of TeamMembers
  - Attributes: team members array (max 6), team lead (first Pokemon), creation timestamp
  - Storage: Browser localStorage with key "pokemon-team-v1"

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can browse and view details for all 1000+ Pokemon from PokeAPI within 5 seconds per page load
- **SC-002**: Users can successfully build a team of 1-6 Pokemon with custom move selections in under 3 minutes
- **SC-003**: Custom team persists across page refreshes 100% of the time (localStorage reliability)
- **SC-004**: Custom Pokemon from team builder integrates with existing battle system with 0 regressions (all current battle tests pass)
- **SC-005**: PokeAPI fetch failure rate handled gracefully with 100% fallback success (cached data or retry prompts)
- **SC-006**: UI loading states display within 100ms of initiating fetch operations for responsive user experience

## Assumptions

- PokeAPI endpoints remain stable and accessible (current v2 API)
- Browser localStorage is available and has sufficient quota (5-10MB typical)
- Users have internet connection for initial Pokemon/move data fetch (subsequent uses can leverage cache)
- Existing battle system Move and Pokemon interfaces can accommodate PokeAPI data with transformation layer
- Users understand Pokemon/move terminology from the Pokemon franchise
- Single Pokemon battles for MVP (team switching in future iteration)
- All Pokemon start at level 50 for battle balance
- Move PP (Power Points) is informational only for MVP (unlimited use in battles)

## Out of Scope

- Pokemon evolution during battles or team building
- Move learning by level-up or TM/HM (users can pick any learnable move)
- Pokemon abilities, held items, natures, IVs, EVs (competitive features)
- Team switching during battle (multi-Pokemon battles)
- AI NPC teams (NPC remains hardcoded SAMPLE_NPC for now)
- Move PP depletion mechanics (unlimited move uses)
- Pokemon nicknames or customization
- Team import/export or sharing between users
- Multi-language support (English only from PokeAPI)
- Shiny Pokemon variants or alternate forms

## Dependencies

- External: PokeAPI (https://pokeapi.co) endpoints `/pokemon`, `/move` must be accessible
- Internal: Existing battle system (`src/stores/battle.ts`, `src/domain/battle/engine/entities.ts`) remains functional
- Internal: Type chart integration (feature 002) for type effectiveness calculations
- Technical: Browser localStorage API for team persistence
- Technical: HTTP fetch client (reuse from feature 002 type chart service)

## Technical Constraints

- Must maintain compatibility with existing battle system interfaces (Pokemon, Move, BattleState)
- PokeAPI rate limits: Free tier allows reasonable usage, but implement caching to minimize requests
- localStorage quota: Team data must fit within 5-10MB browser limit (typically ~50 teams with full data)
- Must support modern browsers (Chrome/Firefox/Safari last 2 versions)
- UI must remain responsive during PokeAPI fetches (async operations with loading states)
- Sprite images from PokeAPI must load efficiently (lazy loading recommended)
