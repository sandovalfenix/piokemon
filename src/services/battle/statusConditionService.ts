/**
 * Status Condition Service
 * Feature: 005-battle-fixes-status-moves
 *
 * Service for managing Pokemon status conditions in battle
 */

import type { Pokemon } from '@/domain/battle/engine/entities'
import {
  type StatusCondition,
  type StatusConditionState,
  STATUS_EFFECTS,
  isImmuneToStatus,
  calculateStatusDamage,
} from '@/models/statusCondition'

/**
 * Extended Pokemon type with status condition support
 */
export type PokemonWithStatus = Pokemon & {
  statusCondition?: StatusConditionState | null
}

/**
 * Result of applying a status condition
 */
export interface StatusApplyResult {
  success: boolean
  message: string
}

/**
 * Result of checking if Pokemon can act
 */
export interface CanActResult {
  canAct: boolean
  message?: string
}

/**
 * Result of end-of-turn status effects
 */
export interface EndOfTurnResult {
  damage: number
  message?: string
  cured?: boolean
}

/**
 * Apply a status condition to a Pokemon
 * @param pokemon - Pokemon to apply status to (will be mutated)
 * @param condition - Status condition to apply
 * @returns Result with success status and battle log message
 */
export function applyStatus(
  pokemon: PokemonWithStatus,
  condition: StatusCondition
): StatusApplyResult {
  // Check if already has a status condition
  if (pokemon.statusCondition) {
    return {
      success: false,
      message: `¡${pokemon.name} ya tiene un estado alterado!`,
    }
  }

  // Check type immunity
  const types = pokemon.types.map((t) => t.toString().toLowerCase())
  if (isImmuneToStatus(types, condition)) {
    return {
      success: false,
      message: `¡No afecta a ${pokemon.name}!`,
    }
  }

  // Apply the condition
  const state: StatusConditionState = {
    condition,
  }

  // Special setup for certain conditions
  if (condition === 'sleep') {
    // Sleep lasts 1-3 turns
    state.turnsRemaining = Math.floor(Math.random() * 3) + 1
  } else if (condition === 'badly-poisoned') {
    state.poisonCounter = 1
  }

  pokemon.statusCondition = state

  // Generate message
  const effectInfo = STATUS_EFFECTS[condition]
  const message = effectInfo.applyMessage.replace('{pokemon}', pokemon.name)

  return {
    success: true,
    message,
  }
}

/**
 * Check if a Pokemon can act this turn (considering paralysis, sleep, freeze)
 * @param pokemon - Pokemon to check
 * @returns Result with canAct boolean and optional skip message
 */
export function checkCanAct(pokemon: PokemonWithStatus): CanActResult {
  if (!pokemon.statusCondition) {
    return { canAct: true }
  }

  const { condition, turnsRemaining } = pokemon.statusCondition

  switch (condition) {
    case 'paralysis':
      // 25% chance to skip turn
      if (Math.random() < 0.25) {
        return {
          canAct: false,
          message: `¡${pokemon.name} está paralizado y no puede moverse!`,
        }
      }
      return { canAct: true }

    case 'sleep':
      // Check if waking up
      if (turnsRemaining !== undefined && turnsRemaining <= 0) {
        pokemon.statusCondition = null
        return {
          canAct: true,
          message: `¡${pokemon.name} se despertó!`,
        }
      }
      // Decrement turns and skip
      if (pokemon.statusCondition.turnsRemaining !== undefined) {
        pokemon.statusCondition.turnsRemaining--
      }
      return {
        canAct: false,
        message: `¡${pokemon.name} está dormido!`,
      }

    case 'freeze':
      // 20% chance to thaw each turn
      if (Math.random() < 0.2) {
        pokemon.statusCondition = null
        return {
          canAct: true,
          message: `¡${pokemon.name} se descongeló!`,
        }
      }
      return {
        canAct: false,
        message: `¡${pokemon.name} está congelado!`,
      }

    default:
      return { canAct: true }
  }
}

/**
 * Apply end-of-turn effects (poison damage, burn damage)
 * @param pokemon - Pokemon to apply effects to
 * @returns Damage dealt (if any) and battle log message
 */
export function applyEndOfTurnEffects(pokemon: PokemonWithStatus): EndOfTurnResult {
  if (!pokemon.statusCondition) {
    return { damage: 0 }
  }

  const { condition, poisonCounter } = pokemon.statusCondition

  switch (condition) {
    case 'poison':
    case 'burn':
    case 'badly-poisoned': {
      const damage = calculateStatusDamage(pokemon.stats.hp, condition, poisonCounter)

      // Increment badly-poisoned counter
      if (condition === 'badly-poisoned' && pokemon.statusCondition.poisonCounter !== undefined) {
        pokemon.statusCondition.poisonCounter++
      }

      const effectInfo = STATUS_EFFECTS[condition]
      const message = effectInfo.endOfTurnMessage?.replace('{pokemon}', pokemon.name)

      return {
        damage,
        message,
      }
    }

    default:
      return { damage: 0 }
  }
}

/**
 * Check if a Pokemon is immune to a status based on its type
 * @param pokemon - Pokemon to check
 * @param condition - Status condition to check
 * @returns true if immune
 */
export function isImmuneTo(pokemon: PokemonWithStatus, condition: StatusCondition): boolean {
  const types = pokemon.types.map((t) => t.toString().toLowerCase())
  return isImmuneToStatus(types, condition)
}

/**
 * Clear status condition (e.g., when healed)
 * @param pokemon - Pokemon to clear status from
 */
export function clearStatus(pokemon: PokemonWithStatus): void {
  pokemon.statusCondition = null
}

/**
 * Get current status condition name for display
 * @param pokemon - Pokemon to check
 * @returns Status name or null if no status
 */
export function getStatusName(pokemon: PokemonWithStatus): string | null {
  if (!pokemon.statusCondition) {
    return null
  }
  return STATUS_EFFECTS[pokemon.statusCondition.condition].name
}

/**
 * Get speed modifier for status conditions (paralysis halves speed)
 * @param pokemon - Pokemon to check
 * @returns Speed multiplier (1.0 normally, 0.5 if paralyzed)
 */
export function getSpeedModifier(pokemon: PokemonWithStatus): number {
  if (pokemon.statusCondition?.condition === 'paralysis') {
    return 0.5
  }
  return 1.0
}

/**
 * Get attack modifier for status conditions (burn halves physical attack)
 * @param pokemon - Pokemon to check
 * @param isPhysical - Whether the attack is physical
 * @returns Attack multiplier (1.0 normally, 0.5 if burned and physical)
 */
export function getAttackModifier(pokemon: PokemonWithStatus, isPhysical: boolean): number {
  if (pokemon.statusCondition?.condition === 'burn' && isPhysical) {
    return 0.5
  }
  return 1.0
}
