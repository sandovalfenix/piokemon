/**
 * Transform PokeAPI type responses to TYPE_CHART format
 * Feature: 002-pokeapi-type-integration
 */

import type { PokeAPITypeResponse, TypeEffectivenessMap, PokemonType } from './types'

/**
 * Capitalize first letter of type name to match TYPE_CHART format
 * @param type - Lowercase type name from PokeAPI
 * @returns Capitalized type name (e.g., "fire" → "Fire")
 */
function capitalizeType(type: PokemonType): string {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

/**
 * Transform array of PokeAPI type responses into TYPE_CHART format
 * @param responses - Array of PokeAPI type responses
 * @returns Type effectiveness map matching existing TYPE_CHART structure
 */
export function transformPokeAPIToTypeChart(
  responses: PokeAPITypeResponse[]
): TypeEffectivenessMap {
  const typeChart: TypeEffectivenessMap = {}

  for (const response of responses) {
    const attackingType = capitalizeType(response.name)
    typeChart[attackingType] = {}

    // Map double damage (2x effectiveness)
    for (const target of response.damage_relations.double_damage_to) {
      const defendingType = capitalizeType(target.name)
      typeChart[attackingType][defendingType] = 2
    }

    // Map half damage (0.5x effectiveness)
    for (const target of response.damage_relations.half_damage_to) {
      const defendingType = capitalizeType(target.name)
      typeChart[attackingType][defendingType] = 0.5
    }

    // Map no damage (0x effectiveness - immune)
    for (const target of response.damage_relations.no_damage_to) {
      const defendingType = capitalizeType(target.name)
      typeChart[attackingType][defendingType] = 0
    }

    // Note: Implicit 1x effectiveness for unlisted matchups handled by computeTypeMultiplier
  }

  return typeChart
}

/**
 * Runtime type guard for PokeAPI response validation
 * @param data - Unknown data to validate
 * @returns True if data matches PokeAPITypeResponse structure
 */
export function isPokeAPITypeResponse(data: unknown): data is PokeAPITypeResponse {
  if (typeof data !== 'object' || data === null) return false

  const obj = data as Record<string, unknown>

  return (
    typeof obj.id === 'number' &&
    typeof obj.name === 'string' &&
    typeof obj.damage_relations === 'object' &&
    obj.damage_relations !== null &&
    Array.isArray((obj.damage_relations as any).double_damage_to) &&
    Array.isArray((obj.damage_relations as any).half_damage_to) &&
    Array.isArray((obj.damage_relations as any).no_damage_to)
  )
}
