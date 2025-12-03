/**
 * Starter Pokemon Service
 * Feature: Starter Selection Screen
 *
 * Fetches the Gen 1 starter Pokemon data from PokeAPI
 */

import { fetchPokemon } from './pokemonService'
import type { Pokemon } from '@/models/teamBuilder'

/**
 * Gen 1 Starter Pokemon IDs from PokeAPI
 * Bulbasaur: 1, Charmander: 4, Squirtle: 7
 */
export const GEN1_STARTERS = {
  bulbasaur: 1,
  charmander: 4,
  squirtle: 7,
  pikachu: 25
} as const

export type StarterName = keyof typeof GEN1_STARTERS

/**
 * Starter Pokemon display info
 */
export interface StarterInfo {
  id: number
  name: string
  description: string
  color: string
  gradientFrom: string
  gradientTo: string
}

/**
 * Static starter info for UI display
 */
export const STARTER_INFO: Record<StarterName, StarterInfo> = {
  bulbasaur: {
    id: 1,
    name: 'Bulbasaur',
    description: 'A strange seed was planted on its back at birth. The plant sprouts and grows with this Pokémon.',
    color: 'grass',
    gradientFrom: 'from-green-400',
    gradientTo: 'to-green-600',
  },
  charmander: {
    id: 4,
    name: 'Charmander',
    description: 'Obviously prefers hot places. When it rains, steam is said to spout from the tip of its tail.',
    color: 'fire',
    gradientFrom: 'from-orange-400',
    gradientTo: 'to-red-500',
  },
  squirtle: {
    id: 7,
    name: 'Squirtle',
    description: 'After birth, its back swells and hardens into a shell. It powerfully sprays foam from its mouth.',
    color: 'water',
    gradientFrom: 'from-blue-400',
    gradientTo: 'to-blue-600',
  },
  pikachu: {
    id: 25,
    name: 'Pikachu',
    description: 'When several of these Pokémon gather, their electricity could build and cause lightning storms.',
    color: 'electric',
    gradientFrom: 'from-yellow-400',
    gradientTo: 'to-yellow-600',
  },
}

/**
 * Fetch all Gen 1 starter Pokemon from PokeAPI
 * @returns Array of starter Pokemon or empty array on error
 */
export async function fetchStarterPokemon(): Promise<Pokemon[]> {
  const starterIds = Object.values(GEN1_STARTERS)

  const results = await Promise.all(
    starterIds.map(id => fetchPokemon(id))
  )

  // Filter out failed fetches
  return results.filter((pokemon): pokemon is Pokemon => pokemon !== null)
}

/**
 * Get starter info by Pokemon ID
 */
export function getStarterInfo(id: number): StarterInfo | null {
  const entry = Object.entries(STARTER_INFO).find(([, info]) => info.id === id)
  return entry ? entry[1] : null
}
