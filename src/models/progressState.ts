/**
 * Progress State Model
 * Feature: 006-battle-module-update
 *
 * Persistent progression data synchronized to LocalStorage.
 */

// =============================================================================
// Interfaces
// =============================================================================

export interface ProgressState {
  /** IDs of defeated Thematic NPCs */
  defeatedTrainers: string[]

  /** Names of earned badges (e.g., "Medalla Valle Vivo") */
  earnedBadges: string[]

  /** Current gym index (1-5), indicates which gym is currently accessible */
  currentGym: number

  /** Unix timestamp of last save */
  timestamp: number
}

// =============================================================================
// Constants
// =============================================================================

/** LocalStorage key for progress data */
export const PROGRESS_STORAGE_KEY = 'pkmn-progress'

/** Default state for new games */
export const DEFAULT_PROGRESS: ProgressState = {
  defeatedTrainers: [],
  earnedBadges: [],
  currentGym: 1,
  timestamp: Date.now(),
}

// =============================================================================
// Validation
// =============================================================================

/**
 * Validate that a ProgressState object has valid structure
 * @param state - Object to validate
 * @returns true if valid ProgressState, false otherwise
 */
export function isValidProgressState(state: unknown): state is ProgressState {
  if (!state || typeof state !== 'object') return false

  const s = state as Record<string, unknown>

  // Check required properties exist and have correct types
  if (!Array.isArray(s.defeatedTrainers)) return false
  if (!Array.isArray(s.earnedBadges)) return false
  if (typeof s.currentGym !== 'number') return false
  if (typeof s.timestamp !== 'number') return false

  // Validate currentGym range (1-6: 1-5 for gyms, 6 means game complete)
  if (s.currentGym < 1 || s.currentGym > 6) return false

  // Validate earnedBadges contain only strings (badge names)
  for (const badge of s.earnedBadges) {
    if (typeof badge !== 'string') return false
  }

  // Validate defeatedTrainers are strings
  for (const trainer of s.defeatedTrainers) {
    if (typeof trainer !== 'string') return false
  }

  return true
}
