<template>
  <div class="p-6 max-w-5xl mx-auto space-y-6">
    <h1 class="text-2xl font-bold">Pokémon Center</h1>

    <div class="grid md:grid-cols-2 gap-6">
      <!-- Panel Equipo -->
      <TeamPanel />

      <!-- Panel Inventario -->
      <InventoryPanel />
    </div>
  </div>
</template>

<script setup lang="ts">
import TeamPanel from '@/components/TeamPanel.vue'
import InventoryPanel from '@/components/InventoryPanel.vue'
</script>
