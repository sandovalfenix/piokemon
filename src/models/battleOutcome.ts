/**
 * Battle Outcome Model
 * Feature: 006-battle-module-update
 *
 * Types and interfaces for battle victory/defeat handling.
 */

import type { Move } from '@/domain/battle/engine/entities'

// =============================================================================
// Core Types
// =============================================================================

/** Type of opponent in battle */
export type OpponentType = 'thematic-npc' | 'gym-leader' | 'wild'

/** Result of a completed battle */
export type BattleResult = 'victory' | 'defeat'

// =============================================================================
// Battle Context (initialization)
// =============================================================================

export interface BattleContextInput {
  /** Type of opponent for outcome routing */
  opponentType: OpponentType

  /** Opponent identifier (NPC id, gym leader id, or 'wild-{pokemonId}') */
  opponentId: string | number

  /** Opponent display name */
  opponentName: string

  /** Highest level Pokémon in opponent team (for player scaling) */
  opponentMaxLevel: number
}

// =============================================================================
// Battle Outcome (completion)
// =============================================================================

export interface BattleOutcome {
  /** Victory or defeat */
  result: BattleResult

  /** Opponent context from initialization */
  opponentType: OpponentType
  opponentId: string | number
  opponentName: string

  /** Number of turns the battle took */
  turnCount: number

  /** Victory-only: Pokémon that can learn new moves */
  moveLearners?: MoveLearningCandidate[]
}

export interface MoveLearningCandidate {
  /** Pokémon ID from team */
  pokemonId: string

  /** Pokémon name for UI display */
  pokemonName: string

  /** The new move that can be learned */
  newMove: Move

  /** Current moves (1-4) */
  currentMoves: Move[]
}

// =============================================================================
// Defeat Modal State
// =============================================================================

export interface DefeatModalState {
  /** Whether the modal is visible */
  isOpen: boolean

  /** Name of opponent who defeated the player */
  opponentName: string

  /** Custom defeat message */
  defeatMessage: string
}

export const DEFAULT_DEFEAT_MODAL_STATE: DefeatModalState = {
  isOpen: false,
  opponentName: '',
  defeatMessage: '',
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Generate defeat message based on opponent type
 */
export function getDefeatMessage(
  opponentType: OpponentType,
  opponentName: string
): string {
  switch (opponentType) {
    case 'gym-leader':
      return `${opponentName} ha demostrado ser más fuerte. ¡Entrena y vuelve a intentarlo!`
    case 'thematic-npc':
      return `Has perdido contra ${opponentName}. Recupera fuerzas e inténtalo de nuevo.`
    case 'wild':
      return `El Pokémon salvaje era muy fuerte. Tu equipo necesita descanso.`
  }
}

/**
 * Generate victory message based on opponent type
 */
export function getVictoryMessage(
  opponentType: OpponentType,
  opponentName: string
): string {
  switch (opponentType) {
    case 'gym-leader':
      return `¡Has derrotado a ${opponentName}! Recibes la medalla del gimnasio.`
    case 'thematic-npc':
      return `¡Victoria contra ${opponentName}! Continúa hacia el Líder de Gimnasio.`
    case 'wild':
      return `¡Has ganado la batalla salvaje!`
  }
}
