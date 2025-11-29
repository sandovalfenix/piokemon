import type { Type } from '../engine/entities'
import { TYPE_CHART } from '@/data/typeChart'

export function computeTypeMultiplier(attacking: Type, defending: Type | [Type, Type?]): 0 | 0.5 | 1 | 2 {
  const defendingTypes = Array.isArray(defending) ? defending : [defending]

  let multiplier = 1
  for (const defType of defendingTypes) {
    if (!defType) continue
    const chart = TYPE_CHART[attacking]
    if (chart && chart[defType] !== undefined) {
      multiplier *= chart[defType]
    }
  }

  // Clamp to valid multipliers
  if (multiplier === 0) return 0
  if (multiplier <= 0.25) return 0.5
  if (multiplier >= 4) return 2
  if (multiplier < 1) return 0.5
  if (multiplier > 1) return 2
  return 1
}
