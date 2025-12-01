/**
 * PokeAPI Move Service
 * Feature: 003-pokemon-team-builder
 *
 * Fetches and transforms Move data from PokeAPI
 * Reuses HTTP client pattern from Feature 002 (typeChart/pokeApiClient.ts)
 */

import type { Move, MoveCategory, PokemonType } from '@/models/teamBuilder'
import type { PokeAPIMoveResponse } from './types'
import { isPokeAPIMoveResponse } from './types'

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2'
const FETCH_TIMEOUT_MS = 5000

/**
 * In-memory cache for fetched moves (session-scoped)
 * Task: T058
 */
const moveCache = new Map<number, Move>()

/**
 * Capitalize first letter of string
 * Example: "thunderbolt" → "Thunderbolt"
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Map PokeAPI damage class to internal MoveCategory
 * "physical" → "Physical", "special" → "Special", "status" → "Status"
 */
function mapDamageClass(damageClass: string): MoveCategory {
  const map: Record<string, MoveCategory> = {
    physical: 'Physical',
    special: 'Special',
    status: 'Status',
  }
  return map[damageClass] ?? 'Status'
}

/**
 * Transform PokeAPI Move response to internal Move format
 * Per data-model.md transformation mapping
 */
export function transformPokeAPIToMove(apiResponse: PokeAPIMoveResponse): Move {
  // Find English effect description
  const englishEffect = apiResponse.effect_entries?.find(
    (entry) => entry.language.name === 'en'
  )

  return {
    id: apiResponse.id,
    name: capitalize(apiResponse.name.replace(/-/g, ' ')), // "thunder-shock" → "Thunder shock"
    type: capitalize(apiResponse.type.name) as PokemonType,
    power: apiResponse.power, // Nullable for status moves
    accuracy: apiResponse.accuracy ?? 0, // 0 = always-hit (e.g., Swift)
    category: mapDamageClass(apiResponse.damage_class.name),
    pp: apiResponse.pp,
    effect: englishEffect?.short_effect ?? '', // Optional description
  }
}

/**
 * Fetch a single move from PokeAPI with retry logic
 * Task: T058 - Added in-memory caching
 * @param id - Move ID
 * @param retryCount - Number of retry attempts remaining
 * @returns Transformed Move or null if failed
 */
export async function fetchMove(
  id: number,
  retryCount: number = 0
): Promise<Move | null> {
  // Check cache first
  if (moveCache.has(id)) {
    console.log(`[PokeAPI] Using cached Move ${id}`)
    return moveCache.get(id)!
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(`${POKEAPI_BASE_URL}/move/${id}`, {
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    // Handle rate limiting with exponential backoff
    if (response.status === 429 && retryCount < 3) {
      const backoffMs = Math.pow(2, retryCount) * 1000 // 1s, 2s, 4s
      console.warn(
        `[PokeAPI] Rate limited fetching Move ${id}, retrying in ${backoffMs}ms (attempt ${retryCount + 1}/3)`
      )
      await new Promise((resolve) => setTimeout(resolve, backoffMs))
      return fetchMove(id, retryCount + 1)
    }

    if (!response.ok) {
      console.warn(`[PokeAPI] Failed to fetch Move ${id}: ${response.status}`)
      return null
    }

    const data = await response.json()

    // Validate response with runtime type guard
    if (!isPokeAPIMoveResponse(data)) {
      console.warn(`[PokeAPI] Invalid Move response for ID ${id}`)
      return null
    }

    const move = transformPokeAPIToMove(data)

    // Cache the result
    moveCache.set(id, move)

    return move
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.warn(`[PokeAPI] Timeout fetching Move ${id} after ${FETCH_TIMEOUT_MS}ms`)
      } else {
        console.warn(`[PokeAPI] Error fetching Move ${id}:`, error.message)
      }
    }

    return null
  }
}

/**
 * Fetch multiple moves by IDs in parallel
 * Uses Promise.allSettled() to allow partial success
 * @param ids - Array of Move IDs to fetch
 * @returns Array of successfully fetched Moves (may be incomplete)
 */
export async function fetchMovesBatch(ids: number[]): Promise<Move[]> {
  const results = await Promise.allSettled(ids.map((id) => fetchMove(id)))

  const successfulMoves: Move[] = []

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value !== null) {
      successfulMoves.push(result.value)
    }
  }

  console.log(`[PokeAPI] Fetched ${successfulMoves.length}/${ids.length} moves`)

  return successfulMoves
}
