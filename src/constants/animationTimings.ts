/**
 * Animation Timing Constants
 * Feature: 004-modern-battle-ui
 *
 * Centralized animation timing values to prevent CSS/JS desync
 */

import type { AnimationTimings } from '@/types/battle-ui-state'

/**
 * Animation timing constants (milliseconds)
 * Single source of truth for all animation durations
 */
export const ANIMATION_TIMINGS: AnimationTimings = {
  /** Attack charge forward duration */
  ATTACK_CHARGE_MS: 300,
  /** Attack impact hold duration */
  ATTACK_HOLD_MS: 100,
  /** Attack return to origin duration */
  ATTACK_RETURN_MS: 200,
  /** Total attack sequence duration */
  ATTACK_TOTAL_MS: 600,
  /** Damage effect duration */
  DAMAGE_EFFECT_MS: 300,
  /** HP bar width transition duration */
  HP_BAR_TRANSITION_MS: 500,
  /** Panel fade in/out duration */
  VIEW_TRANSITION_MS: 200,
  /** Sprite loading timeout */
  SPRITE_LOAD_TIMEOUT_MS: 3000,
  /** Attack animation easing function */
  EASING_ATTACK: 'cubic-bezier(0.4, 0, 0.2, 1)',
  /** HP bar animation easing function */
  EASING_HP_BAR: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const
