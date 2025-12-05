/**
 * Status Condition Model
 * Feature: 005-battle-fixes-status-moves
 *
 * Defines status conditions that can affect Pokemon in battle
 */

/**
 * Primary status conditions (only one can be active at a time)
 * These are non-volatile conditions that persist until healed
 */
export type StatusCondition =
  | 'paralysis'
  | 'sleep'
  | 'poison'
  | 'burn'
  | 'freeze'
  | 'badly-poisoned'

/**
 * State tracking for active status conditions
 */
export interface StatusConditionState {
  /** The active status condition */
  condition: StatusCondition

  /** Turns remaining for sleep (1-3 turns) */
  turnsRemaining?: number

  /** Counter for badly-poisoned damage (increases each turn) */
  poisonCounter?: number
}

/**
 * Status condition effects description
 */
export const STATUS_EFFECTS: Record<
  StatusCondition,
  {
    name: string
    description: string
    applyMessage: string
    endOfTurnMessage?: string
  }
> = {
  paralysis: {
    name: 'Paralysis',
    description: 'Speed reduced by 50%. 25% chance to skip turn.',
    applyMessage: '¡{pokemon} fue paralizado!',
  },
  sleep: {
    name: 'Sleep',
    description: 'Cannot act for 1-3 turns.',
    applyMessage: '¡{pokemon} se quedó dormido!',
  },
  poison: {
    name: 'Poison',
    description: 'Loses 1/8 max HP at end of turn.',
    applyMessage: '¡{pokemon} fue envenenado!',
    endOfTurnMessage: '¡{pokemon} sufre por el veneno!',
  },
  burn: {
    name: 'Burn',
    description: 'Physical attack halved. Loses 1/16 max HP at end of turn.',
    applyMessage: '¡{pokemon} fue quemado!',
    endOfTurnMessage: '¡{pokemon} sufre por la quemadura!',
  },
  freeze: {
    name: 'Freeze',
    description: 'Cannot act. 20% chance to thaw each turn.',
    applyMessage: '¡{pokemon} fue congelado!',
  },
  'badly-poisoned': {
    name: 'Badly Poisoned',
    description: 'Loses increasing HP each turn (1/16, 2/16, 3/16...).',
    applyMessage: '¡{pokemon} fue gravemente envenenado!',
    endOfTurnMessage: '¡{pokemon} sufre por el veneno!',
  },
}

/**
 * Type immunities to status conditions
 */
export const TYPE_IMMUNITIES: Record<StatusCondition, string[]> = {
  paralysis: ['electric'],
  sleep: [], // No type immunity, but Insomnia/Vital Spirit abilities would prevent
  poison: ['poison', 'steel'],
  burn: ['fire'],
  freeze: ['ice'],
  'badly-poisoned': ['poison', 'steel'],
}

/**
 * Check if a Pokemon type is immune to a status condition
 * @param pokemonTypes - Array of Pokemon types
 * @param condition - Status condition to check
 * @returns true if immune
 */
export function isImmuneToStatus(pokemonTypes: string[], condition: StatusCondition): boolean {
  const immuneTypes = TYPE_IMMUNITIES[condition]
  return pokemonTypes.some((type) => immuneTypes.includes(type.toLowerCase()))
}

/**
 * Calculate end-of-turn damage for poison/burn
 * @param maxHp - Pokemon's max HP
 * @param condition - Status condition
 * @param poisonCounter - Counter for badly-poisoned (optional)
 * @returns Damage to deal
 */
export function calculateStatusDamage(
  maxHp: number,
  condition: StatusCondition,
  poisonCounter?: number
): number {
  switch (condition) {
    case 'poison':
      return Math.floor(maxHp / 8)
    case 'burn':
      return Math.floor(maxHp / 16)
    case 'badly-poisoned':
      // Damage increases each turn: 1/16, 2/16, 3/16...
      const counter = poisonCounter ?? 1
      return Math.floor((maxHp * counter) / 16)
    default:
      return 0
  }
}
