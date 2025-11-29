# Feature Specification: PokeAPI Type Chart Integration

**Feature Branch**: `002-pokeapi-type-integration`  
**Created**: November 29, 2025  
**Status**: Draft  
**Input**: User description: "Integrate PokeAPI service to fetch TYPE_CHART dynamically from https://pokeapi.co/api/v2/type/ endpoint with localStorage cache and fallback to hardcoded data"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dynamic Type Data Loading on First Battle (Priority: P1)

When a player enters their first battle, the system fetches the latest Pokemon type effectiveness data from PokeAPI, caches it locally, and uses it for all damage calculations. The battle starts seamlessly without the user noticing any delay.

**Why this priority**: Core functionality that replaces hardcoded data with live API data. Essential for ensuring type chart accuracy matches official Pokemon data.

**Independent Test**: Can be fully tested by starting the app, navigating to battle module for the first time, and verifying network call to PokeAPI occurs and battle uses fetched data.

**Acceptance Scenarios**:

1. **Given** user has never accessed battle module before, **When** user navigates to battle screen, **Then** system fetches all 18 Pokemon types from PokeAPI
2. **Given** PokeAPI fetch is successful, **When** battle starts, **Then** damage calculations use fetched type effectiveness data
3. **Given** type data is fetched, **When** user starts second battle in same session, **Then** no additional API calls are made (uses cached data)
4. **Given** type data is cached, **When** user closes and reopens app, **Then** cached data is loaded from localStorage without API call

---

### User Story 2 - Graceful Fallback When API Unavailable (Priority: P2)

If PokeAPI is down or network is unavailable, the system automatically falls back to the existing hardcoded TYPE_CHART, ensuring battles can still function without interruption.

**Why this priority**: Critical for offline capability and resilience. Users should never be blocked from playing due to API issues.

**Independent Test**: Can be tested by blocking network requests to PokeAPI and verifying battle still works with hardcoded data.

**Acceptance Scenarios**:

1. **Given** PokeAPI is unreachable, **When** user enters battle module, **Then** system uses hardcoded TYPE_CHART and displays no error to user
2. **Given** API call times out after 5 seconds, **When** timeout occurs, **Then** system immediately switches to fallback data
3. **Given** cached data exists but API call fails, **When** fetching fresh data, **Then** system continues using cached data
4. **Given** no cache and API unavailable, **When** battle starts, **Then** system uses hardcoded fallback and logs warning

---

### User Story 3 - Pokemon Type Validation Against Official Data (Priority: P3)

When Pokemon data is used in battles, the system validates that Pokemon types exist in the fetched type chart, ensuring data consistency with official Pokemon universe.

**Why this priority**: Ensures data integrity and catches configuration errors. Less critical than core battle functionality but important for correctness.

**Independent Test**: Can be tested by creating a Pokemon with an invalid type and verifying system rejects it or logs a warning.

**Acceptance Scenarios**:

1. **Given** type chart is loaded from API, **When** a Pokemon has a type not in the chart, **Then** system logs validation warning and uses fallback for that type
2. **Given** all Pokemon types are valid, **When** battle initializes, **Then** no validation warnings occur
3. **Given** API returns incomplete type data, **When** validation runs, **Then** system falls back to hardcoded data

---

### User Story 3 - [Brief Title] (Priority: P3)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### Edge Cases

- What happens when PokeAPI returns malformed JSON or HTTP 500 error?
- How does system handle partial API responses (e.g., only 15 of 18 types loaded)?
- What if localStorage quota is exceeded and cache cannot be saved?
- How does system behave if PokeAPI changes their schema or endpoint structure?
- What happens during cache expiration - does battle pause or use stale data?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST fetch type effectiveness data from PokeAPI endpoint `https://pokeapi.co/api/v2/type/{id}` for all 18 Pokemon types (Normal, Fire, Water, Electric, Grass, Ice, Fighting, Poison, Ground, Flying, Psychic, Bug, Rock, Ghost, Dragon, Dark, Steel, Fairy)
- **FR-002**: System MUST cache fetched type chart data in browser localStorage with key "pokemon-type-chart" to avoid redundant API calls
- **FR-003**: System MUST include cache timestamp and validate cache freshness (max age: 7 days) before using cached data
- **FR-004**: System MUST transform PokeAPI response format (`damage_relations` object) into existing TYPE_CHART format (Record<string, Record<string, number>>)
- **FR-005**: System MUST fall back to hardcoded TYPE_CHART if PokeAPI fetch fails, times out (5 second timeout), or returns invalid data
- **FR-006**: System MUST validate that all Pokemon types used in battles exist in the loaded type chart
- **FR-007**: System MUST load type data lazily on first access to battle module, not on app initialization
- **FR-008**: System MUST handle PokeAPI rate limiting (retry with exponential backoff if 429 response received)
- **FR-009**: System MUST log API errors to console for debugging without blocking battle functionality
- **FR-010**: System MUST preserve existing battle functionality - all current tests must pass with both API and fallback data

### Key Entities

- **TypeChartCache**: Stores fetched type chart data with metadata (timestamp, version, source)
  - Attributes: typeChart (map), fetchedAt (date), expiresAt (date), source ('api' | 'fallback')
- **PokeAPITypeResponse**: External API response structure
  - Contains: name, damage_relations (double_damage_to, half_damage_to, no_damage_to arrays)
- **TypeEffectivenessMap**: Internal representation matching existing TYPE_CHART format
  - Format: Record<AttackingType, Record<DefendingType, Multiplier>>

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Type chart data loads from PokeAPI within 3 seconds on first battle access with stable internet connection
- **SC-002**: Cached type data eliminates API calls for 7 days, reducing network usage by 99% after first load
- **SC-003**: Battle functionality remains 100% operational when PokeAPI is unavailable (fallback succeeds)
- **SC-004**: All existing battle unit tests pass with both PokeAPI-fetched and hardcoded type charts
- **SC-005**: Type effectiveness calculations match official Pokemon game mechanics (verified against PokeAPI data)
- **SC-006**: System handles network failures gracefully with no user-facing errors or battle interruptions

## Assumptions

- PokeAPI endpoint structure remains stable (no breaking schema changes)
- Browser localStorage is available and not disabled by user
- Type effectiveness rules have not changed significantly from hardcoded version
- Internet connection is available for initial data fetch in most use cases
- PokeAPI free tier rate limits are sufficient for typical usage patterns

## Out of Scope

- Fetching Pokemon sprites, stats, or move data from PokeAPI (only type chart)
- Real-time type chart updates during battle (cache is checked only on battle module load)
- Multi-language support for type names (English only)
- Custom type effectiveness rules or user modifications
- Synchronization across multiple devices or user profiles

## Dependencies

- External: PokeAPI (https://pokeapi.co) must be accessible and operational
- Internal: Existing TYPE_CHART in `src/data/typeChart.ts` serves as fallback
- Technical: Browser localStorage API for caching
- Testing: Mock PokeAPI responses for unit tests to avoid external dependencies

## Technical Constraints

- Must use existing `computeTypeMultiplier` function interface (no breaking changes)
- Cache size limited by browser localStorage quota (typically 5-10MB)
- API calls should not block UI rendering or battle initialization
- Must support offline-first capability (fallback to hardcoded data)


### Measurable Outcomes

- **SC-001**: [Measurable metric, e.g., "Users can complete account creation in under 2 minutes"]
- **SC-002**: [Measurable metric, e.g., "System handles 1000 concurrent users without degradation"]
- **SC-003**: [User satisfaction metric, e.g., "90% of users successfully complete primary task on first attempt"]
- **SC-004**: [Business metric, e.g., "Reduce support tickets related to [X] by 50%"]
