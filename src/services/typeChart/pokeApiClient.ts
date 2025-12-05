/**
 * PokeAPI HTTP client for fetching type data
 * Feature: 002-pokeapi-type-integration
 */

import type { PokeAPITypeResponse, PokemonType } from './types'
import { POKEMON_TYPES } from './types'

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2'
const FETCH_TIMEOUT_MS = 5000

/**
 * Fetch a single type from PokeAPI with retry logic
 * @param typeName - Pokemon type to fetch (e.g., "fire", "water")
 * @param retryCount - Number of retry attempts remaining
 * @returns PokeAPI type response or null if failed
 */
export async function fetchType(
  typeName: PokemonType,
  retryCount: number = 0
): Promise<PokeAPITypeResponse | null> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(`${POKEAPI_BASE_URL}/type/${typeName}`, {
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    // Handle rate limiting with exponential backoff
    if (response.status === 429 && retryCount < 3) {
      const backoffMs = Math.pow(2, retryCount) * 1000 // 1s, 2s, 4s
      console.warn(
        `[PokeAPI] Rate limited fetching "${typeName}", retrying in ${backoffMs}ms (attempt ${retryCount + 1}/3)`
      )
      await new Promise((resolve) => setTimeout(resolve, backoffMs))
      return fetchType(typeName, retryCount + 1)
    }

    if (!response.ok) {
      console.warn(`[PokeAPI] Failed to fetch type "${typeName}": ${response.status}`)
      return null
    }

    const data = await response.json()
    return data as PokeAPITypeResponse
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.warn(`[PokeAPI] Timeout fetching type "${typeName}" after ${FETCH_TIMEOUT_MS}ms`)
      } else {
        console.warn(`[PokeAPI] Error fetching type "${typeName}":`, error.message)
      }
    }

    return null
  }
}

/**
 * Fetch all 18 Pokemon types from PokeAPI in parallel
 * Uses Promise.allSettled() to allow partial success
 * @returns Array of successfully fetched type responses (may be incomplete)
 */
export async function fetchAllTypes(): Promise<PokeAPITypeResponse[]> {
  const results = await Promise.allSettled(
    POKEMON_TYPES.map((typeName) => fetchType(typeName))
  )

  const successfulTypes: PokeAPITypeResponse[] = []

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value !== null) {
      successfulTypes.push(result.value)
    }
  }

  console.log(`[PokeAPI] Fetched ${successfulTypes.length}/${POKEMON_TYPES.length} types`)

  return successfulTypes
}
