/**
 * Capture Data Models
 * Feature: 007-wild-encounter-capture
 *
 * TypeScript interfaces for Wild Encounter & Capture entities
 */

import type { Pokemon } from '@/models/teamBuilder'

/**
 * Ball types available for capture
 */
export type BallType = 'pokeball' | 'superball' | 'ultraball' | 'masterball'

/**
 * Ball modifier values for capture formula (Gen 3)
 * Source: captureEngine.ts (MUST NOT modify engine - these values are reference only)
 */
export const BALL_MODIFIERS: Record<BallType, number> = {
  pokeball: 1,
  superball: 1.5,
  ultraball: 2,
  masterball: 255,
} as const

/**
 * A Pokémon that has been captured, with additional metadata
 */
export interface CapturedPokemon {
  /** Unique instance ID (UUID) for this captured instance */
  instanceId: string

  /** PokéAPI Pokémon data */
  pokemon: Pokemon

}

/**
 * Generate unique instance ID for captured Pokémon
 */
export function generateInstanceId(): string {
  return crypto.randomUUID()
}

/**
 * Capture flow phase states
 */
export type CapturePhase = 'idle' | 'selecting-ball' | 'throwing' | 'shaking' | 'result'

/**
 * Capture state for the useCapture composable
 */
export interface CaptureState {
  /** Current phase of capture flow */
  phase: CapturePhase

  /** Number of shakes (0-3) during animation */
  shakes: number

  /** Whether capture was successful */
  success: boolean

  /** Selected ball type (set when user picks a ball) */
  selectedBall: BallType | null

  /** Where the Pokémon was saved after capture */
  savedTo: 'team' | 'pcbox' | null
}

/**
 * Wild Pokémon data for battle encounters
 * Extends Pokemon with battle-specific data
 */
export interface WildBattlePokemon {
  /** PokéAPI Pokémon data */
  pokemon: Pokemon

  /** Wild Pokémon level (based on gym badges) */
  level: number

  /** Current HP during battle */
  currentHp: number

  /** Maximum HP at encounter */
  maxHp: number

  /** Base catch rate from PokéAPI (1-255) */
  catchRate: number
}

/**
 * Capture attempt result from captureEngine
 */
export interface CaptureResult {
  /** Whether capture was successful */
  success: boolean

  /** Number of shakes before result (0-3) */
  shakes: number

  /** Where Pokémon was saved (null if capture failed) */
  savedTo: 'team' | 'pcbox' | null
}
