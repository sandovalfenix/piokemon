/**
 * Battle Effect Service
 * Feature: 005-battle-fixes-status-moves
 *
 * Orchestrates the application of move effects during battle turns.
 * Combines stat stage changes and status condition application.
 *
 * Follows Constitution v1.4.0 - PokeAPI as Single Source of Truth
 */

import type { Pokemon, Move } from '@/domain/battle/engine/entities'
import type { MoveEffect } from '@/models/moveEffect'
import type { Rng } from '@/domain/battle/calc/rng'
import { applyStatChange, type StatChangeResult } from './statStageService'
import { applyStatus, type StatusApplyResult, type PokemonWithStatus } from './statusConditionService'
import type { StatStages } from '@/models/statStages'
import type { AffectedStat } from '@/models/moveEffect'

/**
 * Extended Pokemon type with stat stages support
 */
export type BattlePokemon = Pokemon & {
  statStages?: StatStages
  statusCondition?: PokemonWithStatus['statusCondition']
}

/**
 * Result of applying a move effect
 */
export interface EffectResult {
  applied: boolean
  message: string
  type: 'stat-change' | 'status-condition' | 'none'
}

/**
 * Apply move effect based on PokeAPI data
 *
 * This function determines the target and applies the appropriate effect
 * (stat change or status condition) based on the move's effect data.
 *
 * @param effect - Move effect from PokeAPI
 * @param attacker - Pokemon using the move
 * @param defender - Pokemon being targeted
 * @param rng - Random number generator for chance calculation
 * @returns Result with applied status and battle log message
 *
 * @example
 * // Applying Growl's effect
 * const result = applyMoveEffect(growlEffect, pikachu, charmander, rng)
 * // result.message = "¡El Ataque de Charmander bajó!"
 */
export function applyMoveEffect(
  effect: MoveEffect | undefined | null,
  attacker: BattlePokemon,
  defender: BattlePokemon,
  rng: Rng
): EffectResult {
  // No effect to apply
  if (!effect) {
    return {
      applied: false,
      message: '',
      type: 'none',
    }
  }

  // Check chance (default 100%)
  const chance = effect.chance ?? 100
  if (chance < 100) {
    const roll = rng.next() * 100
    if (roll > chance) {
      return {
        applied: false,
        message: '',
        type: 'none',
      }
    }
  }

  // Determine target
  const target = effect.target === 'self' ? attacker : defender

  // Apply based on effect type
  switch (effect.type) {
    case 'stat-change':
      return applyStatChangeEffect(target, effect)

    case 'status-condition':
      return applyStatusConditionEffect(target, effect)

    case 'healing':
      // Healing not implemented in current scope
      return {
        applied: false,
        message: '',
        type: 'none',
      }

    default:
      return {
        applied: false,
        message: '',
        type: 'none',
      }
  }
}

/**
 * Apply a stat change effect to target Pokemon
 */
function applyStatChangeEffect(
  target: BattlePokemon,
  effect: MoveEffect
): EffectResult {
  if (!effect.stat || effect.stages === undefined) {
    return {
      applied: false,
      message: '',
      type: 'stat-change',
    }
  }

  const result: StatChangeResult = applyStatChange(target, effect.stat as AffectedStat, effect.stages)

  return {
    applied: result.success,
    message: result.message,
    type: 'stat-change',
  }
}

/**
 * Apply a status condition effect to target Pokemon
 */
function applyStatusConditionEffect(
  target: BattlePokemon,
  effect: MoveEffect
): EffectResult {
  if (!effect.condition) {
    return {
      applied: false,
      message: '',
      type: 'status-condition',
    }
  }

  const result: StatusApplyResult = applyStatus(target as PokemonWithStatus, effect.condition)

  return {
    applied: result.success,
    message: result.message,
    type: 'status-condition',
  }
}

/**
 * Check if a move has an effect worth applying
 * @param move - Move to check
 * @returns true if move has a defined effect
 */
export function moveHasEffect(move: Move): boolean {
  return move.effect !== undefined && move.effect !== null
}

/**
 * Get human-readable effect description for battle log
 * @param move - Move with effect
 * @returns Description string or empty if no effect
 */
export function getEffectLogMessage(move: Move): string {
  if (!move.effect) return ''

  const effect = move.effect
  const targetText = effect.target === 'self' ? 'user' : 'target'

  switch (effect.type) {
    case 'stat-change':
      if (effect.stat && effect.stages !== undefined) {
        const direction = effect.stages > 0 ? 'raises' : 'lowers'
        const amount = Math.abs(effect.stages)
        const stages = amount === 1 ? 'stage' : 'stages'
        return `${direction} ${targetText}'s ${effect.stat} by ${amount} ${stages}`
      }
      break

    case 'status-condition':
      if (effect.condition) {
        return `may inflict ${effect.condition} on ${targetText}`
      }
      break
  }

  return ''
}
