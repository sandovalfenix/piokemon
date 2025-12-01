# Data Model: Pokemon Team Builder

**Feature**: 003-pokemon-team-builder  
**Date**: November 29, 2025  
**Purpose**: Define all entities, their attributes, relationships, validation rules, and state transitions

## Entity Definitions

### 1. Pokemon (PokeAPI Entity)

**Source**: PokeAPI `/pokemon/{id}` endpoint  
**Purpose**: Represents a Pokemon species from PokeAPI with stats and learnable moves

**Attributes**:
```typescript
interface Pokemon {
  id: number                    // PokeAPI unique identifier (1-1000+)
  name: string                  // Display name (e.g., "Pikachu")
  types: PokemonType[]          // 1-2 types (e.g., ["Electric"])
  stats: PokemonStats           // Base stats object
  sprite: string                // Front sprite URL from PokeAPI
  moves: MoveReference[]        // Learnable moves (id + name only)
}

interface PokemonStats {
  hp: number                    // Hit Points (1-255)
  attack: number                // Physical attack (1-255)
  defense: number               // Physical defense (1-255)
  spAttack: number              // Special attack (1-255)
  spDefense: number             // Special defense (1-255)
  speed: number                 // Speed stat (1-255)
}

type PokemonType = 
  | 'Normal' | 'Fire' | 'Water' | 'Electric' | 'Grass' | 'Ice'
  | 'Fighting' | 'Poison' | 'Ground' | 'Flying' | 'Psychic' | 'Bug'
  | 'Rock' | 'Ghost' | 'Dragon' | 'Dark' | 'Steel' | 'Fairy'

interface MoveReference {
  id: number                    // Move ID for fetching details
  name: string                  // Move name (e.g., "Thunderbolt")
}
```

**Validation Rules**:
- `id`: Must be positive integer, unique
- `name`: Non-empty string, max 50 characters
- `types`: Array length 1-2, all valid PokemonType values
- `stats`: All values 1-255 (PokeAPI constraint)
- `sprite`: Valid URL string
- `moves`: Array of valid MoveReference objects, max 800 (Pokemon movepool size)

**Relationships**:
- Has many `MoveReference` (learnable moves)
- Used by `TeamMember` (composition)

---

### 2. Move (PokeAPI Entity)

**Source**: PokeAPI `/move/{id}` endpoint  
**Purpose**: Represents a Pokemon move with damage, accuracy, and type information

**Attributes**:
```typescript
interface Move {
  id: number                    // PokeAPI unique identifier
  name: string                  // Display name (e.g., "Thunderbolt")
  type: PokemonType             // Move type (for type effectiveness)
  power: number | null          // Damage value (null for status moves)
  accuracy: number              // Hit chance percentage (1-100, or 0 for always-hit)
  category: MoveCategory        // Physical/Special/Status
  pp: number                    // Power Points (1-64, informational only)
  effect: string                // Brief description (optional for MVP)
}

type MoveCategory = 'Physical' | 'Special' | 'Status'
```

**Validation Rules**:
- `id`: Must be positive integer, unique
- `name`: Non-empty string, max 50 characters
- `type`: Valid PokemonType
- `power`: Null OR 1-250 (PokeAPI constraint)
- `accuracy`: 0 (always-hit) OR 1-100
- `category`: Must be 'Physical', 'Special', or 'Status'
- `pp`: 1-64 (PokeAPI constraint)
- `effect`: Optional string, max 500 characters

**Relationships**:
- Belongs to `PokemonType` (move type)
- Used by `TeamMember` (selected moves)

---

### 3. TeamMember (User-Customized Entity)

**Source**: User selection in team builder UI  
**Purpose**: Represents a customized Pokemon with selected moves ready for battle

**Attributes**:
```typescript
interface TeamMember {
  pokemon: Pokemon              // Base Pokemon data from PokeAPI
  selectedMoves: Move[]         // User-selected moves (1-4)
  level: number                 // Battle level (default 50)
  currentHp: number             // Current HP (initialized to max)
  maxHp: number                 // Maximum HP (computed from stats + level)
  position: number              // Team position (0-5, 0 is lead)
}
```

**Validation Rules**:
- `pokemon`: Must be valid Pokemon object
- `selectedMoves`: Array length 1-4, all valid Move objects
- `level`: Fixed at 50 for MVP (future: 1-100)
- `currentHp`: 0 to maxHp (inclusive)
- `maxHp`: Computed from `pokemon.stats.hp` and `level` formula
- `position`: 0-5 (unique within team)

**Business Rules**:
- All moves in `selectedMoves` must be in `pokemon.moves` (learnable by Pokemon)
- `currentHp` initialized to `maxHp` when added to team
- `position` 0 is team lead (first Pokemon in battle)

**Relationships**:
- Has one `Pokemon` (composition)
- Has 1-4 `Move` (composition)
- Belongs to `Team`

---

### 4. Team (User Collection)

**Source**: User assembly in team builder UI  
**Purpose**: Collection of TeamMembers representing player's battle roster

**Attributes**:
```typescript
interface Team {
  members: TeamMember[]         // Team roster (1-6 Pokemon)
  createdAt: number             // Unix timestamp (milliseconds)
  updatedAt: number             // Unix timestamp (milliseconds)
  version: number               // Schema version for localStorage migration
}
```

**Validation Rules**:
- `members`: Array length 1-6, all valid TeamMember objects
- `members[].position`: Sequential 0-5, no gaps or duplicates
- `createdAt`: Valid Unix timestamp
- `updatedAt`: >= createdAt
- `version`: Current schema version (1 for MVP)

**Business Rules**:
- Minimum 1 Pokemon required to start battle
- Maximum 6 Pokemon (standard Pokemon team size)
- Position 0 (lead) is first Pokemon in battle
- All TeamMembers have unique Pokemon (no duplicate species for MVP)
- Team persists across sessions via localStorage

**Relationships**:
- Has 1-6 `TeamMember` (composition)
- Used by Battle system (integration point)

---

## State Transitions

### Pokemon Selection Flow

```
[No Selection] 
    ↓ User clicks Pokemon in catalog
[Pokemon Selected]
    ↓ User clicks "Select Moves"
[Move Selection Mode]
    ↓ User selects 1-4 moves
[Moves Selected (valid: 1-4)]
    ↓ User clicks "Add to Team"
[Validate: Team not full (< 6)]
    ↓ Pass
[TeamMember Created]
    ↓ Added to Team.members[]
[Team Updated]
    ↓ Auto-save to localStorage
[Ready for Battle or Continue Building]
```

### Team Building States

```typescript
enum TeamBuildingState {
  Empty = 'empty',              // No Pokemon in roster
  Building = 'building',        // 1-5 Pokemon, can add more
  Full = 'full',                // 6 Pokemon, cannot add (can remove/reorder)
  ReadyForBattle = 'ready'      // ≥1 Pokemon with ≥1 move each
}

// State validation
function getTeamState(team: Team): TeamBuildingState {
  if (team.members.length === 0) return TeamBuildingState.Empty
  if (team.members.length === 6) return TeamBuildingState.Full
  
  const allValid = team.members.every(m => m.selectedMoves.length >= 1)
  if (allValid && team.members.length >= 1) {
    return team.members.length < 6 
      ? TeamBuildingState.Building 
      : TeamBuildingState.ReadyForBattle
  }
  
  return TeamBuildingState.Building
}
```

### Battle Integration Flow

```
[Team Ready] (≥1 Pokemon, all with ≥1 move)
    ↓ User clicks "Start Battle"
[Validate Team]
    ↓ Pass: min 1 Pokemon, all have ≥1 move
[Transform Team → Battle Entities]
    ↓ TeamMember → Battle.Pokemon format
    ↓ Move → Battle.Move format
[Initialize Battle Store]
    ↓ player = team.members[0] (lead)
    ↓ npc = SAMPLE_NPC (unchanged)
[Navigate to /battle]
    ↓ Battle UI renders
[Battle Active]
```

---

## Data Transformations

### PokeAPI Pokemon → Internal Pokemon

```typescript
function transformPokeAPIToPokemon(apiResponse: PokeAPIResponse): Pokemon {
  return {
    id: apiResponse.id,
    name: capitalize(apiResponse.name), // "pikachu" → "Pikachu"
    types: apiResponse.types.map(t => capitalize(t.type.name)),
    stats: {
      hp: findStat(apiResponse.stats, 'hp'),
      attack: findStat(apiResponse.stats, 'attack'),
      defense: findStat(apiResponse.stats, 'defense'),
      spAttack: findStat(apiResponse.stats, 'special-attack'),
      spDefense: findStat(apiResponse.stats, 'special-defense'),
      speed: findStat(apiResponse.stats, 'speed')
    },
    sprite: apiResponse.sprites.front_default,
    moves: apiResponse.moves.map(m => ({
      id: extractIdFromUrl(m.move.url),
      name: capitalize(m.move.name)
    }))
  }
}
```

### PokeAPI Move → Internal Move

```typescript
function transformPokeAPIToMove(apiResponse: PokeAPIMoveResponse): Move {
  return {
    id: apiResponse.id,
    name: capitalize(apiResponse.name),
    type: capitalize(apiResponse.type.name),
    power: apiResponse.power, // Nullable for status moves
    accuracy: apiResponse.accuracy ?? 0, // 0 = always-hit
    category: mapDamageClass(apiResponse.damage_class.name),
    pp: apiResponse.pp,
    effect: apiResponse.effect_entries.find(e => e.language.name === 'en')?.short_effect ?? ''
  }
}

function mapDamageClass(damageClass: string): MoveCategory {
  const map = {
    'physical': 'Physical',
    'special': 'Special',
    'status': 'Status'
  }
  return map[damageClass] ?? 'Status'
}
```

### TeamMember → Battle Pokemon

```typescript
function transformTeamMemberToBattlePokemon(member: TeamMember): BattlePokemon {
  return {
    name: member.pokemon.name,
    level: member.level,
    types: member.pokemon.types,
    stats: member.pokemon.stats,
    moves: member.selectedMoves, // Already in correct format
    currentHp: member.currentHp,
    maxHp: member.maxHp
  }
}
```

---

## Storage Schema

### localStorage: Team Persistence

**Key**: `pokemon-team-v1`

**Schema**:
```json
{
  "version": 1,
  "createdAt": 1732896000000,
  "updatedAt": 1732896000000,
  "members": [
    {
      "pokemon": {
        "id": 25,
        "name": "Pikachu",
        "types": ["Electric"],
        "stats": { "hp": 35, "attack": 55, "defense": 40, "spAttack": 50, "spDefense": 50, "speed": 90 },
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
        "moves": [
          { "id": 84, "name": "Thunder Shock" },
          { "id": 85, "name": "Thunderbolt" }
        ]
      },
      "selectedMoves": [
        {
          "id": 85,
          "name": "Thunderbolt",
          "type": "Electric",
          "power": 90,
          "accuracy": 100,
          "category": "Special",
          "pp": 15
        }
      ],
      "level": 50,
      "currentHp": 110,
      "maxHp": 110,
      "position": 0
    }
  ]
}
```

**Validation on Load**:
1. Check `version` field exists and is supported (currently 1)
2. Validate all `members[]` have required fields
3. Validate `selectedMoves[]` length is 1-4
4. Validate all `position` values are unique and sequential
5. If validation fails: Clear cache, start with empty team

---

## Computed Properties

### HP Calculation Formula

```typescript
// Simplified Pokemon HP formula for level 50
function calculateMaxHp(baseHp: number, level: number = 50): number {
  // Formula: floor(((2 * Base + IV + EV/4) * Level / 100) + Level + 10)
  // Simplified for MVP: IV=31 (max), EV=0 (none)
  const iv = 31
  const ev = 0
  return Math.floor(((2 * baseHp + iv + ev / 4) * level / 100) + level + 10)
}

// Example: Pikachu (HP 35, Level 50) → 110 HP
```

### Team Validation

```typescript
function validateTeam(team: Team): ValidationResult {
  const errors: string[] = []
  
  // Check team size
  if (team.members.length === 0) {
    errors.push('Team must have at least 1 Pokemon')
  }
  if (team.members.length > 6) {
    errors.push('Team cannot exceed 6 Pokemon')
  }
  
  // Check each member
  team.members.forEach((member, index) => {
    if (member.selectedMoves.length === 0) {
      errors.push(`Pokemon at position ${index} has no moves`)
    }
    if (member.selectedMoves.length > 4) {
      errors.push(`Pokemon at position ${index} has too many moves (max 4)`)
    }
    if (member.position !== index) {
      errors.push(`Pokemon position mismatch at index ${index}`)
    }
  })
  
  // Check for duplicate positions
  const positions = team.members.map(m => m.position)
  const uniquePositions = new Set(positions)
  if (positions.length !== uniquePositions.size) {
    errors.push('Duplicate Pokemon positions detected')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}
```

---

## Migration Strategy

### Schema Version History

**Version 1** (MVP):
- Initial schema with all fields
- No migration needed (first version)

**Future Versions** (planned):
- Version 2: Add `nickname` field to TeamMember
- Version 3: Add `ability` field to TeamMember
- Migration function: `migrateTeamSchema(oldTeam, targetVersion)`

### localStorage Migration Flow

```typescript
function loadTeamFromLocalStorage(): Team | null {
  const raw = localStorage.getItem('pokemon-team-v1')
  if (!raw) return null
  
  try {
    const data = JSON.parse(raw)
    
    // Check version
    if (data.version !== 1) {
      console.warn('Unsupported team schema version:', data.version)
      // Future: Call migration function
      return null
    }
    
    // Validate schema
    const validationResult = validateTeam(data)
    if (!validationResult.valid) {
      console.error('Invalid team data:', validationResult.errors)
      return null
    }
    
    return data as Team
  } catch (error) {
    console.error('Failed to parse team data:', error)
    return null
  }
}
```

---

## Summary

**Total Entities**: 4 (Pokemon, Move, TeamMember, Team)  
**External APIs**: PokeAPI `/pokemon`, `/move`  
**Storage**: localStorage (1 key: `pokemon-team-v1`)  
**Transformations**: 3 layers (PokeAPI → Internal → Battle)  
**Validation**: Runtime type guards + business rule checks  
**State Machine**: 4 states (Empty, Building, Full, ReadyForBattle)
