/**
 * Pokemon Name Normalizer
 * Feature: 004-modern-battle-ui
 *
 * Normalize Pokemon names for PokemonShowdown sprite URLs
 */

import type { NormalizePokemonNameFn } from '@/types/pokemonshowdown-sprite'

/**
 * Normalize Pokemon name for URL usage
 *
 * Rules:
 * - Convert to lowercase
 * - Replace spaces with hyphens
 * - Remove apostrophes
 * - Remove colons
 * - Handle gender symbols: ♀ → -f, ♂ → -m
 * - Collapse multiple hyphens to single hyphen
 * - Trim leading/trailing hyphens
 *
 * @param name - Original Pokemon name
 * @returns Normalized name (lowercase, hyphens, no special chars)
 * @throws {TypeError} If name is empty or not a string
 *
 * @example
 * ```typescript
 * normalizePokemonName('Pikachu') // => 'pikachu'
 * normalizePokemonName("Farfetch'd") // => 'farfetchd'
 * normalizePokemonName('Mr. Mime') // => 'mr-mime'
 * normalizePokemonName('Type: Null') // => 'typenull'
 * normalizePokemonName('Nidoran♀') // => 'nidoran-f'
 * ```
 */
export const normalizePokemonName: NormalizePokemonNameFn = (name: string): string => {
  if (typeof name !== 'string' || name.trim().length === 0) {
    throw new TypeError('Pokemon name must be a non-empty string')
  }

  return name
    .toLowerCase()                      // Convert to lowercase
    .replace(/\s+/g, '-')               // Replace spaces with hyphens
    .replace(/'/g, '')                  // Remove apostrophes
    .replace(/:/g, '')                  // Remove colons
    .replace(/♀/g, '-f')                // Handle female symbol
    .replace(/♂/g, '-m')                // Handle male symbol
    .replace(/\./g, '-')                // Replace periods with hyphens (Mr. Mime)
    .replace(/-+/g, '-')                // Collapse multiple hyphens
    .replace(/^-+|-+$/g, '')            // Trim leading/trailing hyphens
}
