/**
 * Move Learning Service
 * Feature: 006-battle-module-update (T031)
 *
 * Handles move learning eligibility checks and move replacement logic.
 * Note: Currently disabled per spec (no XP/leveling system).
 * This service is scaffolded for future implementation.
 */

import type { Move } from '@/domain/battle/engine/entities'
import type { TeamMember } from '@/models/teamBuilder'
import type { MoveLearningCandidate, MoveLearningModalState } from '@/models/moveLearning'

/**
 * Maximum number of moves a Pokemon can have
 */
export const MAX_MOVES = 4

/**
 * Check if a Pokemon is eligible to learn a new move
 * Currently always returns false since leveling is disabled
 *
 * @param _pokemon - The Pokemon to check (unused - leveling disabled)
 * @param _newLevel - The new level (unused - leveling disabled)
 * @returns MoveLearningCandidate or null if not eligible
 */
export function checkMoveLearningEligibility(
  _pokemon: TeamMember,
  _newLevel: number
): MoveLearningCandidate | null {
  // Feature 006 spec: No XP/leveling system
  // Move learning is disabled for now
  // This function is scaffolded for future implementation
  return null
}

/**
 * Apply move replacement to a team member
 *
 * @param teamMember - The team member to modify
 * @param moveIndexToReplace - Index of the move to replace (0-3)
 * @param newMove - The new move to learn
 * @returns Updated team member
 */
export function applyMoveReplacement(
  teamMember: TeamMember,
  moveIndexToReplace: number,
  newMove: Move
): TeamMember {
  if (moveIndexToReplace < 0 || moveIndexToReplace >= teamMember.selectedMoves.length) {
    console.error(`[MoveLearnService] Invalid move index: ${moveIndexToReplace}`)
    return teamMember
  }

  // Convert battle Move to team builder Move format
  // Note: category needs to be capitalized for team builder format
  const categoryMap: Record<string, 'Physical' | 'Special' | 'Status'> = {
    physical: 'Physical',
    special: 'Special',
    status: 'Status',
  }

  const teamBuilderMove = {
    id: parseInt(newMove.id) || Math.floor(Math.random() * 10000),
    name: newMove.name,
    type: newMove.type,
    power: newMove.power,
    accuracy: newMove.accuracy,
    category: categoryMap[newMove.category] ?? 'Physical',
    pp: 15, // Default PP
  }

  // Replace the move
  const updatedMoves = [...teamMember.selectedMoves]
  updatedMoves[moveIndexToReplace] = teamBuilderMove

  return {
    ...teamMember,
    selectedMoves: updatedMoves,
  }
}

/**
 * Create initial move learning modal state (closed)
 */
export function createInitialMoveLearningModalState(): MoveLearningModalState {
  return {
    isOpen: false,
    candidates: [],
    currentIndex: 0,
    selectedSlot: null,
    hasDecided: false,
  }
}

/**
 * Open move learning modal for a specific Pokemon
 *
 * @param candidate - The move learning candidate info
 * @returns Updated MoveLearningModalState
 */
export function openMoveLearningModal(
  candidate: MoveLearningCandidate
): MoveLearningModalState {
  return {
    isOpen: true,
    candidates: [candidate],
    currentIndex: 0,
    selectedSlot: null,
    hasDecided: false,
  }
}

/**
 * Close move learning modal
 */
export function closeMoveLearningModal(): MoveLearningModalState {
  return createInitialMoveLearningModalState()
}
