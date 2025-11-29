<template>
  <div
    class="p-3 bg-slate-100 dark:bg-slate-800 rounded min-h-32 max-h-48 overflow-y-auto"
    role="log"
    aria-live="polite"
    aria-atomic="false"
    aria-label="Battle log"
  >
    <p v-if="battleStore.log.length === 0" class="text-sm text-slate-500 dark:text-slate-400">
      Battle messages will appear here.
    </p>
    <div
      v-for="(msg, i) in battleStore.log"
      :key="i"
      :class="['text-sm py-0.5 dark:text-white', getMessageClass(msg)]"
    >
      {{ msg }}
    </div>
  </div>

  <!-- Screen reader announcement region for critical messages -->
  <div
    role="status"
    aria-live="assertive"
    aria-atomic="true"
    class="sr-only"
  >
    {{ lastCriticalMessage }}
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useBattleStore } from '@/stores/battle'

const battleStore = useBattleStore()

/**
 * Get CSS class for message based on content
 * This provides visual indication of message type
 */
const getMessageClass = (message: string): string => {
  if (message.includes('super effective')) {
    return 'text-green-600 dark:text-green-400 font-semibold'
  }
  if (message.includes('not very effective')) {
    return 'text-red-600 dark:text-red-400'
  }
  if (message.includes('missed')) {
    return 'text-gray-500 dark:text-gray-400 italic'
  }
  if (message.includes('fainted') || message.includes('wins')) {
    return 'font-bold text-purple-600 dark:text-purple-400'
  }
  return ''
}

/**
 * Last critical message for assertive ARIA live region
 * Announces only win/lose and faint messages
 */
const lastCriticalMessage = computed(() => {
  const log = battleStore.log
  if (log.length === 0) return ''

  // Find the last critical message (win/lose/faint)
  for (let i = log.length - 1; i >= 0; i--) {
    const msg = log[i]
    if (msg?.includes('wins') || msg?.includes('fainted')) {
      return msg
    }
  }

  return ''
})
</script>
<style scoped>
/* Screen reader only class for ARIA announcements */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
