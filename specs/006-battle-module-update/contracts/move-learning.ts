/**
 * Move Learning Contract
 * Feature: 006-battle-module-update
 *
 * Defines types and interfaces for the Move Learning modal and logic.
 */

import type { Move } from '@/domain/battle/engine/entities'

// =============================================================================
// Core Types
// =============================================================================

/** Maximum moves a Pokémon can know */
export const MAX_MOVES = 4 as const

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
  hasDecided: false
}

// =============================================================================
// Modal Actions
// =============================================================================

export interface MoveLearningModalActions {
  /** Open modal with candidates to process */
  open: (candidates: MoveLearningCandidate[]) => void

  /** Close modal and reset state */
  close: () => void

  /** Select a move slot to replace (0-3) */
  selectSlot: (index: number) => void

  /** Clear selection */
  clearSelection: () => void

  /** Confirm replacement: learn new move in selected slot */
  confirmReplace: () => void

  /** Skip learning: keep current moveset */
  skipLearning: () => void

  /** Move to next candidate in queue */
  nextCandidate: () => void

  /** Check if all candidates processed */
  isComplete: () => boolean
}

// =============================================================================
// Move Learning Logic
// =============================================================================

export interface MoveLearningResult {
  /** Whether the move was learned */
  learned: boolean

  /** If learned, which slot was replaced (0-3) */
  replacedSlot?: number

  /** If learned, the move that was forgotten */
  forgottenMove?: Move
}

/**
 * Determine if a Pokémon needs the move learning flow
 * True if: Pokémon has 4 moves AND is eligible to learn a new one
 */
export function needsMoveReplacement(currentMoves: Move[]): boolean {
  return currentMoves.length >= MAX_MOVES
}

/**
 * Determine if new move can simply be added (no replacement needed)
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
      result: { learned: false }
    }
  }

  // Add directly if < 4 moves
  if (currentMoves.length < MAX_MOVES) {
    return {
      newMoves: [...currentMoves, newMove],
      result: { learned: true }
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
      forgottenMove
    }
  }
}

// =============================================================================
// UI Component Props
// =============================================================================

export interface MoveLearningModalProps {
  /** Controlled open state */
  open: boolean

  /** Current candidate being processed */
  candidate: MoveLearningCandidate | null

  /** Currently selected slot (0-3 or null) */
  selectedSlot: number | null

  /** Callback when slot is selected */
  onSelectSlot: (index: number) => void

  /** Callback when user confirms replacement */
  onConfirm: () => void

  /** Callback when user skips learning */
  onSkip: () => void
}

export interface MoveSlotProps {
  /** The move in this slot */
  move: Move

  /** Slot index (0-3) */
  index: number

  /** Whether this slot is selected for replacement */
  isSelected: boolean

  /** Callback when slot is clicked */
  onClick: () => void
}

// =============================================================================
// Move Eligibility (placeholder - to be expanded)
// =============================================================================

/**
 * Check if a Pokémon is eligible to learn a move at their current level
 * This is a placeholder - actual implementation needs move learn data
 */
export interface MoveLearningEligibility {
  pokemonId: string
  pokemonName: string
  currentLevel: number
  eligibleMove: Move | null
}

/**
 * Placeholder function - needs integration with PokeAPI or static data
 * Returns null if no new move eligible at this level
 */
export function checkMoveLearningEligibility(
  _pokemonId: number,
  _currentLevel: number,
  _currentMoves: Move[]
): Move | null {
  // TODO: Implement with level-up move data
  // For now, return null (no move to learn)
  return null
}
