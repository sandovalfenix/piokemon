<template>
  <div class="p-4 border rounded-xl flex gap-4 items-center">
    <div class="w-16 h-16 bg-gray-200 rounded"></div>

    <div class="flex-1">
      <div class="font-semibold">Nombre Pokémon</div>
      <div class="text-sm text-gray-500">Nivel 0</div>

      <div class="mt-2 h-2 w-full bg-gray-200 rounded">
        <div class="h-full bg-green-500 rounded" style="width: 50%;"></div>
      </div>

      <div class="text-xs mt-1 text-gray-600">HP 0 / 0</div>
    </div>
  </div>
</template>

<script setup lang="ts">
// sin props, sin lógica — placeholder visual
</script>
