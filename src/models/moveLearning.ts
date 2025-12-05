/**
 * Move Learning Model
 * Feature: 006-battle-module-update
 *
 * Types and interfaces for the Move Learning modal and logic.
 */

import type { Move } from '@/domain/battle/engine/entities'

// =============================================================================
// Constants
// =============================================================================

/** Maximum moves a Pokémon can know */
export const MAX_MOVES = 4 as const

// =============================================================================
// Interfaces
// =============================================================================

export interface MoveLearningCandidate {
  /** Pokémon ID for updating team */
  pokemonId: string

  /** Pokémon name for display */
  pokemonName: string

  /** Pokémon sprite URL for display */
  pokemonSprite?: string

  /** The new move being offered */
  newMove: Move

  /** Current moves (1-4) */
  currentMoves: Move[]
}

// =============================================================================
// Modal State
// =============================================================================

export interface MoveLearningModalState {
  /** Whether modal is visible */
  isOpen: boolean

  /** Queue of candidates to process */
  candidates: MoveLearningCandidate[]

  /** Current candidate index in queue */
  currentIndex: number

  /** Selected move slot to replace (0-3), null = don't learn */
  selectedSlot: number | null

  /** Whether user has made a decision */
  hasDecided: boolean
}

export const DEFAULT_MOVE_LEARNING_STATE: Readonly<MoveLearningModalState> = {
  isOpen: false,
  candidates: [],
  currentIndex: 0,
  selectedSlot: null,
  hasDecided: false,
}

// =============================================================================
// Move Learning Result
// =============================================================================

export interface MoveLearningResult {
  /** Whether the move was learned */
  learned: boolean

  /** If learned, which slot was replaced (0-3) */
  replacedSlot?: number

  /** If learned, the move that was forgotten */
  forgottenMove?: Move
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Check if a Pokémon needs the move learning flow
 * True if: Pokémon has 4 moves AND is eligible to learn a new one
 */
export function needsMoveReplacement(currentMoves: Move[]): boolean {
  return currentMoves.length >= MAX_MOVES
}

/**
 * Check if new move can simply be added (no replacement needed)
 * True if: Pokémon has < 4 moves
 */
export function canAddMoveDirectly(currentMoves: Move[]): boolean {
  return currentMoves.length < MAX_MOVES
}

/**
 * Apply move learning decision to moveset
 * Returns the new moveset after the operation
 */
export function applyMoveLearning(
  currentMoves: Move[],
  newMove: Move,
  replaceSlot: number | null
): { newMoves: Move[]; result: MoveLearningResult } {
  // Skip learning
  if (replaceSlot === null) {
    return {
      newMoves: [...currentMoves],
      result: { learned: false },
    }
  }

  // Add directly if < 4 moves
  if (currentMoves.length < MAX_MOVES) {
    return {
      newMoves: [...currentMoves, newMove],
      result: { learned: true },
    }
  }

  // Replace existing move
  const forgottenMove = currentMoves[replaceSlot]
  const newMoves = [...currentMoves]
  newMoves[replaceSlot] = newMove

  return {
    newMoves,
    result: {
      learned: true,
      replacedSlot: replaceSlot,
      forgottenMove,
    },
  }
}
