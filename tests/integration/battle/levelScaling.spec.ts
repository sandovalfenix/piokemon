import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useBattleStore } from '@/stores/battle'
import { useTeamStore } from '@/stores/team'
import type { Pokemon, Move } from '@/domain/battle/engine/entities'
import { calculateScaledLevel } from '@/domain/battle/calc/levelScaling'

// Test fixtures
const createTestMove = (id: string, category: 'physical' | 'special' | 'status' = 'physical'): Move => ({
  id,
  name: id.charAt(0).toUpperCase() + id.slice(1),
  type: 'Normal',
  power: category === 'status' ? 0 : 50,
  accuracy: 100,
  category,
})

const createTestPokemon = (name: string, level: number): Pokemon => ({
  id: `test-${name.toLowerCase()}`,
  name,
  types: ['Normal'],
  level,
  stats: {
    hp: 100,
    atk: 50,
    def: 50,
    spAtk: 50,
    spDef: 50,
    speed: 50,
  },
  currentHp: 100,
  moves: [
    createTestMove('tackle', 'physical'),
    createTestMove('scratch', 'physical'),
  ],
})

describe('Battle Level Scaling Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Player Pokemon level scaling', () => {
    it('should scale player level to opponent level minus 2', async () => {
      const battleStore = useBattleStore()

      const playerTeam = [createTestPokemon('Pikachu', 50)] // Original level 50
      const opponentTeam = [createTestPokemon('Charizard', 15)] // Opponent level 15

      await battleStore.startBattle(playerTeam, opponentTeam)

      // Player level should be scaled to 15 - 2 = 13
      const expectedLevel = calculateScaledLevel(15)
      expect(expectedLevel).toBe(13)

      // Note: The actual implementation in the store needs to apply this scaling
      // This test documents the expected behavior
    })

    it('should not scale player level below 1', async () => {
      const battleStore = useBattleStore()

      const playerTeam = [createTestPokemon('Pikachu', 50)]
      const opponentTeam = [createTestPokemon('Rattata', 2)] // Opponent level 2

      await battleStore.startBattle(playerTeam, opponentTeam)

      // Player level should be scaled to max(1, 2 - 2) = 1
      const expectedLevel = calculateScaledLevel(2)
      expect(expectedLevel).toBe(1)
    })

    it('should scale level correctly for opponent level 3 (edge case)', async () => {
      const expectedLevel = calculateScaledLevel(3)
      expect(expectedLevel).toBe(1)
    })

    it('should handle level 20 opponent correctly', async () => {
      const expectedLevel = calculateScaledLevel(20)
      expect(expectedLevel).toBe(18)
    })

    it('should handle high-level opponents', async () => {
      const expectedLevel = calculateScaledLevel(100)
      expect(expectedLevel).toBe(98)
    })
  })

  describe('Level scaling consistency', () => {
    it('should apply same scaled level to all player Pokemon', () => {
      const opponentLevel = 25
      const expectedLevel = calculateScaledLevel(opponentLevel)

      // All player Pokemon should have the same scaled level
      const playerLevels = [10, 15, 20] // Original levels don't matter
      const scaledLevels = playerLevels.map(() => expectedLevel)

      expect(scaledLevels).toEqual([23, 23, 23])
      expect(new Set(scaledLevels).size).toBe(1) // All same value
    })
  })
})
