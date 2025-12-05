/**
 * Team Cache Service
 * Feature: 003-pokemon-team-builder
 *
 * localStorage persistence for team roster with validation
 */

import type { Team, ValidationResult } from '@/models/teamBuilder'

const TEAM_STORAGE_KEY = 'pokemon-team-v1'
const CURRENT_SCHEMA_VERSION = 1

/**
 * Validate team data integrity
 * Per data-model.md validation rules
 */
function validateTeam(team: Team): ValidationResult {
  const errors: string[] = []

  // Check team size
  if (team.members.length === 0) {
    errors.push('Team must have at least 1 Pokemon')
  }
  if (team.members.length > 6) {
    errors.push('Team cannot exceed 6 Pokemon')
  }

  // Check schema version
  if (team.version !== CURRENT_SCHEMA_VERSION) {
    errors.push(`Unsupported team schema version: ${team.version}`)
  }

  // Check each member
  team.members.forEach((member, index) => {
    if (member.selectedMoves.length === 0) {
      errors.push(`Pokemon at position ${index} has no moves`)
    }
    if (member.selectedMoves.length > 4) {
      errors.push(`Pokemon at position ${index} has too many moves (max 4)`)
    }
    if (member.position !== index) {
      errors.push(`Pokemon position mismatch at index ${index}`)
    }
  })

  // Check for duplicate positions
  const positions = team.members.map((m) => m.position)
  const uniquePositions = new Set(positions)
  if (positions.length !== uniquePositions.size) {
    errors.push('Duplicate Pokemon positions detected')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Save team to localStorage
 * Handles quota exceeded errors gracefully
 * @param team - Team to save
 * @returns true if saved successfully, false if failed
 */
export function saveTeamToLocalStorage(team: Team): boolean {
  try {
    const json = JSON.stringify(team)
    localStorage.setItem(TEAM_STORAGE_KEY, json)
    console.log('[TeamCache] Team saved to localStorage')
    return true
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'QuotaExceededError') {
        console.error('[TeamCache] localStorage quota exceeded, cannot save team')
      } else {
        console.error('[TeamCache] Error saving team:', error.message)
      }
    }
    return false
  }
}

/**
 * Load team from localStorage with validation
 * @returns Team if valid, null if not found or invalid
 */
export function loadTeamFromLocalStorage(): Team | null {
  try {
    const raw = localStorage.getItem(TEAM_STORAGE_KEY)
    if (!raw) {
      console.log('[TeamCache] No team found in localStorage')
      return null
    }

    const data = JSON.parse(raw) as Team

    // Validate schema
    const validationResult = validateTeam(data)
    if (!validationResult.valid) {
      console.error('[TeamCache] Invalid team data:', validationResult.errors)
      return null
    }

    console.log('[TeamCache] Team loaded from localStorage')
    return data
  } catch (error) {
    if (error instanceof Error) {
      console.error('[TeamCache] Error loading team:', error.message)
    }
    return null
  }
}

/**
 * Clear team from localStorage
 */
export function clearTeamFromLocalStorage(): void {
  try {
    localStorage.removeItem(TEAM_STORAGE_KEY)
    console.log('[TeamCache] Team cleared from localStorage')
  } catch (error) {
    if (error instanceof Error) {
      console.error('[TeamCache] Error clearing team:', error.message)
    }
  }
}

/**
 * Check if team exists in localStorage
 */
export function hasTeamInLocalStorage(): boolean {
  return localStorage.getItem(TEAM_STORAGE_KEY) !== null
}
