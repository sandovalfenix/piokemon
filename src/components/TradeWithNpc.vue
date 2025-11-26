<script setup lang="ts">
import { useTradeStore } from '@/stores/TradeWithNpc'
import { storeToRefs } from 'pinia'

const tradeStore = useTradeStore()
const { npcs, tradeMessage } = storeToRefs(tradeStore)
const { tradePokemon } = tradeStore
</script>

<template>
  <div class="trade-container">
    <h2 class="title">Trade with NPCs</h2>
    <div v-if="tradeMessage" class="message">{{ tradeMessage }}</div>

    <div class="npc-list">
      <div v-for="npc in npcs" :key="npc.id" class="npc-card">
        <h3>{{ npc.name }}</h3>
        <p>
          Wants: <strong>{{ npc.wants }}</strong>
        </p>
        <p>
          Offers: <strong>{{ npc.offers.name }}</strong>
        </p>
        <button @click="tradePokemon(npc.id)">Trade</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.title{
  color: #fff;
}
.trade-container {
  color: #000;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-top: 20px;
}
.npc-list {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
.npc-card {
  border: 1px solid #ccc;
  padding: 15px;
  border-radius: 8px;
  background-color: #f9f9f9;
  min-width: 200px;
}
.message {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #e0f7fa;
  border-radius: 4px;
  color: #006064;
}
button {
  background-color: #007bff;
  color: #f0f0f0;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}
button:hover {
  background-color: #0056b3;
}
</style>
