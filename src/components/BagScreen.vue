<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { itemService } from '@/services/itemService';
import type { Item } from '@/models/item';

const emit = defineEmits(['use-item', 'back']);

const items = ref<Item[]>([]);
const isLoading = ref(true);

onMounted(async () => {
  try {
    items.value = await itemService.getPotions();
  } catch (error) {
    console.error('Error loading items:', error);
  } finally {
    isLoading.value = false;
  }
});

const useItem = (item: Item) => {
  if (item.quantity > 0) {
    emit('use-item', item);
  }
};
</script>

<template>
  <div class="bag-panel">
    <div class="bag-header">MOCHILA (Medicinas)</div>

    <div v-if="isLoading" class="loading-state">
      Loading
    </div>

    <div v-else class="bag-content">
      <div class="bag-items">
        <div
          v-for="item in items"
          :key="item.id"
          class="bag-item"
          :class="{ disabled: item.quantity === 0 }"
          @click="useItem(item)"
        >
          <img :src="item.sprite" :alt="item.name" class="item-sprite" />
          <div class="item-details">
            <span class="item-label">{{ item.name }}</span>
            <span class="item-qty">x{{ item.quantity }}</span>
          </div>
        </div>
      </div>

      <button class="back-button" @click="$emit('back')">
        <span class="back-arrow">←</span> Volver
      </button>
    </div>
  </div>
</template>

<style scoped>
.bag-panel {
  width: 100%;
  height: 100%;
  background: oklch(var(--color-card));
  border: 3px solid oklch(var(--color-border));
  border-radius: 6px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bag-header {
  font-size: 11px;
  font-weight: bold;
  color: oklch(var(--color-foreground));
  text-align: center;
  padding-bottom: 6px;
  border-bottom: 2px solid oklch(var(--color-border));
}

.loading-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: oklch(var(--color-muted-foreground));
}

.bag-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
}

.bag-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 6px;
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}

.bag-item {
  background: oklch(var(--color-muted));
  border: 2px solid oklch(var(--color-border));
  border-radius: 4px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  cursor: pointer;
  transition: all 0.1s ease;
}

.bag-item:hover:not(.disabled) {
  background: oklch(var(--color-accent));
  transform: scale(1.05);
}

.bag-item.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.item-sprite {
  width: 28px;
  height: 28px;
  image-rendering: pixelated;
}

.item-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.item-label {
  font-size: 8px;
  text-align: center;
  color: oklch(var(--color-foreground));
  line-height: 1.2;
  font-weight: bold;
}

.item-qty {
  font-size: 7px;
  color: oklch(var(--color-muted-foreground));
}

.back-button {
  background: oklch(var(--color-card));
  border: 2px solid oklch(var(--color-border));
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 9px;
  font-weight: bold;
  color: oklch(var(--color-foreground));
  cursor: pointer;
  align-self: flex-start;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.1s ease;
}

.back-button:hover {
  background: oklch(var(--color-accent));
}

.back-arrow {
  font-size: 11px;
}
</style>
