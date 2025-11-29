<template>
  <section class="p-4 max-w-4xl mx-auto space-y-4">
    <header class="mb-4 flex justify-between items-center">
      <h1 class="text-2xl font-bold">Battle</h1>
      <div class="flex gap-2 items-center text-sm">
        <label for="ai-select" class="text-gray-600 dark:text-gray-400">AI:</label>
        <select
          id="ai-select"
          v-model="selectedAI"
          @change="handleAIChange"
          class="px-2 py-1 border rounded dark:bg-slate-700 dark:border-slate-600"
          :disabled="!battleStore.isResolved && battleStore.turn > 1"
        >
          <option value="basic">Basic</option>
          <option value="strategic">Strategic</option>
        </select>
      </div>
    </header>
    <div class="grid grid-cols-1 gap-4">
      <div :class="{'battle-shake': isShaking, 'battle-fade': isMissing}">
        <StatusPanel />
      </div>
      <LogPanel />
      <MoveSelector v-if="!battleStore.isResolved" :disabled="battleLoop.isInputDisabled.value" />
      <div v-else class="text-center">
        <p class="text-xl font-bold">{{ battleStore.winner === 'player' ? 'You Win!' : 'You Lose!' }}</p>
        <button @click="handleNewBattle" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">New Battle</button>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import { useBattleStore } from '@/stores/battle'
import type { AIType } from '@/stores/battle'
import { useBattleLoop } from '@/composables/useBattleLoop'
import { useAudio } from '@/composables/useAudio'
import { createHowlerAudio, DEFAULT_BATTLE_SOUNDS } from '@/services/audio/howlerAudio'
import StatusPanel from '@/components/StatusPanel.vue'
import LogPanel from '@/components/LogPanel.vue'
import MoveSelector from '@/components/MoveSelector.vue'

const battleStore = useBattleStore()
const battleLoop = useBattleLoop()

// Initialize audio with Howler.js adapter
const audio = useAudio(createHowlerAudio(DEFAULT_BATTLE_SOUNDS))

// AI selection
const selectedAI = ref<AIType>('strategic')

// Animation states
const isShaking = ref(false)
const isMissing = ref(false)

// Preload sounds on mount
onMounted(async () => {
  await audio.preload(Object.keys(DEFAULT_BATTLE_SOUNDS))
  battleStore.startBattle(undefined, selectedAI.value)
})

// Watch for battle resolution to play victory/defeat sound
watch(() => battleStore.isResolved, (resolved) => {
  if (resolved) {
    if (battleStore.winner === 'player') {
      audio.play('victory')
    } else {
      audio.play('defeat')
    }
  }
})

// Watch for new log messages to trigger animations
watch(() => battleStore.log.length, () => {
  const lastMessage = battleStore.log[battleStore.log.length - 1]
  if (lastMessage) {
    if (lastMessage.includes('missed')) {
      // Trigger fade animation for misses
      isMissing.value = true
      setTimeout(() => { isMissing.value = false }, 600)
    } else if (lastMessage.includes('damage')) {
      // Trigger shake animation for hits
      isShaking.value = true
      setTimeout(() => { isShaking.value = false }, 500)
    }
  }
})

const handleNewBattle = () => {
  audio.stop()
  battleStore.startBattle(undefined, selectedAI.value)
}

const handleAIChange = () => {
  // Only allow changing AI at the start of a new battle
  if (battleStore.isResolved || battleStore.turn === 1) {
    battleStore.startBattle(undefined, selectedAI.value)
  }
}
</script>
<style scoped>
/* Shake animation for successful hits */
.battle-shake {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes shake {
  10%, 90% {
    transform: translate3d(-1px, 0, 0);
  }
  20%, 80% {
    transform: translate3d(2px, 0, 0);
  }
  30%, 50%, 70% {
    transform: translate3d(-3px, 0, 0);
  }
  40%, 60% {
    transform: translate3d(3px, 0, 0);
  }
}

/* Fade animation for misses */
.battle-fade {
  animation: fade-pulse 0.6s ease-in-out;
}

@keyframes fade-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}
</style>
