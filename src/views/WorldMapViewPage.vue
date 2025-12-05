<template>
  <SidebarInset>
    <SiteHeader title="Mapa de Progresión del Mundo" />
    <div class="flex flex-1 flex-col overflow-hidden">
      <WorldMapView />
    </div>
  </SidebarInset>
</template>

<script setup lang="ts">
import WorldMapView from '@/components/WorldMapView.vue';
import SiteHeader from '@/components/SiteHeader.vue';
import { SidebarInset } from '@/components/ui/sidebar';
</script>
