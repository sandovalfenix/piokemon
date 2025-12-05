/**
 * Type Chart Service - Orchestrates fetch/cache/transform/fallback
 * Feature: 002-pokeapi-type-integration
 */

import type { FetchTypeChartResult, TypeEffectivenessMap } from './types'
import { fetchAllTypes } from './pokeApiClient'
import { loadCache, saveCache, isCacheValid, isValidTypeChart } from './typeChartCache'
import { transformPokeAPIToTypeChart } from './typeChartTransformer'
import { TYPE_CHART } from '@/data/typeChart'
import { POKEMON_TYPES } from './types'

/**
 * Validate that a Pokemon type exists in the loaded type chart
 * @param typeName - Pokemon type to validate (lowercase)
 * @param typeChart - Type chart to check against
 * @returns True if type exists in chart
 */
export function validatePokemonType(
  typeName: string,
  typeChart: TypeEffectivenessMap
): boolean {
  const capitalizedType = typeName.charAt(0).toUpperCase() + typeName.slice(1)
  return capitalizedType in typeChart
}

/**
 * Load type chart with automatic fallback chain:
 * 1. Try loading from valid cache
 * 2. Try fetching fresh data from PokeAPI
 * 3. Fall back to hardcoded TYPE_CHART
 *
 * @returns Result containing type chart data and source indicator
 */
export async function loadTypeChart(): Promise<FetchTypeChartResult> {
  // Try loading from cache first
  const cached = loadCache()
  const validation = isCacheValid(cached)

  if (validation.isValid && validation.cache) {
    console.log('[TypeChartService] Type chart loaded from: cache')
    return {
      success: true,
      data: validation.cache.typeChart,
      source: 'cache',
    }
  }

  if (validation.reason) {
    console.log(`[TypeChartService] Cache ${validation.reason}, fetching from API...`)
  }

  // Try fetching from PokeAPI
  try {
    const types = await fetchAllTypes()

    // Verify we got all 18 types (all-or-nothing strategy)
    if (types.length === POKEMON_TYPES.length) {
      const typeChart = transformPokeAPIToTypeChart(types)

      // Validate type chart completeness
      if (!isValidTypeChart(typeChart)) {
        console.warn('[TypeChartService] Incomplete type chart from API, using fallback')
      } else {
        // Save to cache
        saveCache(typeChart, 'api')

        console.log('[TypeChartService] Type chart loaded from: api')
        return {
          success: true,
          data: typeChart,
          source: 'api',
        }
      }
    } else {
      console.warn(
        `[TypeChartService] Incomplete data from PokeAPI (${types.length}/${POKEMON_TYPES.length} types), using fallback`
      )
    }
  } catch (error) {
    console.warn('[TypeChartService] Error fetching from PokeAPI:', error)
  }  // Fall back to hardcoded TYPE_CHART
  console.log('[TypeChartService] Type chart loaded from: fallback')
  return {
    success: true,
    data: TYPE_CHART,
    source: 'fallback',
  }
}

/**
 * Force refresh type chart from PokeAPI, bypassing cache
 * @returns Result containing fresh type chart data
 */
export async function refreshTypeChart(): Promise<FetchTypeChartResult> {
  console.log('[TypeChartService] Forcing refresh from PokeAPI...')

  try {
    const types = await fetchAllTypes()

    if (types.length === POKEMON_TYPES.length) {
      const typeChart = transformPokeAPIToTypeChart(types)
      saveCache(typeChart, 'api')

      return {
        success: true,
        data: typeChart,
        source: 'api',
      }
    } else {
      return {
        success: false,
        data: TYPE_CHART,
        source: 'fallback',
        error: `Incomplete data: ${types.length}/${POKEMON_TYPES.length} types`,
      }
    }
  } catch (error) {
    return {
      success: false,
      data: TYPE_CHART,
      source: 'fallback',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
