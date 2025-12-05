import { describe, it, expect } from 'vitest'
import {
  calculateScaledLevel,
  calculateTeamAverageLevel,
  calculateWildPokemonLevel,
  scaleTeamLevels,
  MIN_LEVEL,
  LEVEL_SCALING_OFFSET,
} from '@/domain/battle/calc/levelScaling'

describe('Level Scaling', () => {
  describe('calculateScaledLevel', () => {
    it('should return opponent level minus 2 for normal levels', () => {
      expect(calculateScaledLevel(20)).toBe(18)
      expect(calculateScaledLevel(15)).toBe(13)
      expect(calculateScaledLevel(10)).toBe(8)
    })

    it('should return minimum level 1 for low opponent levels', () => {
      expect(calculateScaledLevel(3)).toBe(1)
      expect(calculateScaledLevel(2)).toBe(1)
      expect(calculateScaledLevel(1)).toBe(1)
    })

    it('should handle edge case at level 3 (scales to 1)', () => {
      const scaled = calculateScaledLevel(3)
      expect(scaled).toBe(1)
      expect(scaled).toBe(Math.max(MIN_LEVEL, 3 - LEVEL_SCALING_OFFSET))
    })

    it('should never return less than 1', () => {
      // Test a range of values including edge cases
      for (let level = 1; level <= 100; level++) {
        expect(calculateScaledLevel(level)).toBeGreaterThanOrEqual(MIN_LEVEL)
      }
    })

    it('should handle invalid inputs gracefully', () => {
      expect(calculateScaledLevel(0)).toBe(MIN_LEVEL)
      expect(calculateScaledLevel(-5)).toBe(MIN_LEVEL)
      expect(calculateScaledLevel(1.5)).toBe(MIN_LEVEL) // Non-integer
    })

    it('should maintain consistent offset for levels above 3', () => {
      expect(calculateScaledLevel(5) - calculateScaledLevel(4)).toBe(1)
      expect(calculateScaledLevel(50) - calculateScaledLevel(49)).toBe(1)
    })
  })

  describe('calculateTeamAverageLevel', () => {
    it('should return average level rounded down', () => {
      expect(calculateTeamAverageLevel([10, 12, 14])).toBe(12)
      expect(calculateTeamAverageLevel([10, 11, 12])).toBe(11) // (10+11+12)/3 = 11
    })

    it('should return 1 for empty team', () => {
      expect(calculateTeamAverageLevel([])).toBe(MIN_LEVEL)
    })

    it('should handle single Pokemon team', () => {
      expect(calculateTeamAverageLevel([15])).toBe(15)
      expect(calculateTeamAverageLevel([1])).toBe(1)
    })

    it('should round down for non-integer averages', () => {
      // (10 + 11) / 2 = 10.5 -> 10
      expect(calculateTeamAverageLevel([10, 11])).toBe(10)
      // (10 + 12 + 13) / 3 = 11.67 -> 11
      expect(calculateTeamAverageLevel([10, 12, 13])).toBe(11)
    })

    it('should handle full team of 6', () => {
      const fullTeam = [10, 11, 12, 13, 14, 15]
      // Average: (10+11+12+13+14+15) / 6 = 75 / 6 = 12.5 -> 12
      expect(calculateTeamAverageLevel(fullTeam)).toBe(12)
    })
  })

  describe('calculateWildPokemonLevel', () => {
    it('should return team average minus 2 for normal levels', () => {
      expect(calculateWildPokemonLevel(15)).toBe(13)
      expect(calculateWildPokemonLevel(20)).toBe(18)
    })

    it('should return minimum level 3 for low team averages', () => {
      expect(calculateWildPokemonLevel(5)).toBe(3)
      expect(calculateWildPokemonLevel(4)).toBe(3)
      expect(calculateWildPokemonLevel(3)).toBe(3)
    })

    it('should never return less than 3 (wild Pokemon minimum)', () => {
      expect(calculateWildPokemonLevel(1)).toBe(3)
      expect(calculateWildPokemonLevel(2)).toBe(3)
      expect(calculateWildPokemonLevel(0)).toBe(3) // Invalid input
    })

    it('should handle invalid inputs gracefully', () => {
      expect(calculateWildPokemonLevel(-1)).toBe(3)
      expect(calculateWildPokemonLevel(1.5)).toBe(3) // Non-integer
    })
  })

  describe('scaleTeamLevels', () => {
    it('should scale all team members to the same level', () => {
      const originalLevels = [10, 15, 20]
      const opponentLevel = 15
      const scaled = scaleTeamLevels(originalLevels, opponentLevel)

      expect(scaled).toEqual([13, 13, 13])
      expect(scaled.every((l) => l === calculateScaledLevel(opponentLevel))).toBe(true)
    })

    it('should handle empty team', () => {
      expect(scaleTeamLevels([], 15)).toEqual([])
    })

    it('should handle single Pokemon', () => {
      expect(scaleTeamLevels([50], 20)).toEqual([18])
    })

    it('should respect minimum level constraint', () => {
      const scaled = scaleTeamLevels([10, 20, 30], 2)
      expect(scaled).toEqual([1, 1, 1])
    })
  })
})
