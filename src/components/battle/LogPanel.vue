<template>
  <div
    class="p-3 bg-black/30 backdrop-blur-md rounded-xl border border-white/10 shadow-xl min-h-32 max-h-48 overflow-y-auto"
    role="log"
    aria-live="polite"
    aria-atomic="false"
    aria-label="Battle log"
  >
    <p v-if="battleStore.log.length === 0" class="text-sm text-white/60">
      Battle messages will appear here.
    </p>
    <div
      v-for="(msg, i) in battleStore.log"
      :key="i"
      :class="['text-sm py-0.5 text-white/90', getMessageClass(msg)]"
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
  if (message.includes('súper efectivo') || message.includes('super effective')) {
    return 'text-green-400 font-semibold'
  }
  if (message.includes('No es muy efectivo') || message.includes('not very effective')) {
    return 'text-red-400'
  }
  if (message.includes('falló') || message.includes('missed')) {
    return 'text-white/50 italic'
  }
  if (message.includes('debilitó') || message.includes('fainted') || message.includes('Ganaste') || message.includes('Perdiste')) {
    return 'font-bold text-purple-400'
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
    if (msg?.includes('debilitó') || msg?.includes('Ganaste') || msg?.includes('Perdiste') || msg?.includes('fainted') || msg?.includes('wins')) {
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
/* AGREGADO: Scroll para battle-style */
.log-panel.battle-style {
  background: oklch(var(--color-card));
  border: 3px solid oklch(var(--color-border));
  border-radius: 6px;
  padding: 12px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
  min-height: auto;
  max-height: 108px; /* ALTURA MÁXIMA */
  overflow-y: auto; /* SCROLL ACTIVADO */
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Custom scrollbar para battle-style */
.log-panel.battle-style::-webkit-scrollbar {
  width: 4px;
}

.log-panel.battle-style::-webkit-scrollbar-track {
  background: oklch(var(--color-muted));
  border-radius: 2px;
}

.log-panel.battle-style::-webkit-scrollbar-thumb {
  background: oklch(var(--color-border));
  border-radius: 2px;
}

.log-panel.battle-style::-webkit-scrollbar-thumb:hover {
  background: oklch(var(--color-muted-foreground));
}
</style>
