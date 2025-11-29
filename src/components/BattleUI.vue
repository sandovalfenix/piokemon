<template>
  <section class="p-4 max-w-screen-xl mx-auto space-y-4 relative">
    <header class="mb-4 flex justify-between items-center">
      <h1 class="text-2xl font-bold">Battle</h1>
    </header>
    <div class="grid grid-cols-1 gap-4">
      <div class="relative">
        <div :class="{'battle-shake': isShaking}">
          <StatusPanel :attacking-side="attackingSide" />
        </div>

        <!-- Miss Message Overlay -->
        <transition name="miss-pop">
          <div v-if="showMissMessage" class="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div class="bg-gray-800/90 text-white px-8 py-4 rounded-xl shadow-2xl border-2 border-gray-600 backdrop-blur-sm transform">
              <span class="text-2xl font-bold tracking-wider uppercase text-yellow-400 drop-shadow-md">Missed!</span>
            </div>
          </div>
        </transition>
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

// Animation states
const isShaking = ref(false)
const showMissMessage = ref(false)
const attackingSide = ref<'player' | 'npc' | null>(null)

// Preload sounds on mount
onMounted(async () => {
  await audio.preload(Object.keys(DEFAULT_BATTLE_SOUNDS))
  battleStore.startBattle()
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

// Watch for new log messages to trigger animations and sounds
watch(() => battleStore.log.length, () => {
  const lastMessage = battleStore.log[battleStore.log.length - 1]
  if (lastMessage) {
    if (lastMessage.includes('missed')) {
      // Trigger miss animation and sound
      showMissMessage.value = true
      audio.play('miss')
      setTimeout(() => { showMissMessage.value = false }, 1000)
    } else if (lastMessage.includes('damage')) {
      // Trigger shake animation for hits
      isShaking.value = true
      audio.play('hit')
      setTimeout(() => { isShaking.value = false }, 500)
    } else if (lastMessage.includes('used')) {
      // Trigger attack animation
      if (lastMessage.startsWith(battleStore.playerPokemon?.name || '')) {
        attackingSide.value = 'player'
      } else if (lastMessage.startsWith(battleStore.npcPokemon?.name || '')) {
        attackingSide.value = 'npc'
      }
      setTimeout(() => { attackingSide.value = null }, 500)
    }
  }
})

const handleNewBattle = () => {
  audio.stop()
  battleStore.startBattle()
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

/* Miss Pop Animation */
.miss-pop-enter-active {
  animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.miss-pop-leave-active {
  animation: pop-out 0.3s ease-in;
}

@keyframes pop-in {
  0% {
    opacity: 0;
    transform: scale(0.5) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes pop-out {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(1.5);
  }
}
</style>
