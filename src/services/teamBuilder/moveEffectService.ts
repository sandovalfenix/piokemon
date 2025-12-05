/**
 * Move Effect Service
 * Feature: 005-battle-fixes-status-moves
 *
 * Parses move effects from PokeAPI responses and transforms them
 * to internal MoveEffect interface for battle system integration.
 *
 * Follows Constitution v1.4.0 - PokeAPI as Single Source of Truth
 */

import type { MoveEffect, MoveEffectType, EffectTarget, AffectedStat } from '@/models/moveEffect'
import type { StatusCondition } from '@/models/statusCondition'
import type { PokeAPIMoveResponse } from './types'

/**
 * Map PokeAPI stat names to internal AffectedStat type
 */
const STAT_NAME_MAP: Record<string, AffectedStat> = {
  attack: 'atk',
  defense: 'def',
  'special-attack': 'spAtk',
  'special-defense': 'spDef',
  speed: 'speed',
  accuracy: 'accuracy',
  evasion: 'evasion',
}

/**
 * Map PokeAPI ailment names to internal StatusCondition type
 */
const AILMENT_NAME_MAP: Record<string, StatusCondition> = {
  paralysis: 'paralysis',
  sleep: 'sleep',
  poison: 'poison',
  burn: 'burn',
  freeze: 'freeze',
  // Note: "badly-poisoned" is toxic in games, PokeAPI uses "poison" for both
}

/**
 * Determine the target of a move effect based on PokeAPI target field
 * @param targetName - PokeAPI move target name
 * @param statChange - The stat change value (positive = self buff, negative = opponent debuff typically)
 * @returns Effect target ('self' or 'opponent')
 */
function determineEffectTarget(targetName: string | undefined, statChange?: number): EffectTarget {
  // Status moves targeting "user" or self-buffing stat moves
  if (targetName === 'user') {
    return 'self'
  }

  // Positive stat changes without explicit target usually buff self
  if (statChange !== undefined && statChange > 0 && !targetName) {
    return 'self'
  }

  // All opponent-targeting categories
  const opponentTargets = [
    'selected-pokemon',
    'all-opponents',
    'all-other-pokemon',
    'specific-move',
    'random-opponent',
  ]

  if (targetName && opponentTargets.includes(targetName)) {
    return 'opponent'
  }

  // Default to opponent for debuffs, self for buffs
  return statChange && statChange < 0 ? 'opponent' : 'self'
}

/**
 * Parse a stat change from PokeAPI to MoveEffect
 * @param statChange - PokeAPI stat change object
 * @param targetName - Move target from PokeAPI
 * @param chance - Chance of effect occurring (0-100)
 * @returns MoveEffect for stat change
 */
function parseStatChange(
  statChange: { change: number; stat: { name: string } },
  targetName?: string,
  chance: number = 100
): MoveEffect | null {
  const stat = STAT_NAME_MAP[statChange.stat.name]
  if (!stat) {
    console.warn(`[MoveEffectService] Unknown stat: ${statChange.stat.name}`)
    return null
  }

  return {
    type: 'stat-change',
    target: determineEffectTarget(targetName, statChange.change),
    stat,
    stages: statChange.change,
    chance,
  }
}

/**
 * Parse a status ailment from PokeAPI to MoveEffect
 * @param ailmentName - PokeAPI ailment name
 * @param chance - Chance of effect occurring (0-100)
 * @param targetName - Move target from PokeAPI
 * @returns MoveEffect for status condition
 */
function parseStatusAilment(
  ailmentName: string,
  chance: number,
  targetName?: string
): MoveEffect | null {
  // Skip "none" ailment
  if (ailmentName === 'none') {
    return null
  }

  const condition = AILMENT_NAME_MAP[ailmentName]
  if (!condition) {
    console.warn(`[MoveEffectService] Unknown ailment: ${ailmentName}`)
    return null
  }

  return {
    type: 'status-condition',
    target: determineEffectTarget(targetName),
    condition,
    chance,
  }
}

/**
 * Extract move effect from PokeAPI response
 *
 * Parses stat_changes and meta.ailment from the API response
 * and transforms them to internal MoveEffect format.
 *
 * @param apiResponse - Full PokeAPI move response
 * @returns MoveEffect or null if no effect found
 *
 * @example
 * // Growl (stat lowering move)
 * const effect = extractMoveEffect(growlResponse)
 * // Returns: { type: 'stat-change', target: 'opponent', stat: 'atk', stages: -1, chance: 100 }
 *
 * @example
 * // Thunder Wave (status move)
 * const effect = extractMoveEffect(thunderWaveResponse)
 * // Returns: { type: 'status-condition', target: 'opponent', condition: 'paralysis', chance: 100 }
 */
export function extractMoveEffect(apiResponse: PokeAPIMoveResponse): MoveEffect | null {
  const targetName = apiResponse.target?.name

  // Priority 1: Check for stat changes (most common for status moves)
  if (apiResponse.stat_changes && apiResponse.stat_changes.length > 0) {
    // Use stat_chance from meta, or 100% for pure status moves
    const chance = apiResponse.meta?.stat_chance ?? 100

    // Take the first stat change (most moves only have one)
    // For multi-stat moves like Dragon Dance, we'd need to extend this
    const firstStatChange = apiResponse.stat_changes[0]
    if (firstStatChange) {
      return parseStatChange(firstStatChange, targetName, chance)
    }
  }

  // Priority 2: Check for status ailments
  if (apiResponse.meta?.ailment && apiResponse.meta.ailment.name !== 'none') {
    // Use ailment_chance, or effect_chance for moves like Thunderbolt
    const chance = apiResponse.meta.ailment_chance ?? apiResponse.effect_chance ?? 100
    return parseStatusAilment(apiResponse.meta.ailment.name, chance, targetName)
  }

  // No effect found
  return null
}

/**
 * Check if a move has any battle effect worth tracking
 * @param apiResponse - PokeAPI move response
 * @returns true if move has stat changes or status effects
 */
export function hasMoveEffect(apiResponse: PokeAPIMoveResponse): boolean {
  // Has stat changes
  if (apiResponse.stat_changes && apiResponse.stat_changes.length > 0) {
    return true
  }

  // Has status ailment
  if (apiResponse.meta?.ailment && apiResponse.meta.ailment.name !== 'none') {
    return true
  }

  return false
}

/**
 * Get the English short effect description from PokeAPI response
 * @param apiResponse - PokeAPI move response
 * @returns English short effect string or empty string
 */
export function getEffectDescription(apiResponse: PokeAPIMoveResponse): string {
  const englishEntry = apiResponse.effect_entries?.find(
    (entry) => entry.language.name === 'en'
  )
  return englishEntry?.short_effect ?? ''
}

/**
 * Create a battle-ready move object with effect data from PokeAPI
 * This combines the basic move transformation with effect parsing
 *
 * @param apiResponse - Full PokeAPI move response
 * @returns Object containing move data and parsed effect
 */
export function createMoveWithEffect(apiResponse: PokeAPIMoveResponse): {
  id: number
  name: string
  effect: MoveEffect | null
  effectDescription: string
} {
  return {
    id: apiResponse.id,
    name: apiResponse.name,
    effect: extractMoveEffect(apiResponse),
    effectDescription: getEffectDescription(apiResponse),
  }
}
