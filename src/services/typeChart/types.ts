/**
 * Type definitions for PokeAPI Type Chart Integration
 * Feature: 002-pokeapi-type-integration
 */

// Pokemon type constants
export const POKEMON_TYPES = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
] as const

export type PokemonType = (typeof POKEMON_TYPES)[number]

/**
 * Type effectiveness map matching existing TYPE_CHART format
 * Format: Record<AttackingType, Record<DefendingType, Multiplier>>
 */
export type TypeEffectivenessMap = Record<string, Record<string, number>>

/**
 * Persistent cache structure stored in localStorage
 */
export interface TypeChartCache {
  /**
   * Schema version for future migrations
   * Format: semver (e.g., "1.0.0")
   */
  version: string

  /**
   * The complete type effectiveness chart
   */
  typeChart: TypeEffectivenessMap

  /**
   * When this cache was created
   * Format: ISO 8601 timestamp
   */
  fetchedAt: string

  /**
   * When this cache expires (fetchedAt + 7 days)
   * Format: ISO 8601 timestamp
   */
  expiresAt: string

  /**
   * Data source for debugging/telemetry
   */
  source: 'api' | 'fallback'
}

/**
 * External API response from PokeAPI /type/{id or name} endpoint
 * @see https://pokeapi.co/docs/v2#types
 */
export interface PokeAPITypeResponse {
  /** Numeric type ID (1-18) */
  id: number

  /** Type name in lowercase (e.g., "fire", "water") */
  name: PokemonType

  /** Damage effectiveness relationships */
  damage_relations: {
    /** Types this type deals 2x damage to */
    double_damage_to: Array<{ name: PokemonType; url: string }>

    /** Types this type deals 0.5x damage to */
    half_damage_to: Array<{ name: PokemonType; url: string }>

    /** Types this type deals 0x damage to (immune) */
    no_damage_to: Array<{ name: PokemonType; url: string }>

    // Defensive relationships (unused in our implementation)
    double_damage_from: Array<{ name: PokemonType; url: string }>
    half_damage_from: Array<{ name: PokemonType; url: string }>
    no_damage_from: Array<{ name: PokemonType; url: string }>
  }
}

/**
 * Result of cache validation check
 */
export interface CacheValidationResult {
  isValid: boolean
  reason?: 'expired' | 'corrupted' | 'version-mismatch' | 'missing'
  cache?: TypeChartCache
}

/**
 * Return type for service fetch operations
 */
export interface FetchTypeChartResult {
  success: boolean
  data?: TypeEffectivenessMap
  source: 'api' | 'cache' | 'fallback'
  error?: string
}
