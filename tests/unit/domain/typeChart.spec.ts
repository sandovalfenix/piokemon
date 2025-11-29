import { describe, it, expect } from 'vitest'
import { computeTypeMultiplier } from '@/domain/battle/calc/typeChart'

describe('Type Effectiveness', () => {
  it('should return 2x for super effective matchups', () => {
    expect(computeTypeMultiplier('Fire', 'Grass')).toBe(2)
    expect(computeTypeMultiplier('Water', 'Fire')).toBe(2)
    expect(computeTypeMultiplier('Electric', 'Water')).toBe(2)
    expect(computeTypeMultiplier('Grass', 'Water')).toBe(2)
  })

  it('should return 0.5x for not very effective matchups', () => {
    expect(computeTypeMultiplier('Fire', 'Water')).toBe(0.5)
    expect(computeTypeMultiplier('Water', 'Grass')).toBe(0.5)
    expect(computeTypeMultiplier('Electric', 'Grass')).toBe(0.5)
    expect(computeTypeMultiplier('Grass', 'Fire')).toBe(0.5)
  })

  it('should return 0x for immune matchups', () => {
    expect(computeTypeMultiplier('Normal', 'Ghost')).toBe(0)
    expect(computeTypeMultiplier('Electric', 'Ground')).toBe(0)
    expect(computeTypeMultiplier('Fighting', 'Ghost')).toBe(0)
    expect(computeTypeMultiplier('Ground', 'Flying')).toBe(0)
  })

  it('should return 1x for neutral matchups', () => {
    expect(computeTypeMultiplier('Normal', 'Normal')).toBe(1)
    expect(computeTypeMultiplier('Fire', 'Electric')).toBe(1)
    expect(computeTypeMultiplier('Water', 'Electric')).toBe(1)
  })

  it('should handle dual type defenders', () => {
    // Grass/Poison vs Fire: 2x * 1x = 2x
    expect(computeTypeMultiplier('Fire', ['Grass', 'Poison'])).toBe(2)
    // Fighting vs Rock/Dark: 2x * 2x = 4x (clamped to 2x)
    expect(computeTypeMultiplier('Fighting', ['Rock', 'Dark'])).toBe(2)
  })
})
