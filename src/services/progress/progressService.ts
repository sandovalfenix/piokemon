/**
 * Progress Service
 * Feature: 006-battle-module-update
 *
 * Service functions for progress persistence via LocalStorage
 */

import type { ProgressState } from '@/models/progressState'
import {
  DEFAULT_PROGRESS,
  PROGRESS_STORAGE_KEY,
  isValidProgressState,
} from '@/models/progressState'

/**
 * Save progress state to LocalStorage
 * @param progress - Progress state to save
 * @returns true if saved successfully, false otherwise
 */
export function saveProgress(progress: ProgressState): boolean {
  try {
    const toSave: ProgressState = {
      ...progress,
      timestamp: Date.now(),
    }
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(toSave))
    return true
  } catch (error) {
    console.error('[ProgressService] Failed to save progress:', error)
    return false
  }
}

/**
 * Load progress state from LocalStorage
 * @returns Loaded progress state or default state if not found/invalid
 */
export function loadProgress(): ProgressState {
  try {
    const stored = localStorage.getItem(PROGRESS_STORAGE_KEY)
    if (!stored) {
      return { ...DEFAULT_PROGRESS }
    }

    const parsed = JSON.parse(stored) as unknown
    if (isValidProgressState(parsed)) {
      return parsed
    }

    console.warn('[ProgressService] Invalid stored progress, returning defaults')
    return { ...DEFAULT_PROGRESS }
  } catch (error) {
    console.error('[ProgressService] Failed to load progress:', error)
    return { ...DEFAULT_PROGRESS }
  }
}

/**
 * Clear all progress from LocalStorage
 * @returns true if cleared successfully, false otherwise
 */
export function clearProgress(): boolean {
  try {
    localStorage.removeItem(PROGRESS_STORAGE_KEY)
    return true
  } catch (error) {
    console.error('[ProgressService] Failed to clear progress:', error)
    return false
  }
}

/**
 * Check if progress exists in LocalStorage
 * @returns true if valid progress exists
 */
export function hasStoredProgress(): boolean {
  try {
    const stored = localStorage.getItem(PROGRESS_STORAGE_KEY)
    if (!stored) return false

    const parsed = JSON.parse(stored) as unknown
    return isValidProgressState(parsed)
  } catch {
    return false
  }
}

/**
 * Export progress as JSON string (for backup/debugging)
 * @returns JSON string of current progress or null if none exists
 */
export function exportProgress(): string | null {
  try {
    const stored = localStorage.getItem(PROGRESS_STORAGE_KEY)
    if (!stored) return null

    // Validate before returning
    const parsed = JSON.parse(stored) as unknown
    if (!isValidProgressState(parsed)) return null

    return stored
  } catch {
    return null
  }
}

/**
 * Import progress from JSON string (for restore/debugging)
 * @param jsonString - JSON string of progress state
 * @returns true if imported successfully, false otherwise
 */
export function importProgress(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString) as unknown
    if (!isValidProgressState(parsed)) {
      console.error('[ProgressService] Invalid progress format for import')
      return false
    }

    return saveProgress(parsed)
  } catch (error) {
    console.error('[ProgressService] Failed to import progress:', error)
    return false
  }
}
