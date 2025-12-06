// src/stores/mapStore.ts

import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { SubZoneNode, Zone } from '../types/zone';

// --- Datos de Nodos para la Zona Parque de la Caña (ID 5) ---
const parqueDeLaCañaNodes: SubZoneNode[] = [
    {
        id: 'start_center',
        name: 'Punto de Encuentro y Curación',
        description: 'Lugar de inicio. El Entrenador te da la Misión de las Válvulas. Cura a tus Pokémon aquí.',
        position: { x: 100, y: 500 },
        state: 'completed',
        icon: 'center',
        type: 'center',
        details: ['Centro de Curación Pokémon disponible.', 'Tienda de ítems básicos.'],
        nextId: 'valve_101',
        imageUrl: '/assets/parque_center_image.jpg',
    },
    {
        id: 'valve_101',
        name: 'Válvula 1: Conversación',
        description: 'Debes aceptar la misión en este punto antes de continuar. Habla con el Entrenador Juan.',
        position: { x: 300, y: 600 },
        state: 'active',
        icon: 'mission',
        type: 'mission',
        trainerName: 'Entrenador Juan',
        nextId: 'valve_102',
        imageUrl: '/assets/parque_valve_101.jpg',
    },
    {
        id: 'valve_102',
        name: 'Válvula 2: Filtración Sur',
        description: 'Primera batalla obligatoria. Demuestra que sabes usar movimientos de tipo Agua.',
        position: { x: 550, y: 450 },
        state: 'locked',
        icon: 'mission',
        type: 'mission',
        trainerName: 'Pescador Luis',
        nextId: 'wild_zone',
        imageUrl: '/assets/parque_valve_102.jpg',
    },
    {
        id: 'wild_zone',
        name: 'Zona de Captura Rara',
        description: 'Encuentra un Pokémon exclusivo de la zona. ¡Debes capturarlo para obtener la llave de la Válvula 3!',
        position: { x: 450, y: 300 },
        state: 'locked',
        icon: 'wild',
        type: 'wild_pokemon',
        details: ['Pokémon raro: Lotad', 'Objetos ocultos: Super Ball x3'],
        nextId: 'valve_103',
        imageUrl: '/assets/parque_wild_capture.jpg',
    },
    {
        id: 'valve_103',
        name: 'Válvula 3: Desvío Acuático',
        description: 'Batalla de tipo Planta cerca de los árboles. El camino se hace más complejo.',
        position: { x: 700, y: 200 },
        state: 'locked',
        icon: 'battle',
        type: 'mission',
        trainerName: 'Guardaparques Ana',
        nextId: 'valve_104',
        imageUrl: '/assets/parque_valve_103.jpg',
    },
    {
        id: 'valve_104',
        name: 'Válvula 4: Prueba de Río',
        description: 'La última válvula antes del líder. Un combate doble de tipo Volador para cruzar el río.',
        position: { x: 850, y: 400 },
        state: 'locked',
        icon: 'mission',
        type: 'mission',
        trainerName: 'Explorador David',
        nextId: 'gym_final',
        imageUrl: '/assets/parque_valve_104.jpg',
    },
    {
        id: 'gym_final',
        name: 'Gimnasio Festi-Verde',
        description: 'El líder Manuel te espera para el desafío final. ¡El río te dará la fuerza!',
        position: { x: 650, y: 650 },
        state: 'locked',
        icon: 'gym',
        type: 'gym_challenge',
        details: [
            'Medalla Caña Dulce',
            'MT Cascada (Waterfall)',
            'Permite usar Cascada fuera de combate.',
            'Aumenta la Velocidad de tus Pokémon acuáticos.',
        ],
        imageUrl: '/assets/parque_gym_leader.jpg',
    },
];

// --- Datos de Zonas de Cali ---
const initialZones: Zone[] = [
    {
        id: 4,
        name: 'Zona Cristo Rey',
        description: 'Desde lo alto se observa todo el viaje. ¡Buen comienzo!',
        position: { x: 950, y: 1550 },
        state: 'completed',
        progress: 100,
        nextZoneId: 2,
    },
    {
        id: 2,
        name: 'Zona Zoo de Cali',
        description: 'La primera zona. Aprende los fundamentos.',
        position: { x: 250, y: 1550 },
        state: 'active',
        progress: 35,
        requirements: 'Completar "Zona Cristo Rey"',
        nextZoneId: 5,
    },
    {
        id: 5,
        name: 'Zona Parque de la Caña',
        description: 'Encuentros amistosos y el profesor aguardando tu llegada.',
        position: { x: 600, y: 1600 },
        state: 'active',
        progress: 0,
        requirements: 'Completar "Zona Zoo de Cali"',
        nextZoneId: 1,
        subZoneMap: { nodes: parqueDeLaCañaNodes },
    },
    {
        id: 1,
        name: 'Zona Plazoleta Jairo Varela',
        description: 'Rocas, hongos brillantes y rutas inesperadas.',
        position: { x: 950, y: 350 },
        state: 'locked',
        requirements: 'Al menos 50% de Zona Parque de la Caña',
        nextZoneId: 3,
    },
    {
        id: 3,
        name: 'Zona La Ermita',
        description: 'La caída de agua marca la entrada al reto final.',
        position: { x: 250, y: 350 },
        state: 'locked',
        requirements: 'Completar "Zona Plazoleta Jairo Varela"',
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
     * Obtiene una zona por su ID
     */
    function getZoneById(zoneId: number): Zone | null {
        return zones.value.find(z => z.id === zoneId) || null;
    }

    /**
     * Obtiene los nodos de sub-zona para una zona específica
     * Retorna una copia profunda para evitar mutaciones directas
     */
    function getSubZoneNodes(zoneId: number): SubZoneNode[] | undefined {
        const zone = zones.value.find(z => z.id === zoneId);
        if (!zone?.subZoneMap?.nodes) return undefined;
        return JSON.parse(JSON.stringify(zone.subZoneMap.nodes));
    }

    /**
     * Actualiza el estado de un nodo de sub-zona
     */
    function updateSubZoneNodeState(zoneId: number, nodeId: string, newState: 'active' | 'completed') {
        const zone = zones.value.find(z => z.id === zoneId);
        if (!zone?.subZoneMap) return;

        const node = zone.subZoneMap.nodes.find(n => n.id === nodeId);
        if (node) {
            node.state = newState;

            // Recalcular progreso (solo nodos de tipo 'mission' y 'wild_pokemon')
            const missionNodes = zone.subZoneMap.nodes.filter(
                n => n.type === 'mission' || n.type === 'wild_pokemon'
            );
            const completedMissions = missionNodes.filter(n => n.state === 'completed').length;
            const totalMissions = missionNodes.length;

            if (totalMissions > 0) {
                zone.progress = Math.floor((completedMissions / totalMissions) * 100);
            }
        }
    }

    /**
     * Marca una zona como completada y activa la siguiente
     */
    function completeZone(zoneId: number) {
        const zoneIndex = zones.value.findIndex(z => z.id === zoneId);
        if (zoneIndex === -1) return;

        const zone = zones.value[zoneIndex];
        if (!zone) return;

        zone.state = 'completed';
        zone.progress = 100;

        // Activar la siguiente zona si existe
        const nextZoneId = zone.nextZoneId;
        if (nextZoneId) {
            const nextZone = zones.value.find(z => z.id === nextZoneId);
            if (nextZone && nextZone.state === 'locked') {
                nextZone.state = 'active';
                nextZone.progress = 0;
                delete nextZone.requirements;
            }
        }

        setSelectedZone(null);
        console.log(`Zona ${zoneId} completada. ¡Progreso guardado!`);
    }

    /**
     * Desbloquea la siguiente zona
     */
    function unlockNextZone(currentZoneId: number): Zone | null {
        const currentZone = zones.value.find(z => z.id === currentZoneId);
        if (!currentZone?.nextZoneId) return null;

        const nextZone = zones.value.find(z => z.id === currentZone.nextZoneId);
        if (!nextZone) return null;

        if (nextZone.state === 'locked') {
            nextZone.state = 'active';
            nextZone.progress = 0;
            delete nextZone.requirements;
            console.log(`Zona "${nextZone.name}" desbloqueada.`);
            return nextZone;
        }

        return null;
    }

    return {
        // State & Getters
        allZones,
        getSelectedZone,
        // Actions
        setSelectedZone,
        getZoneById,
        getSubZoneNodes,
        updateSubZoneNodeState,
        completeZone,
        unlockNextZone,
    };
});
