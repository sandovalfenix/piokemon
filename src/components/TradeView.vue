<script setup lang="ts">
import { useTradeStore } from '../stores/trade';
import { storeToRefs } from 'pinia';
import TradeSlot from './TradeSlot.vue';
import TradeControls from './TradeControls.vue';
import { onMounted } from 'vue';

const store = useTradeStore();
const { localPlayer, remotePlayer, status, timer, inventory, localTradeValue, remoteTradeValue, tradeDifference } = storeToRefs(store);

// Initialize some items for demo
onMounted(() => {
    // Demo: Remote player is already set up via store initialization
});
</script>

<template>
  <div class="min-h-screen bg-gray-950 flex items-center justify-center p-4 font-sans relative overflow-hidden">
    
    <!-- Background Effects -->
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-gray-950 to-gray-950 pointer-events-none"></div>
    <div class="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>

    <!-- Main Trade Container -->
    <div class="w-full max-w-5xl bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-2xl shadow-2xl overflow-hidden relative z-10">
      
      <!-- Header -->
      <div class="bg-gray-900/90 text-white text-center py-4 border-b border-gray-700 relative">
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
        <h1 class="text-2xl font-black tracking-[0.2em] uppercase bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Treasure Trade</h1>
        <div class="text-xs font-bold uppercase tracking-wider mt-1" :class="{
            'text-green-400': tradeDifference > 0,
            'text-red-400': tradeDifference < 0,
            'text-gray-400': tradeDifference === 0
        }">
            Difference: ${{ tradeDifference }}
        </div>
      </div>

      <!-- Players Header -->
      <div class="grid grid-cols-2 border-b border-gray-700">
        <div class="bg-gray-800/50 text-gray-200 text-center py-3 font-bold border-r border-gray-700 flex flex-col">
          <span class="text-xs text-gray-500 uppercase tracking-wider">Local Player</span>
          <span class="text-lg">{{ localPlayer.name }}</span>
          <span class="text-sm text-cyan-400 mt-1">Value: ${{ localTradeValue }}</span>
        </div>
        <div class="bg-gray-800/50 text-gray-200 text-center py-3 font-bold flex flex-col">
          <span class="text-xs text-gray-500 uppercase tracking-wider">Remote Player</span>
          <span class="text-lg">{{ remotePlayer.name }}</span>
          <span class="text-sm text-cyan-400 mt-1">Value: ${{ remoteTradeValue }}</span>
        </div>
      </div>

      <!-- Trade Area -->
      <div class="grid grid-cols-2 h-[450px] relative">
        
        <!-- Local Player Slots -->
        <div class="bg-gray-900/30 p-6 grid grid-cols-2 gap-4 content-start border-r border-gray-700">
          <TradeSlot 
            v-for="(item, index) in localPlayer.items" 
            :key="'local-'+index" 
            :item="item"
          />
        </div>

        <!-- Remote Player Slots -->
        <div class="bg-gray-900/30 p-6 grid grid-cols-2 gap-4 content-start">
          <TradeSlot 
            v-for="(item, index) in remotePlayer.items" 
            :key="'remote-'+index" 
            :item="item"
          />
        </div>

        <!-- Countdown Overlay -->
        <div v-if="status === 'confirming'" class="absolute inset-0 flex items-center justify-center z-20 pointer-events-none bg-black/20 backdrop-blur-sm">
            <div class="text-9xl font-black text-white drop-shadow-[0_0_15px_rgba(0,255,255,0.5)] animate-pulse">
                {{ timer }}
            </div>
        </div>
      </div>

      <!-- Controls -->
      <TradeControls />
      
    </div>

    <!-- Inventory Sidebar (Demo Purpose) -->
    <div class="fixed left-4 top-1/2 -translate-y-1/2 bg-gray-900/90 backdrop-blur border border-gray-700 p-4 rounded-xl text-white w-56 shadow-xl z-20">
        <h3 class="font-bold mb-3 text-sm uppercase tracking-wider text-gray-400">Your Inventory</h3>
        <div class="space-y-2 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
            <div 
                v-for="item in inventory" 
                :key="item.id"
                class="p-2 bg-gray-800/50 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-700 hover:border-gray-500 transition-all flex items-center gap-3 group"
                @click="store.addItemToTrade(item)"
            >
                <img :src="item.image" class="w-10 h-10 rounded-md bg-gray-900 object-cover" />
                <div class="flex-1 min-w-0">
                    <div class="font-bold text-sm truncate group-hover:text-cyan-400 transition-colors">{{ item.name }}</div>
                    <div class="text-xs font-medium uppercase tracking-wider" :class="{
                        'text-gray-400': item.rarity === 'common',
                        'text-cyan-400': item.rarity === 'rare',
                        'text-purple-400': item.rarity === 'epic',
                        'text-yellow-400': item.rarity === 'legendary',
                        'text-red-400': item.rarity === 'mythical'
                    }">{{ item.rarity }}</div>
                </div>
            </div>
        </div>
    </div>

  </div>
</template>
