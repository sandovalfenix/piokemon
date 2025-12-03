// src/stores/mapStore.ts

import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { Zone } from '../types/zone';

// --- Datos de Zonas de Cali ---
const initialZones: Zone[] = [
    {
        id: 1,
        name: 'Zoológico de Cali',
        description: '¡Explora la fauna y descubre Pokémon salvajes en este increíble zoológico!',
        position: { x: 250, y: 620 },
        state: 'completed',
        progress: 100,
        nextZoneId: 2,
    },
    {
        id: 2,
        name: 'Plazoleta Jairo Varela',
        description: 'El corazón de la salsa caleña. ¡Ritmo y aventura te esperan!',
        position: { x: 830, y: 420 },
        state: 'active',
        progress: 35,
        nextZoneId: 3,
    },
    {
        id: 3,
        name: 'Zoológico de Cali (Sur)',
        description: 'Otra área del zoológico con desafíos más avanzados.',
        position: { x: 380, y: 1100 },
        state: 'locked',
        requirements: 'Completar "Plazoleta Jairo Varela"',
        nextZoneId: 4,
    },
    {
        id: 4,
        name: 'Cristo Rey',
        description: '¡Desafía al Líder José en el Gimnasio Cristo Rey! El mirador más icónico de Cali te espera.',
        position: { x: 930, y: 1050 },
        state: 'active',
        progress: 0,
        nextZoneId: 5,
    },
    {
        id: 5,
        name: 'Parque de la Caña',
        description: 'El destino final. Demuestra todo lo que has aprendido.',
        position: { x: 600, y: 1450 },
        state: 'active',
        progress: 10,
        requirements: 'Completar "Cristo de Caña"',
    },
];

export const useMapStore = defineStore('map', () => {
    // STATE
    const zones = ref<Zone[]>(initialZones);
    const selectedZoneId = ref<number | null>(null);

    // GETTERS
    const allZones = computed(() => zones.value);

    const getSelectedZone = computed<Zone | null>(() => {
        if (selectedZoneId.value === null) return null;
        return zones.value.find(z => z.id === selectedZoneId.value) || null;
    });

    // ACTIONS
    function setSelectedZone(zone: Zone | null) {
        selectedZoneId.value = zone ? zone.id : null;
    }

    /**
     * Simula la finalización de una zona y actualiza la siguiente.
     * @param zoneId ID de la zona completada.
     */
    function completeZone(zoneId: number) {
        const zoneIndex = zones.value.findIndex(z => z.id === zoneId);
        if (zoneIndex === -1) return;

        // 1. Marcar la zona actual como completada
        const zone = zones.value[zoneIndex];
        if (!zone) return;

        zone.state = 'completed';
        zone.progress = 100;

        // 2. Activar la siguiente zona si existe
        const nextZoneId = zone.nextZoneId;

        if (nextZoneId) {
            const nextZoneIndex = zones.value.findIndex(z => z.id === nextZoneId);
            if (nextZoneIndex !== -1) {
                const nextZone = zones.value[nextZoneIndex];
                if (nextZone) {
                    nextZone.state = 'active';
                    nextZone.progress = 0;
                }
            }
        }

        // 3. Limpiar la selección
        setSelectedZone(null);
        console.log(`Zona ${zoneId} completada. ¡Progreso guardado!`);
    }

    return {
        // State & Getters
        allZones,
        getSelectedZone,
        // Actions
        setSelectedZone,
        completeZone,
    };
});
