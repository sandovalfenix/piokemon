/**
 * LocalStorage cache manager for type chart data
 * Feature: 002-pokeapi-type-integration
 */

import type { TypeChartCache, CacheValidationResult, TypeEffectivenessMap } from './types'

const CACHE_KEY = 'pokemon-type-chart-v1'
const CACHE_VERSION = '1.0.0'
const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

/**
 * Load type chart cache from localStorage
 * @returns Cache data or null if not found/invalid
 */
export function loadCache(): TypeChartCache | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) {
      return null
    }

    const parsed = JSON.parse(cached) as TypeChartCache
    return parsed
  } catch (error) {
    console.warn('[TypeChartCache] Failed to load cache:', error)
    return null
  }
}

/**
 * Save type chart to localStorage cache
 * @param typeChart - Type effectiveness map to cache
 * @param source - Data source ('api' or 'fallback')
 */
export function saveCache(typeChart: TypeEffectivenessMap, source: 'api' | 'fallback'): void {
  try {
    const now = new Date()
    const expiresAt = new Date(now.getTime() + CACHE_DURATION_MS)

    const cache: TypeChartCache = {
      version: CACHE_VERSION,
      typeChart,
      fetchedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      source,
    }

    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch (error) {
    console.warn('[TypeChartCache] Failed to save cache:', error)
  }
}

/**
 * Validate cache freshness and integrity
 * @param cache - Cache to validate
 * @returns Validation result with reason if invalid
 */
export function isCacheValid(cache: TypeChartCache | null): CacheValidationResult {
  if (!cache) {
    return { isValid: false, reason: 'missing' }
  }

  // Check version
  if (cache.version !== CACHE_VERSION) {
    return { isValid: false, reason: 'version-mismatch', cache }
  }

  // Check expiration
  const now = new Date()
  const expiresAt = new Date(cache.expiresAt)

  if (now > expiresAt) {
    return { isValid: false, reason: 'expired', cache }
  }

  // Check structure
  if (!cache.typeChart || typeof cache.typeChart !== 'object') {
    return { isValid: false, reason: 'corrupted', cache }
  }

  return { isValid: true, cache }
}

/**
 * Clear cache from localStorage
 */
export function clearCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch (error) {
    console.warn('[TypeChartCache] Failed to clear cache:', error)
  }
}
