/**
 * Move Effect Model
 * Feature: 005-battle-fixes-status-moves
 *
 * Defines effect types for moves that don't deal direct damage
 */

import type { StatusCondition } from './statusCondition'

/**
 * Types of move effects
 */
export type MoveEffectType = 'stat-change' | 'status-condition' | 'healing'

/**
 * Target of the move effect
 */
export type EffectTarget = 'self' | 'opponent'

/**
 * Stats that can be affected by stat-changing moves
 */
export type AffectedStat = 'atk' | 'def' | 'spAtk' | 'spDef' | 'speed' | 'accuracy' | 'evasion'

/**
 * Move effect definition
 */
export interface MoveEffect {
  /** Type of effect */
  type: MoveEffectType

  /** Who the effect targets */
  target: EffectTarget

  /** For stat-change: which stat is affected */
  stat?: AffectedStat

  /** For stat-change: number of stages to change (-6 to +6) */
  stages?: number

  /** For status-condition: which condition to apply */
  condition?: StatusCondition

  /** Chance of effect occurring (0-100, default 100) */
  chance?: number
}
