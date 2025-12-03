<template>
  <div class="zone-detail-view water-theme">
    <div class="content-box" v-if="zone">
      <RouterLink to="/mapa" class="back-link">
        ← Volver al Mapa Mundial
      </RouterLink>

      <h1 class="water-text">{{ zone.name }} (Progreso: {{ zone.progress }}%)</h1>
      <h2 class="leader-name">Explora los puntos de interés y completa la Misión de las Válvulas.</h2>

      <div class="mission-map-container">
        <img
            src="@/assets/cali-journey-map.svg"
            alt="Mapa de Misiones"
            class="mission-map-image"
        >

        <svg class="path-connections" width="1000" height="700">
            <path
                v-for="path in missionPaths"
                :key="path.id"
                :d="path.d"
                :class="['path-line', `state-${path.state}`]"
            />
        </svg>

        <button
          v-for="node in subZoneNodes"
          :key="node.id"
          :class="['mission-node', `state-${node.state}`, `type-${node.type}`]"
          :style="{ left: node.position.x + 'px', top: node.position.y + 'px' }"
          @click="selectNode(node)"
          :title="node.name"
        >
          <span class="node-icon">{{ node.icon }}</span>
        </button>

        <div v-if="selectedNode" class="node-popover">
            <div :class="['popover-header', `type-${selectedNode.type}`]">
                <h3>{{ selectedNode.icon }} {{ selectedNode.name }}</h3>
                <p v-if="selectedNode.type === 'gym_challenge'">Líder:Manuel (Festi-Verde)</p>
            </div>

            <div class="popover-content-body">
                <template v-if="selectedNode.type === 'wild_pokemon'">
                    <p class="mission-status">Estado:<span :class="selectedNode.state">{{ selectedNode.state.toUpperCase() }}</span></p>
                    <p>{{ selectedNode.description }}</p>
                    <p>Pokémon Salvajes en la zona:</p>
                    <ul class="detail-list">
                        <li v-for="(detail, i) in selectedNode.details" :key="i">🐾 {{ detail }}</li>
                    </ul>

                    <button
                        v-if="selectedNode.state === 'active'"
                        @click="completeNode(selectedNode.id)"
                        class="complete-button full-width"
                    >
                        Capturar Pokémon
                    </button>
                    <p v-else-if="selectedNode.state === 'completed'" class="completed-message">✅ Pokémon Capturado. ¡A por la Válvula 3!</p>
                </template>

                <template v-else-if="selectedNode.type === 'npc' || selectedNode.type === 'center'">
                    <p class="story-text" v-if="selectedNode.trainerName">{{ selectedNode.trainerName }}</p>
                    <p>{{ selectedNode.description }}</p>
                    <ul class="detail-list">
                        <li v-for="(detail, i) in selectedNode.details" :key="i">ℹ️ {{ detail }}</li>
                    </ul>
                </template>

                <template v-else-if="selectedNode.type === 'gym_challenge'">
                    <p class="reward-highlight">Medalla:{{ selectedNode.details?.[0] }}</p>
                    <p class="reward-highlight">MT:{{ selectedNode.details?.[1] }}</p>
                    <p>**Beneficios:**</p>
                    <ul class="benefit-list">
                        <li v-for="i in [2, 3, 4]" :key="i">✓ {{ selectedNode.details?.[i] }}</li>
                    </ul>

                    <button
                        v-if="selectedNode.state === 'active'"
                        @click="startBattle"
                        class="start-button full-width"
                    >
                        ¡Desafiar al Líder Manuel!
                    </button>
                    <p v-else class="locked-message">🔒 Debes completar la misión de las válvulas primero.</p>
                </template>

                <template v-else-if="selectedNode.type === 'mission'">
                    <p class="mission-status">Estado: <span :class="selectedNode.state">{{ selectedNode.state.toUpperCase() }}</span></p>
                    <p>{{ selectedNode.description }}</p>
                    <p v-if="selectedNode.trainerName">NPC / Entrenador:{{ selectedNode.trainerName }}</p>

                    <button
                        v-if="selectedNode.state === 'active' && selectedNode.id !== 'valve_101'"
                        @click="completeNode(selectedNode.id)"
                        class="complete-button full-width"
                    >
                        Combatir y Abrir Válvula
                    </button>
                    <button v-else-if="selectedNode.id === 'valve_101' && selectedNode.state === 'active'" @click="startMission" class="complete-button full-width">
                        Aceptar Misión
                    </button>
                    <p v-else-if="selectedNode.state === 'completed'" class="completed-message">✅ Misión de esta válvula completada.</p>
                </template>
            </div>

            <button @click="selectedNode = null" class="close-popover">X</button>
        </div>
      </div>

    </div>
    
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { useMapStore } from '../stores/mapStore';
import type { Zone, SubZoneNode } from '../types/zone';

const route = useRoute();
const router = useRouter();
const mapStore = useMapStore();

const zone = ref<Zone | null>(null);
const subZoneNodes = ref<SubZoneNode[]>([]);
const selectedNode = ref<SubZoneNode | null>(null);
const currentZoneId = computed(() => route.params.id ? Number(route.params.id) : null);

// --- Lógica de Carga y Nodos ---
const loadZoneData = (id: number) => {
  const foundZone = mapStore.getZoneById(id);

  if (foundZone) {
    zone.value = foundZone;
    subZoneNodes.value = JSON.parse(JSON.stringify(mapStore.getSubZoneNodes(id) || []));
  } else {
    router.push('/mapa');
  }
};

// Verifica si la misión de la Válvula 4 está completa (la última misión de combate/captura)
const missionCompleted = computed(() => {
    return subZoneNodes.value.find(n => n.id === 'valve_104')?.state === 'completed';
});

const selectNode = (node: SubZoneNode) => {
    // Si es el nodo del gimnasio, actualiza su estado basado en la misión.
    if (node.id === 'gym_final') {
        node.state = missionCompleted.value ? 'active' : 'locked';
    }
    selectedNode.value = node;
};

// Acción: Iniciar la misión (Desde Válvula 101)
const startMission = () => {
    const valve101 = subZoneNodes.value.find(n => n.id === 'valve_101');
    const nextValve = subZoneNodes.value.find(n => n.id === valve101?.nextId);

    if(valve101 && nextValve && currentZoneId.value) {
        valve101.state = 'completed';
        mapStore.updateSubZoneNodeState(currentZoneId.value, valve101.id, 'completed');

        nextValve.state = 'active';
        mapStore.updateSubZoneNodeState(currentZoneId.value, nextValve.id, 'active');

        loadZoneData(currentZoneId.value);
        alert('Misión aceptada. ¡La Válvula de Filtración Sur está ahora disponible! Vence al entrenador.');
        selectedNode.value = null;
    }
}

// Acción: Completar una válvula o la zona de captura
const completeNode = (nodeId: string) => {
    const nodeIndex = subZoneNodes.value.findIndex(n => n.id === nodeId);
    const node = subZoneNodes.value[nodeIndex];

    if (nodeIndex === -1 || node.state !== 'active') return;

    // 1. Marcar el nodo actual como completado
    node.state = 'completed';
    if(currentZoneId.value) {
        mapStore.updateSubZoneNodeState(currentZoneId.value, node.id, 'completed');
    }

    // 2. Activar el siguiente nodo de la cadena
    const nextId = node.nextId;
    if (nextId) {
        const nextNode = subZoneNodes.value.find(n => n.id === nextId);
        if (nextNode && currentZoneId.value) {
             nextNode.state = 'active';
             mapStore.updateSubZoneNodeState(currentZoneId.value, nextNode.id, 'active');
        }
    }

    selectedNode.value = null;

    if (node.type === 'wild_pokemon') {
        alert(`¡Captura de ${node.details?.[0]?.split(':')[1]?.trim() || 'Pokémon'} completada!`);
    } else if (node.type === 'mission') {
        alert(`¡Válvula ${node.name} abierta!`);
    }

    if (currentZoneId.value) {
      loadZoneData(currentZoneId.value);
    }
};

// Cálculo de las líneas de conexión
interface Path { id: string; d: string; state: 'locked' | 'active' | 'completed'; }
const missionPaths = computed<Path[]>(() => {
    const paths: Path[] = [];
    const nodeMap = new Map(subZoneNodes.value.map(n => [n.id, n]));

    subZoneNodes.value.forEach(node => {
        if (node.nextId) {
            const nextNode = nodeMap.get(node.nextId);
            if (nextNode) {
                let state: 'locked' | 'active' | 'completed' = 'locked';

                if (node.state === 'completed') {
                    state = 'completed';
                } else if (node.state === 'active' && node.id !== 'start_center') {
                    state = 'active';
                }

                paths.push({
                    id: `${node.id}-${nextNode.id}`,
                    d: `M ${node.position.x} ${node.position.y} L ${nextNode.position.x} ${nextNode.position.y}`,
                    state: state,
                });
            }
        }
    });
    return paths;
});


watch(() => route.params.id, (newId) => {
  if (newId) {
    const idToLoad = Array.isArray(newId) ? Number(newId[0]) : Number(newId);
    loadZoneData(idToLoad);
  }
}, { immediate: true });


const startBattle = () => {
    alert(`¡Misión cumplida! Entrando a la batalla final contra el Líder Manuel.`);
    if(currentZoneId.value) {
        mapStore.completeZone(currentZoneId.value);
    }
    router.push('/mapa');
};
</script>

<style scoped>
/* ESTILOS (Mantengo los estilos anteriores) */
.zone-detail-view { min-height: 100vh; padding: 40px 20px; color: #333; }
.water-theme { background: linear-gradient(to bottom right, #e0f7fa, #b2ebf2); }
.content-box { max-width: 1200px; margin: 0 auto; padding: 40px; background-color: white; border-radius: 15px; box-shadow: 0 10px 30px rgba(0, 50, 100, 0.2); text-align: center; }
.back-link { float: left; margin-bottom: 20px; text-decoration: none; color: #00796b; font-weight: bold; }
h1 { font-size: 3em; margin-bottom: 5px; color: #00bcd4; }
.water-text { text-shadow: 2px 2px 5px rgba(0, 188, 212, 0.3); }
.leader-name { font-size: 1.5em; color: #4caf50; margin-bottom: 20px; }

/* MINI-MAPA */
.mission-map-container { position: relative; width: 1000px; height: 700px; margin: 20px auto 40px auto; border: 3px solid #009688; border-radius: 15px; background: radial-gradient(circle at 50% 50%, #80deea 0%, #00bcd4 80%); box-shadow: 0 0 20px rgba(0, 150, 136, 0.5); overflow: hidden; }
.mission-map-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.8;
    z-index: 1;
}

.path-connections { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 5; }
.path-line { fill: none; stroke-width: 5; transition: stroke 0.5s ease; }
.path-line.state-locked { stroke: #7f8c8d; stroke-dasharray: 10 5; }
.path-line.state-active { stroke: #ff9800; }
.path-line.state-completed { stroke: #4CAF50; }

.mission-node { position: absolute; width: 60px; height: 60px; border-radius: 50%; border: 4px solid white; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 24px; transition: all 0.3s ease; z-index: 10; transform: translate(-50%, -50%); box-shadow: 0 0 10px rgba(0, 0, 0, 0.4); }
.mission-node:hover { transform: translate(-50%, -50%) scale(1.1); }
.mission-node.state-locked { background-color: #7f8c8d; border-color: #34495e; }
.mission-node.state-active { background-color: #ffc107; border-color: #ff9800; animation: pulse 1s infinite alternate; }
@keyframes pulse { from { box-shadow: 0 0 15px #ff9800; } to { box-shadow: 0 0 25px #ffc107; } }
.mission-node.state-completed { background-color: #4CAF50; border-color: #2e7d32; }
/* Colores por TIPO */
.mission-node.type-npc { background-color: #f7e192; border-color: #e6b31e; }
.mission-node.type-center { background-color: #ffe0e0; border-color: #e89595; }
.mission-node.type-wild_pokemon { background-color: #5a9459; border-color: #2e7d32; } /* 🔑 Color para captura */
.mission-node.type-gym_challenge { background-color: #1c4587; border-color: #ffc107; color: white; }
.mission-node.type-mission { background-color: #ff5722; border-color: #bf360c; }

/* ESTILOS DEL POP-OVER */
.node-popover { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 350px; background-color: white; border-radius: 10px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4); z-index: 15; text-align: left; overflow: hidden; }
.popover-header { padding: 15px; color: white; }
.popover-header.type-npc { background-color: #e6b31e; }
.popover-header.type-center { background-color: #e89595; }
.popover-header.type-wild_pokemon { background-color: #5a9459; } /* 🔑 Color de cabecera para captura */
.popover-header.type-gym_challenge { background-color: #1c4587; }
.popover-header.type-mission { background-color: #ff9800; }
.popover-content-body { padding: 15px; }
.story-detail { font-style: italic; font-size: 0.9em;}
.reward-highlight { font-weight: bold; color: #1c4587; }
.mission-status .locked { color: #c0392b; font-weight: bold;}
.mission-status .active { color: #f39c12; font-weight: bold;}
.mission-status .completed { color: #27ae60; font-weight: bold;}
.completed-message { color: #27ae60; font-weight: bold; text-align: center; }
.close-popover { position: absolute; top: 5px; right: 5px; background: none; border: none; color: white; font-weight: bold; cursor: pointer; }
.full-width { width: 100%; margin-top: 10px; }
.complete-button, .start-button { background-color: #009688; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; margin-top: 10px; transition: background-color 0.2s; }

/* Estilos de soporte para listas y mensajes */
.detail-list, .benefit-list { list-style-type: none; padding-left: 10px; }
</style>
