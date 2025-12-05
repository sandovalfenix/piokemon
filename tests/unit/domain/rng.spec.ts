import { describe, it, expect } from 'vitest'
import { createSeededRng } from '@/domain/battle/calc/rng'

describe('RNG', () => {
  it('should produce deterministic results with same seed', () => {
    const rng1 = createSeededRng(12345)
    const rng2 = createSeededRng(12345)

    const values1 = Array.from({ length: 10 }, () => rng1.next())
    const values2 = Array.from({ length: 10 }, () => rng2.next())

    expect(values1).toEqual(values2)
  })

  it('should produce different results with different seeds', () => {
    const rng1 = createSeededRng(11111)
    const rng2 = createSeededRng(22222)

    const values1 = Array.from({ length: 10 }, () => rng1.next())
    const values2 = Array.from({ length: 10 }, () => rng2.next())

    expect(values1).not.toEqual(values2)
  })

  it('should produce values between 0 and 1', () => {
    const rng = createSeededRng(999)
    const values = Array.from({ length: 100 }, () => rng.next())

    values.forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThanOrEqual(1)
    })
  })

  it('should handle string seeds', () => {
    const rng1 = createSeededRng('test')
    const rng2 = createSeededRng('test')

    expect(rng1.next()).toEqual(rng2.next())
  })
})
