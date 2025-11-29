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
 * Runtime type guard for PokeAPI response validation
 */
export function isPokeAPITypeResponse(data: unknown): data is PokeAPITypeResponse {
  if (typeof data !== 'object' || data === null) return false

  const obj = data as Record<string, unknown>

  return (
    typeof obj.id === 'number' &&
    typeof obj.name === 'string' &&
    POKEMON_TYPES.includes(obj.name as PokemonType) &&
    typeof obj.damage_relations === 'object' &&
    obj.damage_relations !== null &&
    Array.isArray((obj.damage_relations as any).double_damage_to) &&
    Array.isArray((obj.damage_relations as any).half_damage_to) &&
    Array.isArray((obj.damage_relations as any).no_damage_to)
  )
}
