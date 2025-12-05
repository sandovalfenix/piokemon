/**
 * Stat Stages Model
 * Feature: 005-battle-fixes-status-moves
 *
 * Defines stat stage modifiers for battle Pokemon (-6 to +6)
 * Based on official Pokemon stat stage mechanics
 */

/**
 * Stat stage modifiers for a Pokemon in battle
 * Each stat can be modified from -6 to +6
 */
export interface StatStages {
  atk: number
  def: number
  spAtk: number
  spDef: number
  speed: number
  accuracy: number
  evasion: number
}

/**
 * Default stat stages (all at 0, no modification)
 */
export const DEFAULT_STAT_STAGES: StatStages = {
  atk: 0,
  def: 0,
  spAtk: 0,
  spDef: 0,
  speed: 0,
  accuracy: 0,
  evasion: 0,
}

/**
 * Stat stage multipliers based on stage value
 * Stage -6 = 2/8, -5 = 2/7, ..., 0 = 2/2, ..., +5 = 7/2, +6 = 8/2
 */
export const STAGE_MULTIPLIERS: Record<number, number> = {
  '-6': 2 / 8, // 0.25
  '-5': 2 / 7, // ~0.29
  '-4': 2 / 6, // ~0.33
  '-3': 2 / 5, // 0.40
  '-2': 2 / 4, // 0.50
  '-1': 2 / 3, // ~0.67
  '0': 1, // 1.00
  '1': 3 / 2, // 1.50
  '2': 4 / 2, // 2.00
  '3': 5 / 2, // 2.50
  '4': 6 / 2, // 3.00
  '5': 7 / 2, // 3.50
  '6': 8 / 2, // 4.00
}

/**
 * Accuracy/Evasion stage multipliers (different formula)
 * Stage -6 = 3/9, ..., 0 = 3/3, ..., +6 = 9/3
 */
export const ACCURACY_EVASION_MULTIPLIERS: Record<number, number> = {
  '-6': 3 / 9, // ~0.33
  '-5': 3 / 8, // ~0.38
  '-4': 3 / 7, // ~0.43
  '-3': 3 / 6, // 0.50
  '-2': 3 / 5, // 0.60
  '-1': 3 / 4, // 0.75
  '0': 1, // 1.00
  '1': 4 / 3, // ~1.33
  '2': 5 / 3, // ~1.67
  '3': 6 / 3, // 2.00
  '4': 7 / 3, // ~2.33
  '5': 8 / 3, // ~2.67
  '6': 9 / 3, // 3.00
}

/**
 * Get the multiplier for a given stat stage
 * @param stage - The stat stage (-6 to +6)
 * @param isAccuracyEvasion - Whether this is accuracy or evasion (different formula)
 * @returns The multiplier to apply to the base stat
 */
export function getStageMultiplier(stage: number, isAccuracyEvasion: boolean = false): number {
  // Clamp stage to valid range
  const clampedStage = Math.max(-6, Math.min(6, stage))

  if (isAccuracyEvasion) {
    return ACCURACY_EVASION_MULTIPLIERS[clampedStage] ?? 1
  }
  return STAGE_MULTIPLIERS[clampedStage] ?? 1
}

/**
 * Apply a stage change and return the new clamped value
 * @param currentStage - Current stage value
 * @param change - Change to apply (positive or negative)
 * @returns New stage value clamped to [-6, +6]
 */
export function applyStageChange(currentStage: number, change: number): number {
  return Math.max(-6, Math.min(6, currentStage + change))
}

/**
 * Create a fresh copy of default stat stages
 */
export function createDefaultStatStages(): StatStages {
  return { ...DEFAULT_STAT_STAGES }
}
