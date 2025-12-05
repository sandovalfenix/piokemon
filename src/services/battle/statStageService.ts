/**
 * Stat Stage Service
 * Feature: 005-battle-fixes-status-moves
 *
 * Service for managing Pokemon stat stage modifications in battle
 */

import type { Pokemon } from '@/domain/battle/engine/entities'
import type { AffectedStat } from '@/models/moveEffect'
import {
  type StatStages,
  DEFAULT_STAT_STAGES,
  getStageMultiplier,
  applyStageChange,
} from '@/models/statStages'

/**
 * Map from AffectedStat to StatStages key
 */
const STAT_KEY_MAP: Record<AffectedStat, keyof StatStages> = {
  atk: 'atk',
  def: 'def',
  spAtk: 'spAtk',
  spDef: 'spDef',
  speed: 'speed',
  accuracy: 'accuracy',
  evasion: 'evasion',
}

/**
 * Stat display names for battle log messages
 */
const STAT_NAMES: Record<AffectedStat, string> = {
  atk: 'Ataque',
  def: 'Defensa',
  spAtk: 'Ataque Especial',
  spDef: 'Defensa Especial',
  speed: 'Velocidad',
  accuracy: 'Precisión',
  evasion: 'Evasión',
}

/**
 * Result of applying a stat change
 */
export interface StatChangeResult {
  success: boolean
  message: string
  newStage: number
}

/**
 * Ensure Pokemon has statStages initialized
 */
function ensureStatStages(pokemon: Pokemon & { statStages?: StatStages }): StatStages {
  if (!pokemon.statStages) {
    pokemon.statStages = { ...DEFAULT_STAT_STAGES }
  }
  return pokemon.statStages
}

/**
 * Apply a stat stage change to a Pokemon
 * @param pokemon - Pokemon to modify (will be mutated)
 * @param stat - Which stat to change
 * @param stages - Number of stages to change (positive or negative)
 * @returns Result with success status and battle log message
 */
export function applyStatChange(
  pokemon: Pokemon & { statStages?: StatStages },
  stat: AffectedStat,
  stages: number
): StatChangeResult {
  const statStages = ensureStatStages(pokemon)
  const statKey = STAT_KEY_MAP[stat]
  const currentStage = statStages[statKey]

  // Check if already at max/min
  if (stages > 0 && currentStage >= 6) {
    return {
      success: false,
      message: `¡El ${STAT_NAMES[stat]} de ${pokemon.name} no puede subir más!`,
      newStage: currentStage,
    }
  }
  if (stages < 0 && currentStage <= -6) {
    return {
      success: false,
      message: `¡El ${STAT_NAMES[stat]} de ${pokemon.name} no puede bajar más!`,
      newStage: currentStage,
    }
  }

  // Apply the change
  const newStage = applyStageChange(currentStage, stages)
  statStages[statKey] = newStage

  // Generate message based on change magnitude
  let changeText: string
  const absStages = Math.abs(stages)

  if (stages > 0) {
    if (absStages === 1) {
      changeText = 'subió'
    } else if (absStages === 2) {
      changeText = 'subió mucho'
    } else {
      changeText = 'subió drásticamente'
    }
  } else {
    if (absStages === 1) {
      changeText = 'bajó'
    } else if (absStages === 2) {
      changeText = 'bajó mucho'
    } else {
      changeText = 'bajó drásticamente'
    }
  }

  return {
    success: true,
    message: `¡El ${STAT_NAMES[stat]} de ${pokemon.name} ${changeText}!`,
    newStage,
  }
}

/**
 * Get the effective stat value after applying stage multipliers
 * @param pokemon - Pokemon to check
 * @param stat - Which stat to calculate
 * @returns Effective stat value
 */
export function getEffectiveStat(
  pokemon: Pokemon & { statStages?: StatStages },
  stat: AffectedStat
): number {
  const statStages = pokemon.statStages ?? DEFAULT_STAT_STAGES
  const statKey = STAT_KEY_MAP[stat]
  const stage = statStages[statKey]

  // Get base stat value
  let baseStat: number
  switch (stat) {
    case 'atk':
      baseStat = pokemon.stats.atk
      break
    case 'def':
      baseStat = pokemon.stats.def
      break
    case 'spAtk':
      baseStat = pokemon.stats.spAtk
      break
    case 'spDef':
      baseStat = pokemon.stats.spDef
      break
    case 'speed':
      baseStat = pokemon.stats.speed
      break
    case 'accuracy':
    case 'evasion':
      // Accuracy and evasion start at 100%
      baseStat = 100
      break
    default:
      baseStat = 100
  }

  // Apply multiplier
  const isAccuracyEvasion = stat === 'accuracy' || stat === 'evasion'
  const multiplier = getStageMultiplier(stage, isAccuracyEvasion)

  return Math.floor(baseStat * multiplier)
}

/**
 * Reset all stat stages to 0 (used when switching out)
 * @param pokemon - Pokemon to reset
 */
export function resetStages(pokemon: Pokemon & { statStages?: StatStages }): void {
  pokemon.statStages = { ...DEFAULT_STAT_STAGES }
}

/**
 * Get the current stage for a stat
 * @param pokemon - Pokemon to check
 * @param stat - Which stat to get
 * @returns Current stage value (-6 to +6)
 */
export function getStatStage(
  pokemon: Pokemon & { statStages?: StatStages },
  stat: AffectedStat
): number {
  const statStages = pokemon.statStages ?? DEFAULT_STAT_STAGES
  return statStages[STAT_KEY_MAP[stat]]
}
