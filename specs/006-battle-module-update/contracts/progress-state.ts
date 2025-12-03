/**
 * Progress State Contract
 * Feature: 006-battle-module-update
 *
 * Defines the persistent progression state for story mode.
 * Synchronized to LocalStorage via Pinia store.
 */

// =============================================================================
// Core Types
// =============================================================================

export interface ProgressState {
  /** IDs of defeated Thematic NPCs (e.g., "npc-jose-1", "npc-jose-2") */
  defeatedTrainers: string[]

  /** IDs of defeated Gym Leaders, corresponds to badge earned (1-5) */
  earnedBadges: number[]

  /** Current gym accessible to player (1-5) */
  currentGym: number

  /** Unix timestamp of last modification */
  timestamp: number
}

// =============================================================================
// Constants
// =============================================================================

export const PROGRESS_STORAGE_KEY = 'pkmn-progress' as const

export const DEFAULT_PROGRESS: Readonly<ProgressState> = {
  defeatedTrainers: [],
  earnedBadges: [],
  currentGym: 1,
  timestamp: 0
}

/** Total number of gyms in the game */
export const TOTAL_GYMS = 5 as const

/** Gym Leader names by ID for display */
export const GYM_LEADER_NAMES: Record<number, string> = {
  1: 'José',
  2: 'Manuel',
  3: 'Rafael',
  4: 'Sofía',
  5: 'Valeria'
}

// =============================================================================
// Pinia Store Interface
// =============================================================================

export interface ProgressStoreState {
  progress: ProgressState
  isLoaded: boolean
  lastError: string | null
}

export interface ProgressStoreGetters {
  /** Current gym leader name */
  currentGymLeaderName: string

  /** Number of badges earned */
  badgeCount: number

  /** Whether player has completed all gyms */
  isGameComplete: boolean

  /** Whether specific NPC is defeated */
  isNpcDefeated: (npcId: string) => boolean

  /** Whether specific gym leader is defeated */
  isGymLeaderDefeated: (gymId: number) => boolean

  /** Whether gym leader is challengeable (all NPCs defeated) */
  isGymLeaderUnlocked: (gymId: number) => boolean
}

export interface ProgressStoreActions {
  /** Load progress from LocalStorage */
  loadProgress: () => void

  /** Save current progress to LocalStorage */
  saveProgress: () => void

  /** Mark a Thematic NPC as defeated */
  defeatTrainer: (npcId: string) => void

  /** Mark a Gym Leader as defeated, earn badge, unlock next gym */
  defeatGymLeader: (gymId: number) => void

  /** Reset all progress (new game) */
  resetProgress: () => void

  /** Handle corrupted data - clear and reset */
  handleCorruptedData: () => void
}

// =============================================================================
// Validation
// =============================================================================

export function isValidProgressState(data: unknown): data is ProgressState {
  if (!data || typeof data !== 'object') return false

  const state = data as ProgressState

  return (
    Array.isArray(state.defeatedTrainers) &&
    state.defeatedTrainers.every(id => typeof id === 'string') &&
    Array.isArray(state.earnedBadges) &&
    state.earnedBadges.every(id => typeof id === 'number' && id >= 1 && id <= 5) &&
    typeof state.currentGym === 'number' &&
    state.currentGym >= 1 &&
    state.currentGym <= 5 &&
    typeof state.timestamp === 'number'
  )
}

// =============================================================================
// LocalStorage Operations
// =============================================================================

export interface ProgressPersistence {
  /** Load from LocalStorage, returns DEFAULT_PROGRESS if invalid/missing */
  load: () => ProgressState

  /** Save to LocalStorage */
  save: (state: ProgressState) => void

  /** Clear LocalStorage progress */
  clear: () => void

  /** Check if progress exists in LocalStorage */
  exists: () => boolean
}
