/**
 * PokeAPI Response Types
 * Feature: 003-pokemon-team-builder
 *
 * TypeScript interfaces for PokeAPI v2 endpoint responses
 * Based on contracts/pokeapi-pokemon.json and contracts/pokeapi-move.json
 */

/**
 * PokeAPI Pokemon Response
 * From /pokemon/{id} endpoint
 */
export interface PokeAPIResponse {
  id: number
  name: string // lowercase, hyphenated (e.g., "pikachu")
  types: PokeAPITypeSlot[]
  stats: PokeAPIStat[]
  sprites: PokeAPISprites
  moves: PokeAPIMoveSlot[]
  weight?: number // hectograms (not used in MVP)
  height?: number // decimeters (not used in MVP)
}

export interface PokeAPITypeSlot {
  slot: number // 1 or 2
  type: {
    name: string // lowercase (e.g., "electric")
    url: string
  }
}

export interface PokeAPIStat {
  base_stat: number // 1-255
  effort: number // not used in MVP
  stat: {
    name: 'hp' | 'attack' | 'defense' | 'special-attack' | 'special-defense' | 'speed'
    url: string
  }
}

export interface PokeAPISprites {
  front_default: string | null // Front sprite URL
  front_shiny?: string | null // not used in MVP
  back_default?: string | null // not used in MVP
}

export interface PokeAPIMoveSlot {
  move: {
    name: string // lowercase, hyphenated (e.g., "thunderbolt")
    url: string // URL to move resource
  }
  version_group_details?: unknown[] // not used in MVP
}

/**
 * PokeAPI Move Response
 * From /move/{id} endpoint
 */
export interface PokeAPIMoveResponse {
  id: number
  name: string // lowercase, hyphenated (e.g., "thunderbolt")
  type: {
    name: string // lowercase (e.g., "electric")
    url: string
  }
  power: number | null // null for status moves
  accuracy: number | null // null for always-hit moves
  pp: number // 1-64
  damage_class: {
    name: 'physical' | 'special' | 'status'
    url: string
  }
  effect_entries?: Array<{
    effect: string // full effect description
    short_effect: string // brief summary
    language: {
      name: string // language code (e.g., "en")
      url: string
    }
  }>
  effect_chance?: number | null // chance for secondary effect (e.g., 10 for 10%)
  priority?: number // not used in MVP
  target?: {
    name: string
    url: string
  }
  /** Stat changes applied by this move */
  stat_changes?: Array<{
    change: number // positive or negative change (-6 to +6)
    stat: {
      name: string // e.g., "attack", "defense", "speed"
      url: string
    }
  }>
  /** Move metadata including status ailments */
  meta?: {
    ailment?: {
      name: string // e.g., "paralysis", "sleep", "poison", "burn", "freeze", "none"
      url: string
    }
    ailment_chance?: number // 0-100, chance of applying ailment
    category?: {
      name: string // e.g., "damage", "ailment", "net-good-stats", "heal"
      url: string
    }
    crit_rate?: number
    drain?: number
    flinch_chance?: number
    healing?: number
    max_hits?: number | null
    max_turns?: number | null
    min_hits?: number | null
    min_turns?: number | null
    stat_chance?: number // chance for stat changes to occur
  }
}

/**
 * PokeAPI Pokemon List Response
 * From /pokemon?limit={limit}&offset={offset} endpoint
 */
export interface PokeAPIPokemonListResponse {
  count: number // total number of Pokemon
  next: string | null // URL to next page
  previous: string | null // URL to previous page
  results: Array<{
    name: string // Pokemon name (lowercase)
    url: string // URL to Pokemon resource
  }>
}

/**
 * Runtime type guard for PokeAPI Pokemon response
 */
export function isPokeAPIResponse(data: unknown): data is PokeAPIResponse {
  if (typeof data !== 'object' || data === null) return false
  const obj = data as Record<string, unknown>

  return (
    typeof obj.id === 'number' &&
    typeof obj.name === 'string' &&
    Array.isArray(obj.types) &&
    Array.isArray(obj.stats) &&
    typeof obj.sprites === 'object' &&
    Array.isArray(obj.moves)
  )
}

/**
 * Runtime type guard for PokeAPI Move response
 */
export function isPokeAPIMoveResponse(data: unknown): data is PokeAPIMoveResponse {
  if (typeof data !== 'object' || data === null) return false
  const obj = data as Record<string, unknown>

  return (
    typeof obj.id === 'number' &&
    typeof obj.name === 'string' &&
    typeof obj.type === 'object' &&
    (typeof obj.power === 'number' || obj.power === null) &&
    (typeof obj.accuracy === 'number' || obj.accuracy === null) &&
    typeof obj.pp === 'number' &&
    typeof obj.damage_class === 'object'
  )
}

/**
 * Extract Pokemon ID from PokeAPI URL
 * Example: "https://pokeapi.co/api/v2/pokemon/25/" → 25
 */
export function extractIdFromUrl(url: string): number {
  const match = url.match(/\/(\d+)\/$/)
  return match && match[1] ? parseInt(match[1], 10) : 0
}
