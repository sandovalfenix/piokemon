/**
 * PokeAPI Pokemon Service
 * Feature: 003-pokemon-team-builder
 *
 * Fetches and transforms Pokemon data from PokeAPI
 * Reuses HTTP client pattern from Feature 002 (typeChart/pokeApiClient.ts)
 */

import type { Pokemon, PokemonStats, MoveReference, PokemonType } from '@/models/teamBuilder'
import type {
  PokeAPIResponse,
  PokeAPIPokemonListResponse,
  PokeAPIStat,
} from './types'
import { isPokeAPIResponse, extractIdFromUrl } from './types'

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2'
const FETCH_TIMEOUT_MS = 5000

/**
 * In-memory cache for fetched Pokemon (session-scoped)
 * Task: T057
 */
const pokemonCache = new Map<number, Pokemon>()

/**
 * Capitalize first letter of string
 * Example: "pikachu" → "Pikachu", "mr-mime" → "Mr-mime"
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Find stat value by name from PokeAPI stats array
 */
function findStat(stats: PokeAPIStat[], statName: string): number {
  const stat = stats.find((s) => s.stat.name === statName)
  return stat?.base_stat ?? 0
}

/**
 * Transform PokeAPI Pokemon response to internal Pokemon format
 * Per data-model.md transformation mapping
 */
export function transformPokeAPIToPokemon(apiResponse: PokeAPIResponse): Pokemon {
  // Transform stats array to object
  const stats: PokemonStats = {
    hp: findStat(apiResponse.stats, 'hp'),
    attack: findStat(apiResponse.stats, 'attack'),
    defense: findStat(apiResponse.stats, 'defense'),
    spAttack: findStat(apiResponse.stats, 'special-attack'),
    spDefense: findStat(apiResponse.stats, 'special-defense'),
    speed: findStat(apiResponse.stats, 'speed'),
  }

  // Transform types array - extract type names and capitalize
  const types: PokemonType[] = apiResponse.types
    .sort((a, b) => a.slot - b.slot) // Sort by slot (1, 2)
    .map((t) => capitalize(t.type.name) as PokemonType)

  // Transform moves array - extract id from URL and capitalize name
  const moves: MoveReference[] = apiResponse.moves.map((m) => ({
    id: extractIdFromUrl(m.move.url),
    name: capitalize(m.move.name.replace(/-/g, ' ')), // "thunder-shock" → "Thunder shock"
  }))

  return {
    id: apiResponse.id,
    name: capitalize(apiResponse.name.replace(/-/g, ' ')), // "mr-mime" → "Mr mime"
    types,
    stats,
    sprite: apiResponse.sprites.front_default ?? '', // Use empty string if sprite missing
    moves,
  }
}

/**
 * Fetch a single Pokemon from PokeAPI with retry logic
 * Task: T057 - Added in-memory caching
 * @param id - Pokemon ID (1-1000+)
 * @param retryCount - Number of retry attempts remaining
 * @returns Transformed Pokemon or null if failed
 */
export async function fetchPokemon(
  id: number,
  retryCount: number = 0
): Promise<Pokemon | null> {
  // Check cache first
  if (pokemonCache.has(id)) {
    console.log(`[PokeAPI] Using cached Pokemon ${id}`)
    return pokemonCache.get(id)!
  }


  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${id}`, {
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    // Handle rate limiting with exponential backoff
    if (response.status === 429 && retryCount < 3) {
      const backoffMs = Math.pow(2, retryCount) * 1000 // 1s, 2s, 4s
      console.warn(
        `[PokeAPI] Rate limited fetching Pokemon ${id}, retrying in ${backoffMs}ms (attempt ${retryCount + 1}/3)`
      )
      await new Promise((resolve) => setTimeout(resolve, backoffMs))
      return fetchPokemon(id, retryCount + 1)
    }

    if (!response.ok) {
      console.warn(`[PokeAPI] Failed to fetch Pokemon ${id}: ${response.status}`)
      return null
    }

    const data = await response.json()

    // Validate response with runtime type guard
    if (!isPokeAPIResponse(data)) {
      console.warn(`[PokeAPI] Invalid Pokemon response for ID ${id}`)
      return null
    }

    const pokemon = transformPokeAPIToPokemon(data)

    // Cache the result
    pokemonCache.set(id, pokemon)

    return pokemon
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.warn(`[PokeAPI] Timeout fetching Pokemon ${id} after ${FETCH_TIMEOUT_MS}ms`)
      } else {
        console.warn(`[PokeAPI] Error fetching Pokemon ${id}:`, error.message)
      }
    }

    return null
  }
}

/**
 * Fetch paginated Pokemon list from PokeAPI
 * @param limit - Number of Pokemon to fetch (default 20)
 * @param offset - Offset for pagination (default 0)
 * @returns Pokemon list response with count and results
 * @throws Error if request fails or times out
 */
export async function fetchPokemonList(
  limit: number = 20,
  offset: number = 0
): Promise<PokeAPIPokemonListResponse> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(
      `${POKEAPI_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`,
      { signal: controller.signal }
    )

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Failed to fetch Pokemon list: ${response.status}`)
    }

    const data = await response.json()
    return data as PokeAPIPokemonListResponse
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(`Timeout fetching Pokemon list after ${FETCH_TIMEOUT_MS}ms`)
      } else {
        throw error
      }
    }

    throw new Error('Unknown error fetching Pokemon list')
  }
}

/**
 * Fetch multiple Pokemon by IDs in parallel
 * Uses Promise.allSettled() to allow partial success
 * @param ids - Array of Pokemon IDs to fetch
 * @returns Array of successfully fetched Pokemon (may be incomplete)
 */
export async function fetchPokemonBatch(ids: number[]): Promise<Pokemon[]> {
  const results = await Promise.allSettled(ids.map((id) => fetchPokemon(id)))

  const successfulPokemon: Pokemon[] = []

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value !== null) {
      successfulPokemon.push(result.value)
    }
  }

  console.log(`[PokeAPI] Fetched ${successfulPokemon.length}/${ids.length} Pokemon`)

  return successfulPokemon
}

/**
 * Transform TeamMember to Battle Pokemon format
 * Feature: 003-pokemon-team-builder
 * User Story 4: Start Battle with Custom Team
 *
 * Maps internal TeamMember format → battle engine Pokemon format
 * Uses Gen III+ stat formula with IVs=0, EVs=0 per spec (no IV/EV system)
 *
 * HP Formula: floor((2 * base + IV) * level / 100) + level + 10
 * Other Stats: floor((2 * base + IV) * level / 100) + 5
 *
 * @param teamMember - TeamMember from team builder
 * @returns Pokemon in battle engine format
 */
export function transformTeamMemberToBattlePokemon(
  teamMember: import('@/models/teamBuilder').TeamMember
): import('@/domain/battle/engine/entities').Pokemon {
  const { pokemon, selectedMoves, level } = teamMember

  // IVs and EVs are 0 per spec (no IV/EV system)
  const iv = 0
  const ev = 0

  // Calculate stats using Gen III+ formula
  // HP = floor((2 * base + IV + floor(EV/4)) * level / 100) + level + 10
  const maxHp = Math.floor(((2 * pokemon.stats.hp + iv + Math.floor(ev / 4)) * level) / 100) + level + 10

  // Other stats = floor((2 * base + IV + floor(EV/4)) * level / 100) + 5
  const calcStat = (base: number) =>
    Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5

  // Filter out status moves - only Physical and Special are allowed in battle
  // Per Feature 006 spec: status moves are excluded from battle
  const damagingMoves = selectedMoves.filter((move) => {
    const category = move.category.toLowerCase()
    return category === 'physical' || category === 'special'
  })

  // Map team builder Move → battle Move
  const battleMoves: import('@/domain/battle/engine/entities').Move[] = damagingMoves.map(
    (move) => ({
      id: move.id.toString(),
      name: move.name,
      type: move.type as import('@/domain/battle/engine/entities').Type,
      power: move.power ?? 40, // Fallback power if null
      accuracy: move.accuracy ?? 100,
      category: move.category.toLowerCase() as 'physical' | 'special',
    })
  )

  // Fallback: if no damaging moves, add Tackle
  if (battleMoves.length === 0) {
    battleMoves.push({
      id: 'tackle',
      name: 'Tackle',
      type: 'Normal',
      power: 40,
      accuracy: 100,
      category: 'physical',
    })
  }

  // Map team builder Pokemon → battle Pokemon with calculated stats
  return {
    id: pokemon.id.toString(),
    name: pokemon.name,
    types: pokemon.types as import('@/domain/battle/engine/entities').Type[],
    level,
    stats: {
      hp: maxHp,
      atk: calcStat(pokemon.stats.attack),
      def: calcStat(pokemon.stats.defense),
      spAtk: calcStat(pokemon.stats.spAttack),
      spDef: calcStat(pokemon.stats.spDefense),
      speed: calcStat(pokemon.stats.speed),
    },
    currentHp: maxHp,
    moves: battleMoves,
  }
}
