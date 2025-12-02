# Feature Specification: Modern BattleScreen UI with Animated Sprites and Enhanced UX

**Feature Branch**: `004-modern-battle-ui`  
**Created**: November 30, 2025  
**Status**: Draft  
**Input**: User description: "lets create a new feature to implement the new BattleScreen where using this endpoint https://play.pokemonshowdown.com/sprites/ani-back/necrozma.gif Donde el nombre necrozma cambiara con el name que traiga el team builder para las batallas, ademas arreglar pequeños errores que hay en el momento de la batalla como que no inhabilita el boton de ataque mientras se esta atacando, cambiar la animacion por algo que parezca que el pokemon se carga contra el rival ademas no usar pixel art en los estilos si no algo mas como neumorphism con glassy vibes, este nuevo feature debe lograr que el equipo creado en team builder para que tenga una batalla de momento con el sample npc luego este sample npc sera random de una coleccion de npcs, en este feature tambien debemos añadir la animacion de carga y animaciones mas limpias y acordes, ademas usar los vibe de style que te mencione"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Display Animated Pokemon Sprites from PokemonShowdown (Priority: P1) 🎯 MVP

When a battle begins, the player's Pokemon appears as an animated sprite using PokemonShowdown's sprite endpoint (e.g., `https://play.pokemonshowdown.com/sprites/ani-back/{pokemon-name}.gif` for player, `https://play.pokemonshowdown.com/sprites/ani/{pokemon-name}.gif` for enemy). The Pokemon name comes dynamically from the team builder, replacing static sprite mappings. This creates a more polished, animated battle experience.

**Why this priority**: Core visual upgrade that defines the modernized battle experience. Without animated sprites, the feature loses its primary visual appeal and remains outdated.

**Independent Test**: Can be fully tested by starting a battle with any Pokemon from team builder, verifying the correct animated sprite loads from PokemonShowdown API, and confirming sprites animate continuously during battle.

**Acceptance Scenarios**:

1. **Given** user starts a battle with a Pokemon named "Charizard" from team builder, **When** battle screen loads, **Then** player Pokemon displays animated sprite from `https://play.pokemonshowdown.com/sprites/ani-back/charizard.gif`
2. **Given** battle initializes with enemy NPC Pokemon "Pikachu", **When** battle screen loads, **Then** enemy Pokemon displays animated sprite from `https://play.pokemonshowdown.com/sprites/ani/pikachu.gif`
3. **Given** Pokemon name contains capital letters or special characters, **When** constructing sprite URL, **Then** system normalizes name to lowercase with hyphens (e.g., "Mr. Mime" → "mr-mime")
4. **Given** PokemonShowdown sprite fails to load, **When** image error occurs, **Then** system falls back to static sprite or placeholder image with Pokemon name label
5. **Given** sprites are loaded, **When** battle is active, **Then** sprites animate smoothly in a continuous loop without stuttering

---

### User Story 2 - Implement Neumorphism and Glassy UI Design (Priority: P1) 🎯 MVP

The BattleScreen uses a modern design language featuring neumorphism (soft shadows, subtle embossed/debossed elements) and glassy effects (frosted glass backgrounds, semi-transparent overlays with blur). This replaces pixel art styling with a contemporary, clean aesthetic that feels premium and polished.

**Why this priority**: Defines the visual identity of the modernized battle UI. This is the signature design element that differentiates this feature and delivers on the "modern" promise.

**Independent Test**: Can be tested by opening the battle screen and visually verifying UI elements use soft shadows, glassmorphism effects (backdrop blur, transparency), and neumorphic button/panel designs instead of flat/pixelated styles.

**Acceptance Scenarios**:

1. **Given** battle screen is open, **When** viewing UI panels (move selector, status panels, log), **Then** panels display semi-transparent frosted glass effect with backdrop blur and subtle borders
2. **Given** user hovers over action buttons (Fight, Bag, Pokemon, Run), **When** mouse enters button, **Then** button shows subtle neumorphic elevation change with soft inner/outer shadows
3. **Given** HP bars and status indicators are displayed, **When** viewing battle UI, **Then** elements use rounded corners, gradient fills, and soft shadows instead of sharp pixel borders
4. **Given** move buttons are shown, **When** user views move selector, **Then** moves display in glassmorphic cards with semi-transparent backgrounds and smooth hover transitions
5. **Given** battle background is displayed, **When** battle screen loads, **Then** background uses gradient overlays or blurred imagery that complements neumorphic foreground elements

---

### User Story 3 - Disable Attack Button During Attack Execution (Priority: P2)

During an attack animation, the attack button becomes disabled to prevent multiple simultaneous attack requests. The button shows a visual disabled state (reduced opacity, cursor change) and only re-enables after the attack sequence completes. This prevents UI bugs and improves battle flow.

**Why this priority**: Critical UX fix that prevents player frustration and potential bugs from rapid button clicking. Essential for professional-feeling battle interactions.

**Independent Test**: Can be tested by selecting an attack, verifying the attack button becomes disabled during animation, attempting to click again (no response), and confirming button re-enables after attack completes.

**Acceptance Scenarios**:

1. **Given** user selects a move from move selector, **When** attack animation begins, **Then** all move buttons become disabled with reduced opacity (50%) and cursor changes to "not-allowed"
2. **Given** attack animation is in progress, **When** user clicks attack button, **Then** system ignores click and provides no response (no error, no duplicate attack)
3. **Given** attack sequence completes (damage dealt, log message appears), **When** animations finish, **Then** move buttons re-enable with full opacity and normal cursor
4. **Given** player Pokemon faints during attack, **When** battle state changes, **Then** attack buttons remain disabled and battle proceeds to end state
5. **Given** attack misses or fails, **When** attack sequence completes, **Then** move buttons still re-enable normally for next turn

---

### User Story 4 - Charge Attack Animation with Pokemon Movement (Priority: P2)

When a Pokemon attacks, it plays a charge animation where the sprite moves/scales toward the target briefly before returning to original position. This creates visual feedback that the attacking Pokemon is "charging" at the opponent, making attacks feel more impactful and dynamic.

**Why this priority**: Enhances battle immersion and makes attacks feel responsive. Players need visual confirmation their attack is happening beyond text logs.

**Independent Test**: Can be tested by executing any attack and verifying the attacking Pokemon sprite animates forward toward opponent, holds briefly, then returns to original position in sync with damage application.

**Acceptance Scenarios**:

1. **Given** player Pokemon uses a move, **When** attack animation triggers, **Then** player sprite translates/scales toward enemy position over 300ms with easing
2. **Given** player sprite reaches peak of charge animation, **When** impact moment occurs, **Then** sprite holds position for 100ms while damage effect plays on enemy
3. **Given** damage effect completes, **When** attack finishes, **Then** player sprite returns to original position over 200ms with easing
4. **Given** enemy Pokemon attacks, **When** enemy attack animation triggers, **Then** enemy sprite follows same charge pattern toward player sprite
5. **Given** attack misses, **When** attack animation plays, **Then** charge animation still executes but no damage effect appears on target

---

### User Story 5 - Integrate Team Builder Pokemon for Battles (Priority: P1) 🎯 MVP

The battle system uses the player's custom team built in the Team Builder (Feature 003) instead of hardcoded `SAMPLE_PLAYER`. When starting a battle, the first Pokemon in the team roster becomes the active battle Pokemon with all its selected moves, stats, and properties from team builder.

**Why this priority**: Critical integration that makes team building meaningful. Without this, users cannot use their custom teams in battles, breaking the core gameplay loop.

**Independent Test**: Can be tested by building a custom team with specific Pokemon and moves, starting a battle, and verifying the team lead appears in battle with correct name, moves, stats, and sprite.

**Acceptance Scenarios**:

1. **Given** user has built a team with "Gengar" as first Pokemon, **When** battle starts, **Then** player Pokemon is Gengar with its assigned moves from team builder
2. **Given** team builder Pokemon has custom move set (e.g., Shadow Ball, Sludge Bomb, Dark Pulse, Psychic), **When** battle fight menu opens, **Then** move selector shows exactly those 4 moves
3. **Given** user has not built a custom team, **When** attempting to start battle, **Then** system uses default fallback team (existing SAMPLE_PLAYER behavior)
4. **Given** team builder Pokemon has specific stats (HP, Attack, etc.), **When** battle calculations occur, **Then** damage and HP values reflect team builder stats accurately
5. **Given** battle ends (win/loss), **When** returning to team builder, **Then** team roster remains intact and Pokemon HP is updated based on battle outcome

---

### User Story 6 - Battle Against Sample NPC (Initial Implementation) (Priority: P1) 🎯 MVP

For the initial release, battles occur against a single predefined sample NPC with a fixed team. This NPC serves as the baseline opponent while the random NPC collection is prepared for future enhancement.

**Why this priority**: MVP requirement to enable functional battles. Players need an opponent to test their teams against. Random NPC selection is deferred to keep scope manageable.

**Independent Test**: Can be tested by starting any battle and verifying the same sample NPC appears consistently with predictable team and behavior.

**Acceptance Scenarios**:

1. **Given** user clicks "Start Battle" from team builder, **When** battle initializes, **Then** system loads predefined sample NPC with fixed name, sprite, and Pokemon team
2. **Given** battle against sample NPC begins, **When** viewing enemy Pokemon, **Then** NPC Pokemon displays correct stats, moves, and animated sprite from PokemonShowdown
3. **Given** sample NPC Pokemon faints, **When** battle ends, **Then** system shows victory message and returns to team builder
4. **Given** player Pokemon faints, **When** battle ends, **Then** system shows defeat message and returns to team builder
5. **Given** multiple battles are started, **When** battles initialize, **Then** same sample NPC appears each time (consistent opponent for MVP)

---

### User Story 7 - Loading Animations and Smooth Transitions (Priority: P3)

The battle screen displays loading animations when initializing battles, fetching sprites, or processing turns. All state transitions (attack animations, view changes, HP updates) use smooth animations with appropriate timing and easing to create a polished, professional feel.

**Why this priority**: Quality-of-life enhancement that improves perceived performance and polish. Not critical for MVP functionality but significantly impacts user satisfaction.

**Independent Test**: Can be tested by starting a battle and observing smooth loading spinner/skeleton during initialization, and verifying all UI transitions animate smoothly without jarring jumps.

**Acceptance Scenarios**:

1. **Given** user starts a battle, **When** battle screen is loading, **Then** system displays loading spinner or skeleton UI with animated progress indicator
2. **Given** battle assets (sprites, data) are being fetched, **When** loading occurs, **Then** user sees smooth pulsing/shimmer animation on placeholder elements
3. **Given** HP bar value changes from damage, **When** HP updates, **Then** bar animates smoothly to new value over 500ms with easing (not instant jump)
4. **Given** user switches between views (main → fight → bag), **When** view changes, **Then** panels fade in/out smoothly with 200ms transitions
5. **Given** battle ends, **When** transitioning to results screen, **Then** elements fade out gracefully before navigation occurs

---

### Edge Cases

- What happens when PokemonShowdown sprite API is down or rate-limited during battle initialization?
- How does system handle Pokemon names with special characters (e.g., "Farfetch'd", "Type: Null") in sprite URL construction?
- What if team builder Pokemon has 0 moves assigned when starting battle?
- How does system behave if sprite URL returns 404 (Pokemon variant not available on PokemonShowdown)?
- What happens if attack button is clicked during transition between different battle views?
- How does system handle very long Pokemon names in neumorphic UI panels (text overflow)?
- What if user's team has Pokemon with extremely high HP values that break HP bar visual layout?
- How does system maintain consistent neumorphic styling across different screen sizes/resolutions?
- What happens when attack animation is interrupted by browser tab switch or window minimize?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST fetch animated Pokemon sprites from PokemonShowdown endpoint using pattern `https://play.pokemonshowdown.com/sprites/ani-back/{pokemon-name}.gif` for player Pokemon (back view)
- **FR-002**: System MUST fetch animated Pokemon sprites from PokemonShowdown endpoint using pattern `https://play.pokemonshowdown.com/sprites/ani/{pokemon-name}.gif` for enemy Pokemon (front view)
- **FR-003**: System MUST normalize Pokemon names for sprite URLs by converting to lowercase and replacing spaces with hyphens (e.g., "Mr. Mime" → "mr-mime")
- **FR-004**: System MUST implement fallback mechanism when sprite URL fails, displaying placeholder image or static sprite with Pokemon name overlay
- **FR-005**: System MUST apply neumorphic design to all UI panels, using soft shadows (e.g., `box-shadow: 8px 8px 16px rgba(0,0,0,0.2), -8px -8px 16px rgba(255,255,255,0.7)`)
- **FR-006**: System MUST apply glassmorphism effects to overlay panels using backdrop blur (e.g., `backdrop-filter: blur(10px)`) and semi-transparent backgrounds (e.g., `rgba(255,255,255,0.15)`)
- **FR-007**: System MUST disable all move buttons during attack animation sequence by setting `disabled` attribute and applying visual disabled state (50% opacity, cursor: not-allowed)
- **FR-008**: System MUST re-enable move buttons after attack sequence completes (after damage application and log message)
- **FR-009**: System MUST animate attacking Pokemon sprite toward target position using CSS transform translate/scale over 300ms duration
- **FR-010**: System MUST hold attack animation at peak for 100ms before returning sprite to original position over 200ms
- **FR-011**: System MUST sync attack animation timing with damage effect application on target Pokemon
- **FR-012**: System MUST load player Pokemon data from team builder store/service (first Pokemon in team roster)
- **FR-013**: System MUST use team builder Pokemon's assigned moves (up to 4) in battle move selector
- **FR-014**: System MUST apply team builder Pokemon's stats (HP, Attack, Defense, etc.) in battle calculations
- **FR-015**: System MUST provide fallback to default Pokemon if no custom team exists in team builder
- **FR-016**: System MUST initialize battles against predefined sample NPC with fixed Pokemon team for MVP
- **FR-017**: System MUST display loading animation (spinner or skeleton UI) during battle initialization and sprite loading
- **FR-018**: System MUST animate HP bar changes smoothly over 500ms with easing function when damage is applied
- **FR-019**: System MUST animate view transitions (main ↔ fight ↔ bag) with 200ms fade in/out effects
- **FR-020**: System MUST handle sprite loading errors gracefully without breaking battle flow
- **FR-021**: System MUST apply neumorphic hover states to interactive buttons with subtle shadow depth changes
- **FR-022**: System MUST use rounded corners (border-radius: 16px minimum) on all UI panels for modern aesthetic
- **FR-023**: System MUST implement responsive neumorphic design that maintains visual quality across screen sizes

### Key Entities

- **Animated Pokemon Sprite**: Dynamic GIF image fetched from PokemonShowdown API, representing Pokemon in battle with continuous animation loop. Key attributes: sprite URL (constructed from Pokemon name), loading state, fallback sprite path.
- **Battle UI State**: Tracks current view mode (main/fight/bag), button disabled states, active animations (attack, damage, loading), and transition states. Manages when user interactions are allowed.
- **Team Builder Pokemon**: Player's custom Pokemon from team builder (Feature 003) with assigned moves, stats, name, level, and type. Becomes active battle Pokemon when battle starts.
- **Sample NPC Opponent**: Predefined non-player trainer with fixed Pokemon team, name, and sprite. Serves as consistent battle opponent for MVP implementation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Battle screen loads and displays animated Pokemon sprites from PokemonShowdown API within 2 seconds of battle initialization for 95% of battles
- **SC-002**: Attack buttons remain disabled for the entire duration of attack animations (300ms charge + 100ms hold + 200ms return = 600ms minimum), preventing accidental double-clicks 100% of the time
- **SC-003**: All UI panels and interactive elements use neumorphic and glassmorphic design patterns consistently, with 0 pixel art or flat design elements remaining in battle UI
- **SC-004**: HP bar animations complete smoothly within 500ms of damage application, with visible easing curve (not linear or instant)
- **SC-005**: Team builder Pokemon successfully loads into battle with correct moves and stats in 100% of battles when custom team exists
- **SC-006**: Sprite loading fallback mechanism activates within 3 seconds when PokemonShowdown API fails, displaying placeholder without crashing battle
- **SC-007**: Attack charge animation plays synchronously with damage application, with peak animation timing matching impact moment within 50ms tolerance
- **SC-008**: Battle UI maintains visual quality and neumorphic styling across desktop resolutions from 1280x720 to 1920x1080 without layout breaks
- **SC-009**: Loading animations display within 200ms of battle initialization, providing immediate feedback to users
- **SC-010**: Users perceive battle UI as "modern and polished" in subjective feedback, citing smooth animations and contemporary design aesthetics

## Assumptions

- PokemonShowdown sprite API (https://play.pokemonshowdown.com/sprites/) remains publicly accessible and does not implement rate limiting that affects typical gameplay
- Pokemon names from team builder are valid and match PokemonShowdown's naming conventions (lowercase, hyphenated) or can be normalized reliably
- Team Builder (Feature 003) is fully implemented and provides accessible API/store for retrieving user's custom Pokemon teams
- Existing battle engine logic (damage calculations, turn order, move effects) remains functional and compatible with new UI layer
- Browser supports modern CSS features including `backdrop-filter` for glassmorphism (with graceful degradation for unsupported browsers)
- Users have stable internet connection to load external animated sprites from PokemonShowdown API
- Sample NPC Pokemon team data structure is compatible with existing battle system and new sprite loading mechanism
- Attack animation timing (600ms total) is acceptable to users and does not feel too slow or disrupt battle pacing
- Neumorphic design patterns are visually appealing to target audience and align with overall application aesthetic
- Future random NPC selection feature will reuse same UI components without requiring redesign

## Dependencies

- **Team Builder (Feature 003)**: Must be completed and provide accessible store/service to retrieve user's Pokemon team roster with moves and stats
- **PokemonShowdown Sprite API**: External dependency for animated Pokemon sprites; requires reliable access and consistent naming conventions
- **Existing Battle Engine**: Depends on current battle calculation logic, turn system, and move effects remaining stable during UI refactor
- **CSS Framework/Utilities**: May require additional CSS utilities or preprocessor support for neumorphism and glassmorphism patterns
- **Vue 3 Composition API**: Uses Vue 3 reactivity and composables for managing battle state and animations

## Out of Scope

- **Random NPC Selection from Collection**: Deferred to future enhancement. MVP uses single predefined sample NPC only.
- **Pokemon Switching Mid-Battle**: Multi-Pokemon battles where player can switch between team members during battle (future feature)
- **Advanced Battle Mechanics**: Status effects, weather, abilities, held items - existing mechanics remain unchanged
- **Mobile/Touch Optimization**: Initial implementation targets desktop; mobile responsiveness is future enhancement
- **Sound Effects Customization**: Uses existing audio system without modifications
- **Battle Replays or History**: Recording and reviewing past battles is out of scope
- **Multiplayer/PvP Battles**: Remains single-player against NPC only
- **Custom Battle Backgrounds**: Uses default/existing battle background; custom backgrounds per Pokemon type is future enhancement
- **Accessibility Enhancements**: Screen reader support, keyboard-only navigation, reduced motion preferences (future work)
- **Performance Optimization for Low-End Devices**: Assumes modern hardware capable of smooth CSS animations

## Future Enhancements

- Implement random NPC selection from diverse trainer collection with varied teams and difficulty levels
- Add Pokemon switching UI during battle to use full 6-Pokemon team roster
- Create multiple battle background environments that match Pokemon types or locations
- Implement particle effects for different move types (fire, water, electric) synchronized with attacks
- Add victory/defeat screen with animated transitions and battle statistics
- Support mobile touch gestures and responsive layout for phone/tablet gameplay
- Include accessibility features: reduced motion mode, high contrast theme, keyboard navigation
- Add battle tutorial mode with guided instructions for new players
- Implement battle speed controls (1x, 1.5x, 2x) for faster gameplay
- Create custom neumorphic UI themes with user-selectable color palettes
