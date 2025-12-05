<template>
  <div id="app-container">
    <SidebarProvider>
      <AppSidebar />
      <RouterView />
    </SidebarProvider>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import AppSidebar from '@/components/AppSidebar.vue';
import { SidebarProvider } from '@/components/ui/sidebar';
</script>

<style>
/* Estilos globales */
body {
  margin: 0;
  font-family: Arial, sans-serif;
}

#app-container {
  width: 100vw;
  height: 100vh;
}
</style>
