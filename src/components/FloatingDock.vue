<script setup lang="ts">
import { ref } from 'vue';
import { useDraggable, useWindowSize } from '@vueuse/core';
import { Backpack, CircleDot, ArrowRightLeft, X } from 'lucide-vue-next';

const props = defineProps<{
  onOpenTrade: () => void;
  onOpenSystem: () => void;
}>();

const el = ref<HTMLElement | null>(null);
const isOpen = ref(false);

// Get window size to set initial position
const { width, height } = useWindowSize();

// Initial position: Bottom right
const { style } = useDraggable(el, {
  initialValue: { x: width.value - 100, y: height.value - 100 },
  preventDefault: true,
});

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};
</script>

<template>
  <div 
    ref="el" 
    :style="style" 
    class="fixed z-50 touch-none cursor-move select-none"
  >
    <!-- Main Floating Button -->
    <div class="relative group">
      <!-- Expanded Menu -->
      <div 
        class="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 flex flex-col gap-3 transition-all duration-300 origin-bottom"
        :class="[
          isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-0 translate-y-4 pointer-events-none'
        ]"
      >
        <!-- Backpack / Trade Button -->
        <button 
          @click.stop="props.onOpenTrade"
          class="w-12 h-12 bg-gray-900 border border-gray-600 rounded-full flex items-center justify-center text-cyan-400 hover:bg-gray-800 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-all tooltip-container"
          title="Open Trade"
        >
          <Backpack class="w-6 h-6" />
          <span class="absolute right-full mr-3 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Inventory
          </span>
        </button>

        <!-- Pokeball / System Button -->
        <button 
          @click.stop="props.onOpenSystem"
          class="w-12 h-12 bg-gray-900 border border-gray-600 rounded-full flex items-center justify-center text-red-400 hover:bg-gray-800 hover:border-red-400 hover:shadow-[0_0_15px_rgba(248,113,113,0.5)] transition-all tooltip-container"
          title="Pokemon System"
        >
          <CircleDot class="w-6 h-6" />
          <span class="absolute right-full mr-3 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            System
          </span>
        </button>
      </div>

      <!-- Toggle Button -->
      <button 
        @click="toggleMenu"
        class="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-full shadow-lg border-2 border-indigo-400/50 flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.6)]"
      >
        <X v-if="isOpen" class="w-8 h-8" />
        <ArrowRightLeft v-else class="w-8 h-8 animate-pulse" />
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Prevent text selection while dragging */
.select-none {
  user-select: none;
}
</style>
