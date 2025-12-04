/**
 * Progress Store
 * Feature: 006-battle-module-update
 *
 * Pinia store for managing story progression state
 * Tracks defeated NPCs, earned badges, and current gym
 */

import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import type { ProgressState } from '@/models/progressState'
import {
  DEFAULT_PROGRESS,
  PROGRESS_STORAGE_KEY,
  isValidProgressState,
} from '@/models/progressState'
import { gymLeaders } from '@/data/gymLeaders'
import { getNpcsByGym, areGymNpcsDefeated } from '@/data/thematicNpcs'

const MAX_GYMS = 5

/**
 * Load progress from LocalStorage
 */
function loadProgressFromStorage(): ProgressState {
  try {
    const stored = localStorage.getItem(PROGRESS_STORAGE_KEY)
    if (!stored) {
      return { ...DEFAULT_PROGRESS }
    }

    const parsed = JSON.parse(stored) as unknown
    if (isValidProgressState(parsed)) {
      return parsed
    }

    console.warn('[ProgressStore] Invalid stored progress, using defaults')
    return { ...DEFAULT_PROGRESS }
  } catch (error) {
    console.error('[ProgressStore] Failed to load progress:', error)
    return { ...DEFAULT_PROGRESS }
  }
}

/**
 * Save progress to LocalStorage
 */
function saveProgressToStorage(progress: ProgressState): void {
  try {
    const toSave: ProgressState = {
      ...progress,
      timestamp: Date.now(),
    }
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(toSave))
  } catch (error) {
    console.error('[ProgressStore] Failed to save progress:', error)
  }
}

export const useProgressStore = defineStore('progress', () => {
  // State
  const defeatedTrainers = ref<string[]>([])
  const earnedBadges = ref<string[]>([])
  const currentGym = ref<number>(1)
  const timestamp = ref<number>(Date.now())

  // Initialize from LocalStorage
  const initialProgress = loadProgressFromStorage()
  defeatedTrainers.value = [...initialProgress.defeatedTrainers]
  earnedBadges.value = [...initialProgress.earnedBadges]
  currentGym.value = initialProgress.currentGym
  timestamp.value = initialProgress.timestamp

  // Computed: Check if NPC is defeated
  const isNpcDefeated = computed(() => {
    return (npcId: string): boolean => defeatedTrainers.value.includes(npcId)
  })

  // Computed: Check if Gym Leader is defeated
  const isGymLeaderDefeated = computed(() => {
    return (gymId: number): boolean => {
      const leader = gymLeaders.find((g) => g.id === gymId)
      if (!leader) return false
      return earnedBadges.value.includes(leader.badge)
    }
  })

  // Computed: Check if player can challenge gym leader
  const canChallengeGymLeader = computed(() => {
    return (gymId: number): boolean => {
      // Can't challenge gym if already beaten
      if (isGymLeaderDefeated.value(gymId)) return false

      // Can only challenge current gym's leader
      if (gymId !== currentGym.value) return false

      // Must defeat all NPCs for this gym first
      return areGymNpcsDefeated(gymId, defeatedTrainers.value)
    }
  })

  // Computed: Get current gym leader
  const currentGymLeader = computed(() => {
    return gymLeaders.find((g) => g.id === currentGym.value) ?? null
  })

  // Computed: Get available challenges (NPCs and gym leader)
  const getAvailableChallenges = computed(() => {
    const challenges: Array<{
      type: 'npc' | 'gym-leader'
      id: string | number
      name: string
      gymId: number
      isAvailable: boolean
    }> = []

    // Get NPCs for current gym
    const npcs = getNpcsByGym(currentGym.value)
    for (const npc of npcs) {
      const defeated = isNpcDefeated.value(npc.id)
      challenges.push({
        type: 'npc',
        id: npc.id,
        name: npc.name,
        gymId: npc.gymId,
        isAvailable: !defeated,
      })
    }

    // Add gym leader if NPCs are defeated
    const leader = currentGymLeader.value
    if (leader) {
      const canChallenge = canChallengeGymLeader.value(leader.id)
      challenges.push({
        type: 'gym-leader',
        id: leader.id,
        name: leader.name,
        gymId: leader.id,
        isAvailable: canChallenge,
      })
    }

    return challenges
  })

  // Computed: Game completion status
  const isGameComplete = computed(() => {
    return currentGym.value > MAX_GYMS || earnedBadges.value.length >= MAX_GYMS
  })

  // Computed: Progress percentage
  const progressPercentage = computed(() => {
    const totalBadges = MAX_GYMS
    return Math.round((earnedBadges.value.length / totalBadges) * 100)
  })

  // Action: Defeat NPC
  function defeatNpc(npcId: string): void {
    if (defeatedTrainers.value.includes(npcId)) {
      console.warn(`[ProgressStore] NPC ${npcId} already defeated`)
      return
    }

    defeatedTrainers.value.push(npcId)
    timestamp.value = Date.now()
  }

  // Action: Defeat Gym Leader
  function defeatGymLeader(gymId: number): void {
    const leader = gymLeaders.find((g) => g.id === gymId)
    if (!leader) {
      console.error(`[ProgressStore] Invalid gym ID: ${gymId}`)
      return
    }

    if (earnedBadges.value.includes(leader.badge)) {
      console.warn(`[ProgressStore] Badge ${leader.badge} already earned`)
      return
    }

    // Award badge
    earnedBadges.value.push(leader.badge)

    // Advance to next gym (up to MAX_GYMS)
    if (currentGym.value < MAX_GYMS) {
      currentGym.value += 1
    } else {
      // Mark game as complete (currentGym beyond MAX_GYMS)
      currentGym.value = MAX_GYMS + 1
    }

    timestamp.value = Date.now()
  }

  // Action: Reset all progress
  function resetProgress(): void {
    defeatedTrainers.value = []
    earnedBadges.value = []
    currentGym.value = 1
    timestamp.value = Date.now()
    localStorage.removeItem(PROGRESS_STORAGE_KEY)
  }

  // Action: Load progress from storage (manual reload)
  function loadProgress(): void {
    const loaded = loadProgressFromStorage()
    defeatedTrainers.value = [...loaded.defeatedTrainers]
    earnedBadges.value = [...loaded.earnedBadges]
    currentGym.value = loaded.currentGym
    timestamp.value = loaded.timestamp
  }

  // Watch for changes and auto-save
  watch(
    () => ({
      defeatedTrainers: defeatedTrainers.value,
      earnedBadges: earnedBadges.value,
      currentGym: currentGym.value,
      timestamp: timestamp.value,
    }),
    (newProgress) => {
      saveProgressToStorage(newProgress)
    },
    { deep: true }
  )

  return {
    // State
    defeatedTrainers,
    earnedBadges,
    currentGym,
    timestamp,

    // Computed
    isNpcDefeated,
    isGymLeaderDefeated,
    canChallengeGymLeader,
    currentGymLeader,
    getAvailableChallenges,
    isGameComplete,
    progressPercentage,

    // Actions
    defeatNpc,
    defeatGymLeader,
    resetProgress,
    loadProgress,
  }
})
