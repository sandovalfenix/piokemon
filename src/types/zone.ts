// src/types/zone.ts - Solo definiciones de tipos

export type ZoneState = 'locked' | 'active' | 'completed';

export interface Zone {
  id: number;
  name: string;
  description: string;
  position: { x: number; y: number };
  state: ZoneState;
  requirements?: string;
  progress?: number;
  nextZoneId?: number;
  subZoneMap?: {
    nodes: SubZoneNode[];
  };
}

export interface SubZoneNode {
  id: string;
  name: string;
  description: string;
  position: { x: number; y: number };
  state: ZoneState;
  icon: string;
  type: 'center' | 'mission' | 'wild_pokemon' | 'npc' | 'gym_challenge';
  details?: string[];
  trainerName?: string;
  nextId?: string;
  imageUrl?: string;
}
