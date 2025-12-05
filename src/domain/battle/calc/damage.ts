import type { Category } from '../engine/entities'
import type { Rng } from './rng'

/**
 * Calculate damage for a move
 * T012: Updated to support stat stage multipliers and status condition modifiers
 *
 * @param input - Damage calculation parameters
 * @returns Calculated damage (minimum 0)
 */
export function calculateDamage(input: {
  level: number
  power: number
  atk: number
  def: number
  category: Category
  multiplier: number
  rng: Rng
  /** Optional: Attacker's stat stage multiplier for atk/spAtk (default 1.0) */
  atkStageMultiplier?: number
  /** Optional: Defender's stat stage multiplier for def/spDef (default 1.0) */
  defStageMultiplier?: number
  /** Optional: Attack modifier from status (burn halves physical attack) */
  statusAtkModifier?: number
}): number {
  // Apply stat stage multipliers (T012)
  const atkStage = input.atkStageMultiplier ?? 1.0
  const defStage = input.defStageMultiplier ?? 1.0
  const statusMod = input.statusAtkModifier ?? 1.0

  // Calculate effective attack and defense with stage modifiers
  const effectiveAtk = Math.floor(input.atk * atkStage * statusMod)
  const effectiveDef = Math.floor(input.def * defStage)

  // Minimal placeholder using inputs to satisfy lint and provide a baseline.
  // Applies base formula shape and random factor 0.85–1.0, rounded down.
  const levelFactor = Math.floor((2 * input.level) / 5 + 2)
  const base = Math.floor(((levelFactor * input.power * effectiveAtk) / Math.max(1, effectiveDef)) / 50) + 2
  const rand = 0.85 + input.rng.next() * 0.15
  const total = Math.floor(base * input.multiplier * rand)
  return Math.max(0, total)
}
