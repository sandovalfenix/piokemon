import type { Category } from '../engine/entities'
import type { Rng } from './rng'

export function calculateDamage(input: {
  level: number
  power: number
  atk: number
  def: number
  category: Category
  multiplier: number
  rng: Rng
}): number {
  // Minimal placeholder using inputs to satisfy lint and provide a baseline.
  // Applies base formula shape and random factor 0.85–1.0, rounded down.
  const levelFactor = Math.floor((2 * input.level) / 5 + 2)
  const base = Math.floor(((levelFactor * input.power * input.atk) / Math.max(1, input.def)) / 50) + 2
  const rand = 0.85 + input.rng.next() * 0.15
  const total = Math.floor(base * input.multiplier * rand)
  return Math.max(0, total)
}
