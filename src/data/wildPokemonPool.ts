/**
 * Wild Pokemon Pool
 * Feature: 006-battle-module-update
 *
 * Gen 1 Pokemon available for wild encounters.
 * Weighted spawn rates for variety.
 */

// =============================================================================
// Interface
// =============================================================================

export interface WildPokemonEntry {
  /** PokeAPI Pokémon ID */
  pokemonId: number

  /** Display name */
  name: string

  /** Types for display */
  types: string[]

  /** Spawn weight (higher = more common) */
  weight: number
}

// =============================================================================
// Wild Pokemon Pool (Gen 1)
// =============================================================================

export const WILD_POKEMON_POOL: WildPokemonEntry[] = [
  // Common Normal types (high weight)
  { pokemonId: 19, name: 'Rattata', types: ['Normal'], weight: 10 },
  { pokemonId: 16, name: 'Pidgey', types: ['Normal', 'Flying'], weight: 10 },
  { pokemonId: 52, name: 'Meowth', types: ['Normal'], weight: 5 },
  { pokemonId: 133, name: 'Eevee', types: ['Normal'], weight: 2 },

  // Common Bug types
  { pokemonId: 10, name: 'Caterpie', types: ['Bug'], weight: 8 },
  { pokemonId: 13, name: 'Weedle', types: ['Bug', 'Poison'], weight: 8 },
  { pokemonId: 48, name: 'Venonat', types: ['Bug', 'Poison'], weight: 4 },

  // Grass types
  { pokemonId: 43, name: 'Oddish', types: ['Grass', 'Poison'], weight: 5 },
  { pokemonId: 69, name: 'Bellsprout', types: ['Grass', 'Poison'], weight: 5 },
  { pokemonId: 102, name: 'Exeggcute', types: ['Grass', 'Psychic'], weight: 3 },

  // Water types
  { pokemonId: 54, name: 'Psyduck', types: ['Water'], weight: 5 },
  { pokemonId: 60, name: 'Poliwag', types: ['Water'], weight: 5 },
  { pokemonId: 129, name: 'Magikarp', types: ['Water'], weight: 8 },
  { pokemonId: 118, name: 'Goldeen', types: ['Water'], weight: 4 },

  // Electric types
  { pokemonId: 25, name: 'Pikachu', types: ['Electric'], weight: 2 },
  { pokemonId: 81, name: 'Magnemite', types: ['Electric', 'Steel'], weight: 3 },
  { pokemonId: 100, name: 'Voltorb', types: ['Electric'], weight: 4 },

  // Rock/Ground types
  { pokemonId: 74, name: 'Geodude', types: ['Rock', 'Ground'], weight: 5 },
  { pokemonId: 27, name: 'Sandshrew', types: ['Ground'], weight: 5 },
  { pokemonId: 50, name: 'Diglett', types: ['Ground'], weight: 4 },

  // Fighting types
  { pokemonId: 66, name: 'Machop', types: ['Fighting'], weight: 4 },
  { pokemonId: 56, name: 'Mankey', types: ['Fighting'], weight: 4 },

  // Psychic types
  { pokemonId: 63, name: 'Abra', types: ['Psychic'], weight: 3 },
  { pokemonId: 96, name: 'Drowzee', types: ['Psychic'], weight: 3 },

  // Ghost types
  { pokemonId: 92, name: 'Gastly', types: ['Ghost', 'Poison'], weight: 3 },

  // Fire types
  { pokemonId: 37, name: 'Vulpix', types: ['Fire'], weight: 3 },
  { pokemonId: 58, name: 'Growlithe', types: ['Fire'], weight: 3 },
  { pokemonId: 77, name: 'Ponyta', types: ['Fire'], weight: 3 },

  // Poison types
  { pokemonId: 23, name: 'Ekans', types: ['Poison'], weight: 5 },
  { pokemonId: 41, name: 'Zubat', types: ['Poison', 'Flying'], weight: 7 },
  { pokemonId: 88, name: 'Grimer', types: ['Poison'], weight: 3 },

  // Ice types
  { pokemonId: 86, name: 'Seel', types: ['Water'], weight: 3 },

  // Fairy types
  { pokemonId: 35, name: 'Clefairy', types: ['Fairy'], weight: 2 },
  { pokemonId: 39, name: 'Jigglypuff', types: ['Normal', 'Fairy'], weight: 3 },
]

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Select a random wild Pokémon based on spawn weights
 * @returns Selected WildPokemonEntry
 */
export function selectWildPokemon(): WildPokemonEntry {
  const totalWeight = WILD_POKEMON_POOL.reduce((sum, p) => sum + p.weight, 0)
  let random = Math.random() * totalWeight

  for (const entry of WILD_POKEMON_POOL) {
    random -= entry.weight
    if (random <= 0) {
      return entry
    }
  }

  // Fallback to first entry (should never happen)
  return WILD_POKEMON_POOL[0]!
}

/**
 * Get all wild Pokémon of a specific type
 * @param type - Pokemon type to filter by
 * @returns Array of matching WildPokemonEntry
 */
export function getWildPokemonByType(type: string): WildPokemonEntry[] {
  return WILD_POKEMON_POOL.filter((p) => p.types.includes(type))
}

/**
 * Get wild Pokémon entry by ID
 * @param pokemonId - PokeAPI Pokemon ID
 * @returns WildPokemonEntry or undefined
 */
export function getWildPokemonById(
  pokemonId: number
): WildPokemonEntry | undefined {
  return WILD_POKEMON_POOL.find((p) => p.pokemonId === pokemonId)
}
