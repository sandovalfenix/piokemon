/**
 * Level Scaling
 * Feature: 006-battle-module-update
 *
 * Pure functions for calculating dynamically scaled levels
 *
 * Formula: Player level = max(1, OpponentLevel - 2)
 * - Ensures player is always slightly lower level than opponent
 * - Never goes below level 1
 * - Creates consistent challenge across all battles
 */

/**
 * Minimum level a Pokemon can be scaled to
 */
export const MIN_LEVEL = 1

/**
 * Level difference applied to player Pokemon
 * Player is always this many levels below the opponent
 */
export const LEVEL_SCALING_OFFSET = 2

/**
 * Calculate scaled level for player Pokemon based on opponent level
 *
 * @param opponentLevel - The level of the opponent Pokemon
 * @returns Scaled level for player Pokemon (minimum 1)
 *
 * @example
 * calculateScaledLevel(15) // returns 13
 * calculateScaledLevel(3)  // returns 1
 * calculateScaledLevel(1)  // returns 1
 */
export function calculateScaledLevel(opponentLevel: number): number {
  if (!Number.isInteger(opponentLevel) || opponentLevel < MIN_LEVEL) {
    console.warn(
      `[LevelScaling] Invalid opponent level: ${opponentLevel}, defaulting to ${MIN_LEVEL}`
    )
    return MIN_LEVEL
  }

  return Math.max(MIN_LEVEL, opponentLevel - LEVEL_SCALING_OFFSET)
}

/**
 * Calculate the average level of a team
 *
 * @param levels - Array of Pokemon levels in the team
 * @returns Average level (rounded down), minimum 1
 *
 * @example
 * calculateTeamAverageLevel([10, 12, 14]) // returns 12
 * calculateTeamAverageLevel([]) // returns 1
 */
export function calculateTeamAverageLevel(levels: number[]): number {
  if (levels.length === 0) {
    return MIN_LEVEL
  }

  const sum = levels.reduce((acc, level) => acc + level, 0)
  const average = Math.floor(sum / levels.length)
  return Math.max(MIN_LEVEL, average)
}

/**
 * Calculate wild Pokemon level based on player team average
 * Wild Pokemon are slightly weaker than player average
 *
 * Formula: max(3, teamAvgLevel - 2)
 *
 * @param teamAverageLevel - Average level of player's team
 * @returns Level for wild Pokemon (minimum 3)
 *
 * @example
 * calculateWildPokemonLevel(15) // returns 13
 * calculateWildPokemonLevel(5)  // returns 3
 * calculateWildPokemonLevel(3)  // returns 3
 */
export function calculateWildPokemonLevel(teamAverageLevel: number): number {
  const MIN_WILD_LEVEL = 3 // Wild Pokemon have a higher minimum than player scaling

  if (!Number.isInteger(teamAverageLevel) || teamAverageLevel < MIN_LEVEL) {
    console.warn(
      `[LevelScaling] Invalid team average level: ${teamAverageLevel}, defaulting to ${MIN_WILD_LEVEL}`
    )
    return MIN_WILD_LEVEL
  }

  return Math.max(MIN_WILD_LEVEL, teamAverageLevel - LEVEL_SCALING_OFFSET)
}

/**
 * Scale all Pokemon levels in a team array based on opponent level
 *
 * @param teamLevels - Original levels of player's team
 * @param opponentLevel - Level of the opponent
 * @returns Array of scaled levels
 *
 * @example
 * scaleTeamLevels([10, 12, 14], 15) // returns [13, 13, 13]
 */
export function scaleTeamLevels(teamLevels: number[], opponentLevel: number): number[] {
  const scaledLevel = calculateScaledLevel(opponentLevel)
  return teamLevels.map(() => scaledLevel)
}
