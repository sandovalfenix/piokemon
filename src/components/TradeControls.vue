<script setup lang="ts">
import { useTradeStore } from '../stores/trade';
import { storeToRefs } from 'pinia';

const store = useTradeStore();
const { status, localPlayer, remotePlayer } = storeToRefs(store);
</script>

<template>
  <div class="w-full bg-gray-900/90 border-t border-gray-700 p-6 flex flex-col gap-4 relative z-20">
    <!-- Status Bar -->
    <div class="flex justify-between items-center px-4">
      <div class="flex items-center gap-2 transition-all duration-300" :class="{ 'opacity-100 translate-x-0': localPlayer.isReady, 'opacity-30 -translate-x-4': !localPlayer.isReady }">
        <div class="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></div>
        <span class="text-green-400 font-bold text-lg uppercase tracking-widest">Ready</span>
      </div>
      
      <!-- Center Controls -->
      <div class="flex flex-col items-center gap-3">
        <button 
          v-if="status !== 'confirming' && status !== 'completed'"
          @click="store.toggleReady"
          class="px-12 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black uppercase tracking-[0.15em] rounded-full border border-cyan-400/30 hover:shadow-[0_0_20px_rgba(8,145,178,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 relative overflow-hidden group"
        >
          <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          {{ localPlayer.isReady ? 'Unready' : 'Accept Trade' }}
        </button>
        
        <button 
          @click="store.cancelTrade"
          class="px-8 py-2 text-gray-400 font-bold uppercase tracking-wider text-xs hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
        >
          Cancel
        </button>
      </div>

      <div class="flex items-center gap-2 transition-all duration-300" :class="{ 'opacity-100 translate-x-0': remotePlayer.isReady, 'opacity-30 translate-x-4': !remotePlayer.isReady }">
        <span class="text-green-400 font-bold text-lg uppercase tracking-widest">Ready</span>
        <div class="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></div>
      </div>
    </div>


  </div>
</template>
