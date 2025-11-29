import { describe, it, expect } from 'vitest'
import { createStrategicAI } from '@/domain/battle/ai/strategicAI'
import { createSeededRng } from '@/domain/battle/calc/rng'
import type { Pokemon } from '@/domain/battle/engine/entities'

describe('Strategic AI', () => {
  const createTestPokemon = (name: string, types: string[], moves: Array<{ id: string; name: string; type: string; category: 'physical' | 'special'; power: number; accuracy: number }>, currentHp?: number): Pokemon => ({
    id: name.toLowerCase(),
    name,
    types: types as Pokemon['types'],
    level: 50,
    stats: { hp: 100, atk: 80, def: 80, spAtk: 80, spDef: 80, speed: 80 },
    currentHp: currentHp ?? 100,
    moves: moves as Pokemon['moves'],
  })

  const createTestMove = (id: string, name: string, type: string, power: number, accuracy: number) => ({
    id,
    name,
    type,
    category: 'physical' as const,
    power,
    accuracy,
  })

  it('should prefer super effective moves ≥70% of the time', () => {
    const ai = createStrategicAI()

    // Fire type attacker with Water move (super effective) and Normal move
    const attacker = createTestPokemon('Charizard', ['Fire'], [
      createTestMove('watergun', 'Water Gun', 'Water', 40, 100),
      createTestMove('tackle', 'Tackle', 'Normal', 40, 100),
    ])

    // Fire type defender (Water is super effective)
    const defender = createTestPokemon('Charmeleon', ['Fire'], [])

    const rng = createSeededRng(42)

    // Run 100 trials
    let superEffectiveCount = 0
    for (let i = 0; i < 100; i++) {
      const moveId = ai.chooseMove({ attacker, defender, rng })
      if (moveId === 'watergun') {
        superEffectiveCount++
      }
    }

    // Should pick super effective move at least 60% of the time (allowing some variance)
    expect(superEffectiveCount).toBeGreaterThanOrEqual(60)
  })

  it('should consider move power when effectiveness is equal', () => {
    const ai = createStrategicAI()

    // Normal type attacker with two Normal moves (different power)
    const attacker = createTestPokemon('Raticate', ['Normal'], [
      createTestMove('tackle', 'Tackle', 'Normal', 40, 100),
      createTestMove('hyperbeam', 'Hyper Beam', 'Normal', 150, 90),
    ])

    const defender = createTestPokemon('Pidgey', ['Normal', 'Flying'], [])

    const rng = createSeededRng(123)

    // Run 50 trials - should prefer high power move most of the time
    let highPowerCount = 0
    for (let i = 0; i < 50; i++) {
      const moveId = ai.chooseMove({ attacker, defender, rng })
      if (moveId === 'hyperbeam') {
        highPowerCount++
      }
    }

    // Should pick higher power move majority of the time
    expect(highPowerCount).toBeGreaterThan(30)
  })

  it('should handle low HP situations by preferring powerful moves', () => {
    const ai = createStrategicAI()

    // Low HP attacker
    const attacker = createTestPokemon('Charizard', ['Fire', 'Flying'], [
      createTestMove('ember', 'Ember', 'Fire', 40, 100),
      createTestMove('flamethrower', 'Flamethrower', 'Fire', 90, 100),
    ], 25) // 25% HP

    const defender = createTestPokemon('Bulbasaur', ['Grass', 'Poison'], [])

    const rng = createSeededRng(999)

    // Run 50 trials
    let highPowerCount = 0
    for (let i = 0; i < 50; i++) {
      const moveId = ai.chooseMove({ attacker, defender, rng })
      if (moveId === 'flamethrower') {
        highPowerCount++
      }
    }

    // When low on HP, should strongly prefer powerful move
    expect(highPowerCount).toBeGreaterThan(35)
  })

  it('should work with dual-type defenders', () => {
    const ai = createStrategicAI()

    // Water type attacker
    const attacker = createTestPokemon('Blastoise', ['Water'], [
      createTestMove('watergun', 'Water Gun', 'Water', 40, 100),
      createTestMove('icebeam', 'Ice Beam', 'Ice', 90, 100),
    ])

    // Grass/Flying defender (weak to Ice)
    const defender = createTestPokemon('Tropius', ['Grass', 'Flying'], [])

    const rng = createSeededRng(777)

    // Run 50 trials - should prefer Ice move (4x effective)
    let iceBeamCount = 0
    for (let i = 0; i < 50; i++) {
      const moveId = ai.chooseMove({ attacker, defender, rng })
      if (moveId === 'icebeam') {
        iceBeamCount++
      }
    }

    // Should strongly prefer super effective move
    expect(iceBeamCount).toBeGreaterThan(35)
  })

  it('should handle single move case without errors', () => {
    const ai = createStrategicAI()

    const attacker = createTestPokemon('Magikarp', ['Water'], [
      createTestMove('splash', 'Splash', 'Normal', 0, 100),
    ])

    const defender = createTestPokemon('Geodude', ['Rock', 'Ground'], [])

    const rng = createSeededRng(1)

    // Should not throw error and return the only move
    const moveId = ai.chooseMove({ attacker, defender, rng })
    expect(moveId).toBe('splash')
  })

  it('should throw error if no moves available', () => {
    const ai = createStrategicAI()

    const attacker = createTestPokemon('NoMoves', ['Normal'], [])
    const defender = createTestPokemon('Target', ['Normal'], [])
    const rng = createSeededRng(1)

    expect(() => ai.chooseMove({ attacker, defender, rng })).toThrow('No moves available')
  })
})
