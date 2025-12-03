/**
 * Battle Outcomes Contract
 * Feature: 006-battle-module-update
 *
 * Defines types and interfaces for battle victory/defeat handling.
 */

import type { Move } from '@/domain/battle/engine/entities'

// =============================================================================
// Core Types
// =============================================================================

export type OpponentType = 'thematic-npc' | 'gym-leader' | 'wild'

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
// Outcome Handler Interface
// =============================================================================

export interface BattleOutcomeHandler {
  /** Process victory: heal team, check move learning, update progress */
  handleVictory: (outcome: BattleOutcome) => Promise<void>

  /** Process defeat: show modal, heal team */
  handleDefeat: (outcome: BattleOutcome) => Promise<void>
}

// =============================================================================
// Level Scaling
// =============================================================================

/** Minimum player Pokémon level (never below this) */
export const MIN_PLAYER_LEVEL = 1 as const

/** Minimum wild Pokémon level */
export const MIN_WILD_LEVEL = 3 as const

/** Level difference for scaling (opponent - this = player level) */
export const LEVEL_SCALING_OFFSET = 2 as const

/**
 * Calculate player's scaled level based on opponent
 * Formula: max(1, opponentLevel - 2)
 */
export function calculateScaledPlayerLevel(opponentLevel: number): number {
  return Math.max(MIN_PLAYER_LEVEL, opponentLevel - LEVEL_SCALING_OFFSET)
}

/**
 * Calculate wild Pokémon level based on player team
 * Formula: max(3, teamAverageLevel - 2)
 */
export function calculateWildPokemonLevel(teamAverageLevel: number): number {
  return Math.max(MIN_WILD_LEVEL, teamAverageLevel - LEVEL_SCALING_OFFSET)
}

/**
 * Calculate team average level
 */
export function calculateTeamAverageLevel(teamLevels: number[]): number {
  if (teamLevels.length === 0) return MIN_WILD_LEVEL + LEVEL_SCALING_OFFSET // Fallback: 5
  return Math.round(teamLevels.reduce((sum, lvl) => sum + lvl, 0) / teamLevels.length)
}

// =============================================================================
// Outcome Messages
// =============================================================================

export interface DefeatMessageConfig {
  opponentType: OpponentType
  opponentName: string
}

export function getDefeatMessage(config: DefeatMessageConfig): string {
  const { opponentType, opponentName } = config

  switch (opponentType) {
    case 'gym-leader':
      return `${opponentName} ha demostrado ser más fuerte. ¡Entrena y vuelve a intentarlo!`
    case 'thematic-npc':
      return `Has perdido contra ${opponentName}. Recupera fuerzas e inténtalo de nuevo.`
    case 'wild':
      return `El Pokémon salvaje era muy fuerte. Tu equipo necesita descanso.`
  }
}

export function getVictoryMessage(config: DefeatMessageConfig): string {
  const { opponentType, opponentName } = config

  switch (opponentType) {
    case 'gym-leader':
      return `¡Has derrotado a ${opponentName}! Recibes la medalla del gimnasio.`
    case 'thematic-npc':
      return `¡Victoria contra ${opponentName}! Continúa hacia el Líder de Gimnasio.`
    case 'wild':
      return `¡Has ganado la batalla salvaje! Tu equipo gana experiencia.`
  }
}

// =============================================================================
// Post-Battle Actions
// =============================================================================

export interface PostBattleActions {
  /** Full heal all Pokémon in team (currentHp = maxHp) */
  healTeam: () => void

  /** Navigate to lobby route */
  navigateToLobby: () => void

  /** Update progress store with victory */
  recordVictory: (opponentType: OpponentType, opponentId: string | number) => void

  /** Show defeat modal */
  showDefeatModal: (outcome: BattleOutcome) => void

  /** Show move learning modal */
  showMoveLearningModal: (candidates: MoveLearningCandidate[]) => void
}
