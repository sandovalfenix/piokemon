/**
 * PokeAPI Move Service
 * Feature: 003-pokemon-team-builder
 * Updated: 005-battle-fixes-status-moves
 *
 * Fetches and transforms Move data from PokeAPI
 * Reuses HTTP client pattern from Feature 002 (typeChart/pokeApiClient.ts)
 *
 * Follows Constitution v1.4.0 - PokeAPI as Single Source of Truth
 */

import type { Move, MoveCategory, PokemonType } from '@/models/teamBuilder'
import type { PokeAPIMoveResponse } from './types'
import { isPokeAPIMoveResponse } from './types'
import { extractMoveEffect, getEffectDescription } from './moveEffectService'
import type { MoveEffect } from '@/models/moveEffect'

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2'
const FETCH_TIMEOUT_MS = 5000

/**
 * Extended Move interface with structured effect data
 * Used internally for battle system integration
 */
export interface MoveWithEffect extends Move {
  /** Structured effect data for battle calculations */
  moveEffect?: MoveEffect | null
}

/**
 * In-memory cache for fetched moves (session-scoped)
 * Task: T058
 */
const moveCache = new Map<number, MoveWithEffect>()

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
 *
 * Updated for Feature 005: Now includes structured effect data from PokeAPI
 * for status moves, stat changes, and ailments.
 */
export function transformPokeAPIToMove(apiResponse: PokeAPIMoveResponse): MoveWithEffect {
  // Extract structured effect data from PokeAPI response
  const moveEffect = extractMoveEffect(apiResponse)

  // Get English effect description
  const effectDescription = getEffectDescription(apiResponse)

  return {
    id: apiResponse.id,
    name: capitalize(apiResponse.name.replace(/-/g, ' ')), // "thunder-shock" → "Thunder shock"
    type: capitalize(apiResponse.type.name) as PokemonType,
    power: apiResponse.power, // Nullable for status moves
    accuracy: apiResponse.accuracy ?? 0, // 0 = always-hit (e.g., Swift)
    category: mapDamageClass(apiResponse.damage_class.name),
    pp: apiResponse.pp,
    effect: effectDescription, // Human-readable description from PokeAPI
    moveEffect, // Structured effect for battle calculations (Feature 005)
  }
}

/**
 * Fetch a single move from PokeAPI with retry logic
 * Task: T058 - Added in-memory caching
 * Updated for Feature 005: Returns MoveWithEffect including structured effect data
 * @param id - Move ID
 * @param retryCount - Number of retry attempts remaining
 * @returns Transformed MoveWithEffect or null if failed
 */
export async function fetchMove(
  id: number,
  retryCount: number = 0
): Promise<MoveWithEffect | null> {
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
 * Updated for Feature 005: Returns MoveWithEffect including structured effect data
 * @param ids - Array of Move IDs to fetch
 * @returns Array of successfully fetched MoveWithEffect (may be incomplete)
 */
export async function fetchMovesBatch(ids: number[]): Promise<MoveWithEffect[]> {
  const results = await Promise.allSettled(ids.map((id) => fetchMove(id)))

  const successfulMoves: MoveWithEffect[] = []

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value !== null) {
      successfulMoves.push(result.value)
    }
  }

  console.log(`[PokeAPI] Fetched ${successfulMoves.length}/${ids.length} moves`)

  return successfulMoves
}

/**
 * Fetch a move by name from PokeAPI
 * Useful when you have the move name but not the ID
 * @param name - Move name (can be display name or slug format)
 * @param retryCount - Number of retry attempts remaining
 * @returns Transformed MoveWithEffect or null if failed
 */
export async function fetchMoveByName(
  name: string,
  retryCount: number = 0
): Promise<MoveWithEffect | null> {
  // Convert to slug format (lowercase, hyphenated)
  const slug = name.toLowerCase().replace(/\s+/g, '-')

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(`${POKEAPI_BASE_URL}/move/${slug}`, {
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    // Handle rate limiting with exponential backoff
    if (response.status === 429 && retryCount < 3) {
      const backoffMs = Math.pow(2, retryCount) * 1000
      console.warn(
        `[PokeAPI] Rate limited fetching Move "${name}", retrying in ${backoffMs}ms (attempt ${retryCount + 1}/3)`
      )
      await new Promise((resolve) => setTimeout(resolve, backoffMs))
      return fetchMoveByName(name, retryCount + 1)
    }

    if (!response.ok) {
      console.warn(`[PokeAPI] Failed to fetch Move "${name}": ${response.status}`)
      return null
    }

    const data = await response.json()

    if (!isPokeAPIMoveResponse(data)) {
      console.warn(`[PokeAPI] Invalid Move response for "${name}"`)
      return null
    }

    const move = transformPokeAPIToMove(data)

    // Cache by ID
    moveCache.set(move.id, move)

    return move
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.warn(`[PokeAPI] Timeout fetching Move "${name}" after ${FETCH_TIMEOUT_MS}ms`)
      } else {
        console.warn(`[PokeAPI] Error fetching Move "${name}":`, error.message)
      }
    }

    return null
  }
}
