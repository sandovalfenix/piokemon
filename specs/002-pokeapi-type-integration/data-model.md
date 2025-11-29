# Data Model: PokeAPI Type Chart Integration

**Feature**: 002-pokeapi-type-integration  
**Phase**: 1 (Design & Contracts)  
**Date**: November 29, 2025

## Overview

This document defines all data structures used in the PokeAPI type chart integration. All types are defined in TypeScript with strict mode enabled.

---

## Core Entities

### TypeChartCache

**Purpose**: Persistent cache structure stored in localStorage

**Location**: `src/services/typeChart/types.ts`

```typescript
export interface TypeChartCache {
  /**
   * Schema version for future migrations
   * Format: semver (e.g., "1.0.0")
   */
  version: string

  /**
   * The complete type effectiveness chart
   * Format: Record<AttackingType, Record<DefendingType, Multiplier>>
   */
  typeChart: TypeEffectivenessMap

  /**
   * When this cache was created
   * Format: ISO 8601 timestamp (e.g., "2025-11-29T12:00:00.000Z")
   */
  fetchedAt: string

  /**
   * When this cache expires
   * Format: ISO 8601 timestamp (fetchedAt + 7 days)
   */
  expiresAt: string

  /**
   * Data source for debugging/telemetry
   * - 'api': Fetched from PokeAPI
   * - 'fallback': Using hardcoded TYPE_CHART
   */
  source: 'api' | 'fallback'
}
```

**Validation Rules**:
- `version` must match current schema version ("1.0.0")
- `fetchedAt` must be valid ISO 8601 date
- `expiresAt` must be > `fetchedAt`
- `typeChart` must have all 18 Pokemon types as keys

**Example**:
```json
{
  "version": "1.0.0",
  "typeChart": {
    "Fire": { "Grass": 2, "Water": 0.5, "Ice": 2 },
    "Water": { "Fire": 2, "Grass": 0.5 }
  },
  "fetchedAt": "2025-11-29T12:00:00.000Z",
  "expiresAt": "2025-12-06T12:00:00.000Z",
  "source": "api"
}
```

---

### PokeAPITypeResponse

**Purpose**: External API response from PokeAPI /type endpoint

**Location**: `src/services/typeChart/types.ts`

```typescript
export interface PokeAPITypeResponse {
  /**
   * Numeric type ID (1-18)
   */
  id: number

  /**
   * Type name in lowercase (e.g., "fire", "water")
   */
  name: PokemonType

  /**
   * Damage effectiveness relationships
   */
  damage_relations: {
    /**
     * Types this type deals double damage to
     * Example: Fire → [Grass, Ice, Bug, Steel]
     */
    double_damage_to: Array<{ name: PokemonType; url: string }>

    /**
     * Types this type deals half damage to
     * Example: Fire → [Rock, Fire, Water, Dragon]
     */
    half_damage_to: Array<{ name: PokemonType; url: string }>

    /**
     * Types this type deals no damage to
     * Example: Normal → [Ghost]
     */
    no_damage_to: Array<{ name: PokemonType; url: string }>

    // Unused fields (defensive relationships)
    double_damage_from: Array<{ name: PokemonType; url: string }>
    half_damage_from: Array<{ name: PokemonType; url: string }>
    no_damage_from: Array<{ name: PokemonType; url: string }>
  }
}
```

**Notes**:
- We only use `*_to` fields (offensive damage) for TYPE_CHART
- `*_from` fields are ignored (defensive matchups not needed)
- `url` fields are ignored (we don't need to fetch related resources)

---

### PokemonType

**Purpose**: Type-safe enum of all 18 Pokemon types

**Location**: `src/services/typeChart/types.ts`

```typescript
export const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
] as const

export type PokemonType = typeof POKEMON_TYPES[number]
```

**Usage**:
```typescript
// Type-safe type checking
function isValidType(type: string): type is PokemonType {
  return POKEMON_TYPES.includes(type as PokemonType)
}
```

---

### TypeEffectivenessMap

**Purpose**: Internal format matching existing TYPE_CHART

**Location**: `src/data/typeChart.ts` (existing)

```typescript
export type TypeEffectivenessMap = Record<string, Record<string, number>>
```

**Format**:
```typescript
{
  "AttackingType": {
    "DefendingType": Multiplier  // 0, 0.5, 1, or 2
  }
}
```

**Example**:
```typescript
{
  "Fire": {
    "Grass": 2,    // Super effective
    "Water": 0.5,  // Not very effective
    "Rock": 0.5,
    "Fire": 0.5
  },
  "Water": {
    "Fire": 2,
    "Grass": 0.5
  }
}
```

**Implicit Rules**:
- If a matchup is not listed, multiplier is 1.0 (normal effectiveness)
- All AttackingType keys must be capitalized (e.g., "Fire" not "fire")

---

## Service Layer Types

### FetchTypeChartResult

**Purpose**: Return type for service fetch operations

```typescript
export interface FetchTypeChartResult {
  success: boolean
  data?: TypeEffectivenessMap
  source: 'api' | 'cache' | 'fallback'
  error?: string
}
```

**Usage**:
```typescript
const result = await typeChartService.loadTypeChart()
if (result.success) {
  console.log(`Loaded from: ${result.source}`)
  return result.data
}
```

---

### CacheValidationResult

**Purpose**: Result of cache freshness check

```typescript
export interface CacheValidationResult {
  isValid: boolean
  reason?: 'expired' | 'corrupted' | 'version-mismatch' | 'missing'
  cache?: TypeChartCache
}
```

---

## Transformation Logic

### PokeAPI → TYPE_CHART Mapping

**Input**: Array of 18 `PokeAPITypeResponse` objects
**Output**: Single `TypeEffectivenessMap` object

**Algorithm**:
```typescript
function transformToTypeChart(responses: PokeAPITypeResponse[]): TypeEffectivenessMap {
  const result: TypeEffectivenessMap = {}
  
  for (const response of responses) {
    const attackingType = capitalize(response.name)  // "fire" → "Fire"
    result[attackingType] = {}
    
    // Double damage (2.0x)
    for (const defender of response.damage_relations.double_damage_to) {
      result[attackingType][capitalize(defender.name)] = 2
    }
    
    // Half damage (0.5x)
    for (const defender of response.damage_relations.half_damage_to) {
      result[attackingType][capitalize(defender.name)] = 0.5
    }
    
    // No damage (0x)
    for (const defender of response.damage_relations.no_damage_to) {
      result[attackingType][capitalize(defender.name)] = 0
    }
  }
  
  return result
}
```

**Capitalization Rule**: PokeAPI uses lowercase names ("fire"), our TYPE_CHART uses title case ("Fire")

---

## State Management (Pinia Store)

### TypeChartStore State

```typescript
export interface TypeChartState {
  /**
   * The active type chart (reactive)
   */
  typeChart: TypeEffectivenessMap

  /**
   * Loading state for UI feedback
   */
  isLoading: boolean

  /**
   * Data source for current typeChart
   */
  source: 'api' | 'cache' | 'fallback' | null

  /**
   * Error message if load failed
   */
  error: string | null

  /**
   * Timestamp of last successful load
   */
  lastUpdated: Date | null
}
```

---

## Validation Schemas

### Runtime Type Guard for PokeAPITypeResponse

```typescript
export function isPokeAPITypeResponse(data: unknown): data is PokeAPITypeResponse {
  if (typeof data !== 'object' || data === null) return false
  
  const obj = data as Record<string, unknown>
  
  return (
    typeof obj.id === 'number' &&
    typeof obj.name === 'string' &&
    typeof obj.damage_relations === 'object' &&
    obj.damage_relations !== null &&
    Array.isArray((obj.damage_relations as any).double_damage_to) &&
    Array.isArray((obj.damage_relations as any).half_damage_to) &&
    Array.isArray((obj.damage_relations as any).no_damage_to)
  )
}
```

### Runtime Type Guard for TypeChartCache

```typescript
export function isValidCache(data: unknown): data is TypeChartCache {
  if (typeof data !== 'object' || data === null) return false
  
  const cache = data as Record<string, unknown>
  
  return (
    cache.version === '1.0.0' &&
    typeof cache.fetchedAt === 'string' &&
    typeof cache.expiresAt === 'string' &&
    (cache.source === 'api' || cache.source === 'fallback') &&
    typeof cache.typeChart === 'object' &&
    Object.keys(cache.typeChart).length === 18  // All 18 types present
  )
}
```

---

## Data Flow Diagram

```
┌─────────────────┐
│   PokeAPI       │
│   /type/fire    │  (18 endpoints)
│   /type/water   │
│   /type/...     │
└────────┬────────┘
         │ fetch (5s timeout)
         ▼
┌─────────────────────────────┐
│  PokeAPITypeResponse[]      │  (18 objects)
│  [{ name: "fire",           │
│     damage_relations: {...}}│
└────────┬────────────────────┘
         │ transform
         ▼
┌─────────────────────────────┐
│  TypeEffectivenessMap       │  (nested object)
│  { Fire: { Grass: 2,        │
│            Water: 0.5 }}    │
└────────┬────────────────────┘
         │ cache
         ▼
┌─────────────────────────────┐
│  TypeChartCache             │  (with metadata)
│  { version: "1.0.0",        │
│    typeChart: {...},        │
│    fetchedAt: "...",        │
│    expiresAt: "..." }       │
└────────┬────────────────────┘
         │ JSON.stringify
         ▼
┌─────────────────────────────┐
│  localStorage               │
│  key: "pokemon-type-chart-v1"
└─────────────────────────────┘
```

---

## Migration Strategy

If PokeAPI schema changes in the future:

1. Bump `TypeChartCache.version` to "2.0.0"
2. Update `POKEMON_TYPES` array if new types added
3. Create migration function:
   ```typescript
   function migrateCache(old: TypeChartCache): TypeChartCache {
     if (old.version === '1.0.0') {
       // Transform old format to new format
       return { ...old, version: '2.0.0' }
     }
     return old
   }
   ```
4. Old caches automatically invalidated by version mismatch

---

## Relationships

```
PokeAPITypeResponse (external)
    ↓ transformed by
TypeEffectivenessMap (internal)
    ↓ wrapped by
TypeChartCache (persistent)
    ↓ managed by
TypeChartStore (reactive state)
    ↓ consumed by
computeTypeMultiplier() (battle logic)
```

---

## Next Steps

- [x] Data model defined
- [ ] Create TypeScript type definitions in `src/services/typeChart/types.ts`
- [ ] Create API contracts in `contracts/pokeapi-type-response.ts`
- [ ] Implement transformation logic
- [ ] Implement validation functions
