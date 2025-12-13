<template>
  <div class="pokemon-card">
    <div class="sprite">
      <img v-if="sprite" :src="sprite" :alt="nombre" />
      <div v-else class="placeholder">🐾</div>
    </div>
    <div class="info">
      <h3 class="name">{{ nombre }}</h3>
      <div class="type">{{ tipo }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  nombre: string
  sprite?: string
  tipo?: string
}>()
</script>

<style scoped>
.pokemon-card {
  width: 200px;
  border-radius: 10px;
  padding: 12px;
  background: linear-gradient(180deg, #fff, #f4f6f8);
  box-shadow: 0 6px 18px rgba(20,24,40,0.08);
  display: flex;
  gap: 12px;
  align-items: center;
}
.sprite img {
  width: 64px;
  height: 64px;
  object-fit: contain;
}
.sprite .placeholder {
  width: 64px;
  height: 64px;
  background: #e6eef7;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
}
.info .name {
  margin: 0;
  font-weight: 700;
  font-size: 1rem;
}
.info .type {
  margin-top: 4px;
  font-size: 0.85rem;
  color: #45576b;
  background: rgba(0,0,0,0.03);
  padding: 3px 8px;
  display: inline-block;
  border-radius: 6px;
}
</style>

