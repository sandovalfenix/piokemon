import { describe, it, expect } from 'vitest'
import {
  filterUsableMoves,
  isUsableMove,
  hasUsableMoves,
  countUsableMoves,
  filterStatusMoves,
  DAMAGING_CATEGORIES,
  EXCLUDED_CATEGORY,
} from '@/domain/battle/engine/moveFilter'
import type { Move, Category } from '@/domain/battle/engine/entities'

// Test fixtures
const createMove = (id: string, category: Category): Move => ({
  id,
  name: id.charAt(0).toUpperCase() + id.slice(1),
  type: 'Normal',
  power: category === 'status' ? 0 : 50,
  accuracy: 100,
  category,
})

const physicalMove = createMove('tackle', 'physical')
const specialMove = createMove('ember', 'special')
const statusMove = createMove('growl', 'status')

describe('Move Filter', () => {
  describe('constants', () => {
    it('should define damaging categories as physical and special', () => {
      expect(DAMAGING_CATEGORIES).toContain('physical')
      expect(DAMAGING_CATEGORIES).toContain('special')
      expect(DAMAGING_CATEGORIES).not.toContain('status')
    })

    it('should define excluded category as status', () => {
      expect(EXCLUDED_CATEGORY).toBe('status')
    })
  })

  describe('filterUsableMoves', () => {
    it('should keep physical and special moves', () => {
      const moves = [physicalMove, specialMove]
      const filtered = filterUsableMoves(moves)

      expect(filtered).toHaveLength(2)
      expect(filtered).toContain(physicalMove)
      expect(filtered).toContain(specialMove)
    })

    it('should exclude status moves', () => {
      const moves = [physicalMove, statusMove, specialMove]
      const filtered = filterUsableMoves(moves)

      expect(filtered).toHaveLength(2)
      expect(filtered).not.toContain(statusMove)
    })

    it('should return empty array if all moves are status', () => {
      const moves = [statusMove, createMove('leer', 'status')]
      const filtered = filterUsableMoves(moves)

      expect(filtered).toHaveLength(0)
    })

    it('should return empty array for empty input', () => {
      expect(filterUsableMoves([])).toEqual([])
    })

    it('should preserve original move objects', () => {
      const moves = [physicalMove, specialMove]
      const filtered = filterUsableMoves(moves)

      expect(filtered[0]).toBe(physicalMove)
      expect(filtered[1]).toBe(specialMove)
    })

    it('should handle mixed move set from typical Pokemon', () => {
      const mixedMoves = [
        createMove('tackle', 'physical'),
        createMove('growl', 'status'),
        createMove('water-gun', 'special'),
        createMove('tail-whip', 'status'),
      ]
      const filtered = filterUsableMoves(mixedMoves)

      expect(filtered).toHaveLength(2)
      expect(filtered.map((m) => m.category)).toEqual(['physical', 'special'])
    })
  })

  describe('isUsableMove', () => {
    it('should return true for physical moves', () => {
      expect(isUsableMove(physicalMove)).toBe(true)
    })

    it('should return true for special moves', () => {
      expect(isUsableMove(specialMove)).toBe(true)
    })

    it('should return false for status moves', () => {
      expect(isUsableMove(statusMove)).toBe(false)
    })
  })

  describe('hasUsableMoves', () => {
    it('should return true if at least one move is usable', () => {
      expect(hasUsableMoves([statusMove, physicalMove])).toBe(true)
      expect(hasUsableMoves([specialMove])).toBe(true)
    })

    it('should return false if no moves are usable', () => {
      expect(hasUsableMoves([statusMove])).toBe(false)
      expect(hasUsableMoves([])).toBe(false)
    })
  })

  describe('countUsableMoves', () => {
    it('should count only physical and special moves', () => {
      const moves = [physicalMove, statusMove, specialMove, createMove('leer', 'status')]
      expect(countUsableMoves(moves)).toBe(2)
    })

    it('should return 0 for empty array', () => {
      expect(countUsableMoves([])).toBe(0)
    })

    it('should return 0 if all moves are status', () => {
      expect(countUsableMoves([statusMove])).toBe(0)
    })
  })

  describe('filterStatusMoves', () => {
    it('should return only status moves', () => {
      const moves = [physicalMove, statusMove, specialMove]
      const statusOnly = filterStatusMoves(moves)

      expect(statusOnly).toHaveLength(1)
      expect(statusOnly[0]).toBe(statusMove)
    })

    it('should return empty array if no status moves', () => {
      expect(filterStatusMoves([physicalMove, specialMove])).toEqual([])
    })

    it('should be the inverse of filterUsableMoves for a complete moveset', () => {
      const allMoves = [physicalMove, statusMove, specialMove]
      const usable = filterUsableMoves(allMoves)
      const status = filterStatusMoves(allMoves)

      expect(usable.length + status.length).toBe(allMoves.length)
    })
  })
})
