<script setup lang="ts">
import 'primeicons/primeicons.css'
</script>

<template>
  <div id="app">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<style scoped>
#app {
  width: 100%;
  height: 100vh;
}
</style>
