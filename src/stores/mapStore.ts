// src/stores/mapStore.ts

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Zone } from '../types/zone'; 

// --- Datos Mockup de Zonas ---
const initialZones: Zone[] = [
    {
        id: 1,
        name: 'Bosque de Inicio',
        description: 'La primera zona. Aprende los fundamentos.',
        position: { x: 100, y: 800 },
        state: 'completed',
        progress: 100,
        nextZoneId: 2,
    },
    {
        id: 2,
        name: 'Cuevas Oscuras',
        description: 'Navega por las profundidades y evita las trampas.',
        position: { x: 300, y: 600 },
        state: 'active',
        progress: 50,
        nextZoneId: 3,
    },
    {
        id: 3,
        name: 'Pico Nevado',
        description: 'Requiere el item "Botas de Hielo". ¡Cuidado con el frío!',
        position: { x: 500, y: 350 },
        state: 'locked',
        requirements: 'Completar "Cuevas Oscuras"',
        nextZoneId: 4,
    },
    {
        id: 4,
        name: 'Ciudad Flotante',
        description: 'El desafío final. Solo para los más valientes.',
        position: { x: 700, y: 100 },
        state: 'locked',
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