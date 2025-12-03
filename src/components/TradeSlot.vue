<script setup lang="ts">
import type { TradeItem } from '../types/trade';

defineProps<{
  item: TradeItem | null;
  isLocked?: boolean;
}>();
</script>

<template>
  <div 
    class="relative w-full aspect-square bg-gray-800/50 border border-gray-600 rounded-xl flex items-center justify-center overflow-hidden group hover:border-gray-400 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-300"
    :class="{ 
      'border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]': item?.rarity === 'rare',
      'border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]': item?.rarity === 'epic',
      'border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.2)]': item?.rarity === 'legendary', 
      'border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]': item?.rarity === 'mythical' 
    }"
  >
    <div v-if="!item" class="text-gray-700 text-6xl font-thin select-none group-hover:text-gray-600 transition-colors">+</div>
    
    <div v-else class="w-full h-full relative p-2">
      <!-- Rarity Glow Background -->
      <div class="absolute inset-0 opacity-20 bg-gradient-to-br from-transparent to-current" 
           :class="{
             'text-cyan-500': item.rarity === 'rare',
             'text-purple-500': item.rarity === 'epic',
             'text-yellow-500': item.rarity === 'legendary',
             'text-red-500': item.rarity === 'mythical'
           }"></div>

      <div class="absolute top-0 left-0 w-full bg-black/60 backdrop-blur-sm text-white text-[10px] uppercase tracking-wider text-center py-1 z-10 truncate border-b border-white/10 flex justify-between px-2">
        <span class="truncate flex-1 text-left">{{ item.name }}</span>
        <span :class="{
             'text-gray-400': item.rarity === 'common',
             'text-cyan-400': item.rarity === 'rare',
             'text-purple-400': item.rarity === 'epic',
             'text-yellow-400': item.rarity === 'legendary',
             'text-red-400': item.rarity === 'mythical'
        }" class="font-bold ml-1">{{ item.rarity }}</span>
      </div>
      
      <img :src="item.image" :alt="item.name" class="w-full h-full object-contain drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300" />
      
      <!-- Quantity Badge -->
      <div v-if="item.quantity > 1" class="absolute bottom-2 right-2 bg-gray-900/90 text-white text-xs font-bold px-2 py-0.5 rounded-full border border-gray-600 z-20 shadow-lg">
        x{{ item.quantity }}
      </div>

      <div class="absolute bottom-0 left-0 w-full bg-gray-900/80 backdrop-blur-sm text-gray-300 text-xs text-center py-1 z-10 border-t border-white/10 font-mono">
        ${{ item.value.toLocaleString() }}
      </div>
    </div>
  </div>
</template>
