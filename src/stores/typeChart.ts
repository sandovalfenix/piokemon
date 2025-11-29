/**
 * Type Chart Store - Pinia store managing type chart state
 * Feature: 002-pokeapi-type-integration
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { TypeEffectivenessMap } from '@/services/typeChart/types'
import { loadTypeChart as loadTypeChartService, refreshTypeChart as refreshTypeChartService } from '@/services/typeChart/typeChartService'
import { TYPE_CHART } from '@/data/typeChart'

export const useTypeChartStore = defineStore('typeChart', () => {
  // State
  const typeChart = ref<TypeEffectivenessMap>(TYPE_CHART)
  const isLoading = ref(false)
  const source = ref<'api' | 'cache' | 'fallback'>('fallback')
  const error = ref<string | null>(null)
  const lastUpdated = ref<string | null>(null)

  // Actions
  async function loadTypeChart() {
    if (isLoading.value) {
      console.log('[TypeChartStore] Load already in progress, skipping')
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const result = await loadTypeChartService()

      if (result.success && result.data) {
        typeChart.value = result.data
        source.value = result.source
        lastUpdated.value = new Date().toISOString()

        console.log(`[TypeChartStore] Type chart loaded from: ${result.source}`)
      } else {
        error.value = result.error || 'Failed to load type chart'
        console.warn('[TypeChartStore] Failed to load type chart:', error.value)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      console.error('[TypeChartStore] Error loading type chart:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function refreshTypeChart() {
    isLoading.value = true
    error.value = null

    try {
      const result = await refreshTypeChartService()

      if (result.success && result.data) {
        typeChart.value = result.data
        source.value = result.source
        lastUpdated.value = new Date().toISOString()

        console.log(`[TypeChartStore] Type chart refreshed from: ${result.source}`)
      } else {
        error.value = result.error || 'Failed to refresh type chart'
        console.warn('[TypeChartStore] Failed to refresh type chart:', error.value)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      console.error('[TypeChartStore] Error refreshing type chart:', err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    typeChart,
    isLoading,
    source,
    error,
    lastUpdated,
    
    // Actions
    loadTypeChart,
    refreshTypeChart,
  }
})
