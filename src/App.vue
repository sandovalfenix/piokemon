<script setup lang="ts">
import { RouterView } from 'vue-router'
import BottomNav from '@/components/BottomNav.vue'
</script>

<template>
  <RouterView />
  <BottomNav />
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.wrapper {
  display: flex;
  place-items: flex-start;
  flex-wrap: wrap;
  justify-content: center;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
