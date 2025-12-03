<script setup lang="ts">
import { ref } from 'vue';
import TradeView from './components/TradeView.vue';
import FloatingDock from './components/FloatingDock.vue';

const currentView = ref<'game' | 'trade'>('game');

const openTrade = () => {
  currentView.value = 'trade';
};

const openSystem = () => {
  alert('Pokemon System Module - Coming Soon!');
};

const closeTrade = () => {
  currentView.value = 'game';
};
</script>

<template>
  <div class="relative min-h-screen bg-black overflow-hidden">
    
    <!-- Floating Dock (Always Visible) -->
    <FloatingDock 
      :onOpenTrade="openTrade"
      :onOpenSystem="openSystem"
    />

    <!-- Game World Placeholder -->
    <div v-if="currentView === 'game'" class="absolute inset-0 flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1634979149798-e9a118734e93?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      <div class="relative z-10 text-center text-white p-8 bg-black/60 rounded-2xl border border-white/10 backdrop-blur-md max-w-2xl">
        <h1 class="text-5xl font-black mb-4 bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent">Pokemon World</h1>
        <p class="text-xl text-gray-300 mb-8">Explore the world, catch Pokemon, and trade with other players!</p>
        <div class="inline-block px-6 py-3 bg-white/10 rounded-full border border-white/20 animate-bounce">
          <p class="text-sm font-bold">Try the Floating Menu ↘️</p>
        </div>
      </div>
    </div>

    <!-- Trade View -->
    <div v-else-if="currentView === 'trade'" class="relative z-10">
      <button 
        @click="closeTrade"
        class="fixed top-4 left-4 z-50 px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors flex items-center gap-2"
      >
        <span>← Back to Game</span>
      </button>
      <TradeView />
    </div>

  </div>
</template>
