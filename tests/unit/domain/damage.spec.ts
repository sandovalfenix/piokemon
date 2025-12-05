import { describe, it, expect } from 'vitest'
import { calculateDamage } from '@/domain/battle/calc/damage'
import { createSeededRng } from '@/domain/battle/calc/rng'

describe('Damage Calculation', () => {
  it('should calculate base damage correctly', () => {
    const rng = createSeededRng(42)
    const damage = calculateDamage({
      level: 50,
      power: 80,
      atk: 100,
      def: 100,
      category: 'physical',
      multiplier: 1,
      rng,
    })

    expect(damage).toBeGreaterThan(0)
    expect(damage).toBeLessThan(100) // Reasonable range
  })

  it('should apply type effectiveness multiplier', () => {
    const rng1 = createSeededRng(123)
    const rng2 = createSeededRng(123)

    const normalDamage = calculateDamage({
      level: 50,
      power: 50,
      atk: 80,
      def: 80,
      category: 'physical',
      multiplier: 1,
      rng: rng1,
    })

    const superEffective = calculateDamage({
      level: 50,
      power: 50,
      atk: 80,
      def: 80,
      category: 'physical',
      multiplier: 2,
      rng: rng2,
    })

    expect(superEffective).toBeGreaterThan(normalDamage)
  })

  it('should return 0 for immune matchups', () => {
    const rng = createSeededRng(999)
    const damage = calculateDamage({
      level: 50,
      power: 100,
      atk: 150,
      def: 50,
      category: 'physical',
      multiplier: 0,
      rng,
    })

    expect(damage).toBe(0)
  })

  it('should be deterministic with same RNG seed', () => {
    const damages = Array.from({ length: 5 }, () => {
      const rng = createSeededRng(777)
      return calculateDamage({
        level: 50,
        power: 60,
        atk: 90,
        def: 70,
        category: 'special',
        multiplier: 1,
        rng,
      })
    })

    const first = damages[0]
    damages.forEach((d) => expect(d).toBe(first))
  })

  it('should have variation from random factor', () => {
    const damages = Array.from({ length: 100 }, (_, i) => {
      const rng = createSeededRng(1000 + i)
      return calculateDamage({
        level: 50,
        power: 80,
        atk: 120,
        def: 80,
        category: 'physical',
        multiplier: 1,
        rng,
      })
    })

    const min = Math.min(...damages)
    const max = Math.max(...damages)

    // Should have variation due to random factor (0.85 to 1.0)
    expect(max).toBeGreaterThan(min)
  })
})
