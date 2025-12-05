/**
 * Move Filter
 * Feature: 006-battle-module-update
 *
 * Pure functions for filtering moves by category
 * Used to exclude Status moves from battle (per spec)
 */

import type { Move, Category } from './entities'

/**
 * Move categories that deal damage and are usable in battle
 */
export const DAMAGING_CATEGORIES: readonly Category[] = ['physical', 'special'] as const

/**
 * Move category to exclude from battle
 */
export const EXCLUDED_CATEGORY: Category = 'status'

/**
 * Filter moves to only include damaging moves (Physical/Special)
 * Excludes Status category moves per battle module spec
 *
 * @param moves - Array of moves to filter
 * @returns Array of moves with only Physical and Special categories
 *
 * @example
 * filterUsableMoves([tackle, growl, waterGun]) // returns [tackle, waterGun]
 */
export function filterUsableMoves(moves: Move[]): Move[] {
  return moves.filter((move) => DAMAGING_CATEGORIES.includes(move.category))
}

/**
 * Check if a move is usable in battle (not Status category)
 *
 * @param move - Move to check
 * @returns true if move is Physical or Special
 *
 * @example
 * isUsableMove({ category: 'physical', ... }) // returns true
 * isUsableMove({ category: 'status', ... })   // returns false
 */
export function isUsableMove(move: Move): boolean {
  return DAMAGING_CATEGORIES.includes(move.category)
}

/**
 * Check if any move in array is usable
 *
 * @param moves - Array of moves to check
 * @returns true if at least one move is usable
 */
export function hasUsableMoves(moves: Move[]): boolean {
  return moves.some(isUsableMove)
}

/**
 * Get count of usable moves in array
 *
 * @param moves - Array of moves to count
 * @returns Number of usable moves
 */
export function countUsableMoves(moves: Move[]): number {
  return filterUsableMoves(moves).length
}

/**
 * Filter status moves only (inverse of filterUsableMoves)
 * Useful for debugging or special status-only scenarios
 *
 * @param moves - Array of moves to filter
 * @returns Array of moves with only Status category
 */
export function filterStatusMoves(moves: Move[]): Move[] {
  return moves.filter((move) => move.category === EXCLUDED_CATEGORY)
}
