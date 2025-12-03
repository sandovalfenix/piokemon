// src/types/zone.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Zone, SubZoneNode } from '../types/zone'; 
export type ZoneState = 'locked' | 'active' | 'completed';

export interface Zone {
  id: number;
  name: string;
  description: string;
  position: { x: number; y: number }; // Coordenadas dentro del Canvas
  state: ZoneState;
  requirements?: string; // Solo si está 'locked'
  progress?: number;     // De 0 a 100
  nextZoneId?: number;   // Para definir las conexiones
}

// --- Datos de Nodos para la Zona Parque de la Caña (ID 3) ---
const parqueDeLaCañaNodes: SubZoneNode[] = [
    {
        id: 'start_center',
        name: 'Punto de Encuentro y Curación',
        description: 'Lugar de inicio. El Entrenador te da la Misión de las Válvulas. Cura a tus Pokémon aquí.',
        position: { x: 100, y: 500 }, 
        state: 'completed', 
        icon: '🏠',
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
        icon: '💬',
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
        icon: '⚙️',
        type: 'mission',
        trainerName: 'Pescador Luis',
        nextId: 'wild_zone', // 🔑 CAMBIO: Ahora va a la zona de captura
        imageUrl: '/assets/parque_valve_102.jpg',
    },
    // 🔑 NUEVO NODO: Zona de Captura
    {
        id: 'wild_zone',
        name: 'Zona de Captura Rara',
        description: 'Encuentra un Pokémon exclusivo de la zona. ¡Debes capturarlo para obtener la llave de la Válvula 3!',
        position: { x: 450, y: 300 }, // Nueva posición
        state: 'locked',
        icon: '🌳',
        type: 'wild_pokemon', // Tipo de nodo
        details: ['Pokémon raro: Lotad', 'Objetos ocultos: Super Ball x3'],
        nextId: 'valve_103', // Conecta con la Válvula 3
        imageUrl: '/assets/parque_wild_capture.jpg',
    },
    // 🔑 CAMBIO: Posición ajustada y nextId modificado para la nueva cadena
    {
        id: 'valve_103',
        name: 'Válvula 3: Desvío Acuático',
        description: 'Batalla de tipo Planta cerca de los árboles. El camino se hace más complejo.',
        position: { x: 700, y: 200 }, 
        state: 'locked',
        icon: '⚔️',
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
        icon: '🌀',
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
        icon: '🏆',
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

// ... (El resto del store permanece igual)
export const useMapStore = defineStore('map', () => {
    // STATE
    const zones = ref<Zone[]>([
        { id: 4, name: 'Zona Cristo Rey ', description: 'Desde lo alto se observa todo el viaje. ¡Buen comienzo!', position: { x: 600, y: 180 }, state: 'completed', progress: 100, nextZoneId: 2, },
        { id: 2, name: 'Zona Zoo de cali', description: 'La primera zona. Aprende los fundamentos.', position: { x: 310, y: 440 }, state: 'active', progress: 35, requirements: 'Completar "Zona Cristo Rey  "', nextZoneId: 3, },
        { id: 5, name: 'Zona Parque de la caña', description: 'Encuentros amistosos y el profesor aguardando tu llegada.', position: { x: 600, y: 520 }, state: 'active', progress: 0, requirements: 'Completar "Zona Zoo de cali  "', nextZoneId: 4, subZoneMap: { nodes: parqueDeLaCañaNodes }, },
        { id: 1, name: 'Zona Plazoleta Jairo Varela', description: 'Rocas, hongos brillantes y rutas inesperadas.', position: { x: 890, y: 470 }, state: 'locked', requirements: 'Al menos 50% de Zona Parque de la caña', nextZoneId: 5, },
        { id: 3, name: 'Zona La Ermita', description: 'La caída de agua marca la entrada al reto final.', position: { x: 600, y: 830 }, state: 'locked', requirements: 'Completar "Zona Plazoleta Jairo Varela"', },
    ]);
    const selectedZoneId = ref<number | null>(null);

    // GETTERS
    const allZones = computed(() => zones.value);
    function getZoneById(id: number): Zone | undefined { return zones.value.find(z => z.id === id); }
    function getSubZoneNodes(zoneId: number): SubZoneNode[] | undefined {
        const nodes = zones.value.find(z => z.id === zoneId)?.subZoneMap?.nodes;
        return nodes ? JSON.parse(JSON.stringify(nodes)) : undefined; 
    }

    // ACTIONS
    function setSelectedZone(zone: Zone | null) { selectedZoneId.value = zone ? zone.id : null; }
    function updateSubZoneNodeState(zoneId: number, nodeId: string, newState: 'active' | 'completed') {
        const zone = zones.value.find(z => z.id === zoneId);
        if (!zone || !zone.subZoneMap) return;

        const node = zone.subZoneMap.nodes.find(n => n.id === nodeId);
        if (node) {
            node.state = newState;
            
            // Recalcular progreso (solo se cuentan los nodos de tipo 'mission' y 'wild_pokemon' como pasos)
            const missionNodes = zone.subZoneMap.nodes.filter(n => n.type === 'mission' || n.type === 'wild_pokemon');
            const completedMissions = missionNodes.filter(n => n.state === 'completed').length;
            const totalMissions = missionNodes.length;
            if (totalMissions > 0) {
                 zone.progress = Math.floor((completedMissions / totalMissions) * 100);
            }
        }
    }
    function completeZone(zoneId: number) {
        const zoneIndex = zones.value.findIndex(z => z.id === zoneId);
        if (zoneIndex === -1) return;

        zones.value[zoneIndex].state = 'completed';
        zones.value[zoneIndex].progress = 100;

        const nextZoneId = zones.value[zoneIndex].nextZoneId;
        
        if (nextZoneId) {
            const nextZoneIndex = zones.value.findIndex(z => z.id === nextZoneId);
            if (nextZoneIndex !== -1) {
                zones.value[nextZoneIndex].state = 'active';
                zones.value[nextZoneIndex].progress = 0;
            }
        }
        setSelectedZone(null);
    }

    return { allZones, getZoneById, getSubZoneNodes, setSelectedZone, completeZone, updateSubZoneNodeState, };
});