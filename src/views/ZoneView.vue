<template>
  <div class="zone-page">
    <div v-if="zone">
      <h1>Lobby — {{ zone.name }}</h1>
      <p>{{ zone.description }}</p>

      <div class="zone-actions">
        <button @click="talkToNpc">Hablar con NPC</button>
        <button @click="startCapture">Iniciar captura</button>
        <button @click="viewMissions">Ver misiones</button>
      </div>

      <div v-if="subZones?.length" class="subzone-list">
        <h2>Sub-zonas</h2>
        <ul>
          <li v-for="node in subZones" :key="node.id">{{ node.name }} — {{ node.state }}</li>
        </ul>
      </div>
    </div>
    <div v-else>
      <h2>ZONA NO ENCONTRADA</h2>
      <p>El ID de zona no existe o está bloqueado.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
import { useMapStore } from '@/stores/mapStore';

const route = useRoute();
const router = useRouter();
const idParam = route.params.id as string | undefined;

const mapStore = useMapStore();
const zone = ref(null as any | null);
const subZones = ref<any[] | undefined>(undefined);

onMounted(() => {
  if (!idParam) return;
  const zoneId = parseInt(idParam, 10);
  const z = mapStore.getZoneById(zoneId);
  if (z) {
    zone.value = z;
    subZones.value = mapStore.getSubZoneNodes(zoneId) as any[] | undefined;
  }
})

function talkToNpc() {
  alert('NPC: ¡Hola, entrenador! Completa misiones para avanzar.');
}
function startCapture() {
  alert('Sistema de captura (placeholder)');
}
function viewMissions() {
  router.push('/missions');
}
</script>

<style scoped>
.zone-page { padding: 18px; }
.zone-actions { display:flex; gap: 8px; margin-top: 12px; }
.subzone-list { margin-top: 18px; }
</style>
