import type { Type } from '../engine/entities'
import { TYPE_CHART } from '@/data/typeChart'
import { useTypeChartStore } from '@/stores/typeChart'

export function computeTypeMultiplier(attacking: Type, defending: Type | [Type, Type?]): 0 | 0.5 | 1 | 2 {
  const defendingTypes = Array.isArray(defending) ? defending : [defending]

  // Get type chart from store if available, otherwise use fallback
  let typeChart = TYPE_CHART
  try {
    const typeChartStore = useTypeChartStore()
    if (typeChartStore.typeChart) {
      typeChart = typeChartStore.typeChart
    }
  } catch {
    // If store is not available (e.g., during testing), use hardcoded fallback
  }

  let multiplier = 1
  for (const defType of defendingTypes) {
    if (!defType) continue
    const chart = typeChart[attacking]
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
