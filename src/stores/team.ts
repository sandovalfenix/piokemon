/**
 * Team Builder Store
 * Feature: 003-pokemon-team-builder
 * Updated: 006-battle-module-update (hasStarter flag)
 *
 * Pinia store for managing Pokemon team roster
 */

import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import type { TeamMember, Team, ValidationResult, Pokemon } from '@/models/teamBuilder'
import {
  saveTeamToLocalStorage,
  loadTeamFromLocalStorage,
  clearTeamFromLocalStorage,
} from '@/services/teamBuilder'

const HAS_STARTER_KEY = 'pokemon-mmo-has-starter'

export const useTeamStore = defineStore('team', () => {
  // State
  const roster = ref<TeamMember[]>([])
  const selectedPokemon = ref<Pokemon | null>(null)
  const lastSavedAt = ref<Date | null>(null)
  const saveError = ref<string | null>(null)

  /** Feature 006: Flag to track if player has selected their starter */
  const hasStarter = ref<boolean>(localStorage.getItem(HAS_STARTER_KEY) === 'true')

  // Watch hasStarter and sync to localStorage
  watch(hasStarter, (newValue) => {
    localStorage.setItem(HAS_STARTER_KEY, newValue ? 'true' : 'false')
  })

  // Computed
  const teamSize = computed(() => roster.value.length)
  const isTeamFull = computed(() => roster.value.length >= 6)
  const isTeamEmpty = computed(() => roster.value.length === 0)
  const hasLeadPokemon = computed(() => {
    const lead = roster.value[0]
    return lead !== undefined && lead.selectedMoves.length > 0
  })

  /**
   * Feature 006: Set hasStarter flag when player confirms starter selection
   */
  function setHasStarter(value: boolean): void {
    hasStarter.value = value
    console.log(`[TeamStore] hasStarter set to ${value}`)
  }

  /**
   * Add Pokemon to roster
   * @param member - TeamMember to add
   * @returns ValidationResult
   */
  function addPokemon(member: TeamMember): ValidationResult {
    // Validate team size
    if (roster.value.length >= 6) {
      return {
        valid: false,
        errors: ['Team is full (max 6 Pokemon)'],
      }
    }

    // Validate no duplicate Pokemon
    const exists = roster.value.some((m) => m.pokemon.id === member.pokemon.id)
    if (exists) {
      return {
        valid: false,
        errors: [`${member.pokemon.name} is already in the team`],
      }
    }

    // Validate moves
    if (member.selectedMoves.length === 0) {
      return {
        valid: false,
        errors: ['Pokemon must have at least 1 move'],
      }
    }
    if (member.selectedMoves.length > 4) {
      return {
        valid: false,
        errors: ['Pokemon cannot have more than 4 moves'],
      }
    }

    // Add to roster with correct position
    const position = roster.value.length
    const teamMember: TeamMember = {
      ...member,
      position,
    }
    roster.value.push(teamMember)

    console.log(`[TeamStore] Added ${member.pokemon.name} at position ${position}`)
    return { valid: true, errors: [] }
  }

  /**
   * Remove Pokemon from roster
   * @param position - Position index to remove
   */
  function removePokemon(position: number): void {
    if (position < 0 || position >= roster.value.length) {
      console.error(`[TeamStore] Invalid position: ${position}`)
      return
    }

    const removed = roster.value[position]
    if (!removed) return

    roster.value.splice(position, 1)

    // Reindex positions
    roster.value.forEach((member, index) => {
      member.position = index
    })

  }

  /**
   * Reorder team by moving Pokemon
   * @param fromPosition - Current position
   * @param toPosition - Target position
   */
  function reorderTeam(fromPosition: number, toPosition: number): void {
    if (
      fromPosition < 0 ||
      fromPosition >= roster.value.length ||
      toPosition < 0 ||
      toPosition >= roster.value.length
    ) {
      console.error(`[TeamStore] Invalid positions: ${fromPosition} -> ${toPosition}`)
      return
    }

    const [movedMember] = roster.value.splice(fromPosition, 1)
    if (!movedMember) return

    roster.value.splice(toPosition, 0, movedMember)

    // Reindex positions
    roster.value.forEach((member, index) => {
      member.position = index
    })

    console.log(`[TeamStore] Moved Pokemon from position ${fromPosition} to ${toPosition}`)
  }

  /**
   * Clear entire roster
   */
  function clearTeam(): void {
    roster.value = []
    saveError.value = null
    console.log('[TeamStore] Team cleared')
  }

  /**
   * Save team to localStorage
   */
  function saveTeam(): boolean {
    if (roster.value.length === 0) {
      console.warn('[TeamStore] Cannot save empty team')
      return false
    }

    const team: Team = {
      members: roster.value,
      createdAt: lastSavedAt.value ? lastSavedAt.value.getTime() : Date.now(),
      updatedAt: Date.now(),
      version: 1,
    }

    const success = saveTeamToLocalStorage(team)
    if (success) {
      lastSavedAt.value = new Date()
      saveError.value = null
      console.log('[TeamStore] Team saved successfully')
    } else {
      saveError.value = 'Failed to save team to localStorage (quota exceeded)'
      console.error('[TeamStore] Failed to save team')
    }

    return success
  }

  /**
   * Load team from localStorage
   */
  function loadTeam(): boolean {
    const team = loadTeamFromLocalStorage()
    if (!team) {
      console.log('[TeamStore] No team to load')
      return false
    }

    roster.value = team.members
    lastSavedAt.value = new Date(team.updatedAt)
    saveError.value = null
    console.log('[TeamStore] Team loaded successfully')
    return true
  }

  /**
   * Delete team from localStorage
   */
  function deleteTeam(): void {
    clearTeamFromLocalStorage()
    clearTeam()
    lastSavedAt.value = null
    console.log('[TeamStore] Team deleted from localStorage')
  }

  /**
   * Set selected Pokemon for move selection
   * Task: T025
   */
  function selectPokemon(pokemon: Pokemon | null): void {
    selectedPokemon.value = pokemon
    if (pokemon) {
      console.log(`[TeamStore] Selected Pokemon: ${pokemon.name}`)
    } else {
      console.log('[TeamStore] Cleared Pokemon selection')
    }
  }

  /**
   * Heal all team members to full HP
   * Feature: 006-battle-module-update (T032)
   */
  function healTeam(): void {
    roster.value.forEach((member) => {
      member.currentHp = member.maxHp
    })
    saveTeam()
    console.log('[TeamStore] Team healed to full HP')
  }

  return {
    // State
    roster,
    selectedPokemon,
    lastSavedAt,
    saveError,
    hasStarter,

    // Computed
    teamSize,
    isTeamFull,
    isTeamEmpty,
    hasLeadPokemon,

    // Actions
    addPokemon,
    removePokemon,
    reorderTeam,
    clearTeam,
    saveTeam,
    loadTeam,
    deleteTeam,
    selectPokemon,
    setHasStarter,
    healTeam,
  }
})
