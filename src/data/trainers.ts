import type { Pokemon } from '@/domain/battle/engine/entities'
import { MOVES } from './moves'

/**
 * Interfaz para un Entrenador Pokémon
 * Contiene su equipo de batalla completo
 */
export interface Trainer {
  id: string
  name: string
  title: string // "Gym Leader", "Elite Four", etc.
  team: Pokemon[]
  sprite?: string
  reward: number
}

/**
 * Equipo de Brock - Líder de gimnasio (tipo Roca)
 */
export const TRAINER_BROCK: Trainer = {
  id: 'trainer_brock',
  name: 'Brock',
  title: 'Gym Leader',
  reward: 2400,
  team: [
    {
      id: 'brock_geodude',
      name: 'Geodude',
      types: ['Rock', 'Ground'],
      level: 32,
      stats: { hp: 100, atk: 120, def: 130, spAtk: 65, spDef: 65, speed: 45 },
      currentHp: 100,
      moves: [MOVES[0]!, MOVES[1]!, MOVES[2]!, MOVES[3]!],
    },
    {
      id: 'brock_onix',
      name: 'Onix',
      types: ['Rock', 'Ground'],
      level: 34,
      stats: { hp: 95, atk: 150, def: 120, spAtk: 65, spDef: 70, speed: 70 },
      currentHp: 95,
      moves: [MOVES[0]!, MOVES[1]!, MOVES[2]!, MOVES[3]!],
    },
    {
      id: 'brock_steelix',
      name: 'Steelix',
      types: ['Steel', 'Ground'],
      level: 36,
      stats: { hp: 110, atk: 165, def: 200, spAtk: 55, spDef: 65, speed: 30 },
      currentHp: 110,
      moves: [MOVES[0]!, MOVES[1]!, MOVES[2]!, MOVES[3]!],
    },
    {
      id: 'brock_rhyhorn',
      name: 'Rhyhorn',
      types: ['Ground', 'Rock'],
      level: 33,
      stats: { hp: 105, atk: 130, def: 100, spAtk: 45, spDef: 45, speed: 40 },
      currentHp: 105,
      moves: [MOVES[0]!, MOVES[1]!, MOVES[2]!, MOVES[3]!],
    },
    {
      id: 'brock_cranidos',
      name: 'Cranidos',
      types: ['Rock'],
      level: 35,
      stats: { hp: 92, atk: 140, def: 75, spAtk: 65, spDef: 65, speed: 100 },
      currentHp: 92,
      moves: [MOVES[0]!, MOVES[1]!, MOVES[2]!, MOVES[3]!],
    },
    {
      id: 'brock_rhydon',
      name: 'Rhydon',
      types: ['Ground', 'Rock'],
      level: 38,
      stats: { hp: 125, atk: 150, def: 120, spAtk: 55, spDef: 55, speed: 40 },
      currentHp: 125,
      moves: [MOVES[0]!, MOVES[1]!, MOVES[2]!, MOVES[3]!],
    },
  ],
}

/**
 * Equipo de Misty - Líder de gimnasio (tipo Agua)
 */
export const TRAINER_MISTY: Trainer = {
  id: 'trainer_misty',
  name: 'Misty',
  title: 'Gym Leader',
  reward: 2400,
  team: [
    {
      id: 'misty_staryu',
      name: 'Staryu',
      types: ['Water'],
      level: 31,
      stats: { hp: 85, atk: 80, def: 88, spAtk: 100, spDef: 85, speed: 115 },
      currentHp: 85,
      moves: [MOVES[0]!, MOVES[1]!, MOVES[2]!, MOVES[3]!],
    },
    {
      id: 'misty_goldeen',
      name: 'Goldeen',
      types: ['Water'],
      level: 33,
      stats: { hp: 105, atk: 92, def: 65, spAtk: 65, spDef: 80, speed: 63 },
      currentHp: 105,
      moves: [MOVES[0]!, MOVES[1]!, MOVES[2]!, MOVES[3]!],
    },
    {
      id: 'misty_starmie',
      name: 'Starmie',
      types: ['Water', 'Psychic'],
      level: 36,
      stats: { hp: 115, atk: 100, def: 115, spAtk: 130, spDef: 115, speed: 115 },
      currentHp: 115,
      moves: [MOVES[0]!, MOVES[1]!, MOVES[2]!, MOVES[3]!],
    },
    {
      id: 'misty_lapras',
      name: 'Lapras',
      types: ['Water', 'Ice'],
      level: 34,
      stats: { hp: 130, atk: 85, def: 80, spAtk: 85, spDef: 95, speed: 60 },
      currentHp: 130,
      moves: [MOVES[0]!, MOVES[1]!, MOVES[2]!, MOVES[3]!],
    },
    {
      id: 'misty_gyarados',
      name: 'Gyarados',
      types: ['Water', 'Flying'],
      level: 35,
      stats: { hp: 125, atk: 150, def: 90, spAtk: 80, spDef: 100, speed: 81 },
      currentHp: 125,
      moves: [MOVES[0]!, MOVES[1]!, MOVES[2]!, MOVES[3]!],
    },
    {
      id: 'misty_cloyster',
      name: 'Cloyster',
      types: ['Water', 'Ice'],
      level: 37,
      stats: { hp: 115, atk: 95, def: 180, spAtk: 85, spDef: 65, speed: 70 },
      currentHp: 115,
      moves: [MOVES[0]!, MOVES[1]!, MOVES[2]!, MOVES[3]!],
    },
  ],
}

/**
 * Equipo de Lieutenant Surge - Líder de gimnasio (tipo Eléctrico)
 */
export const TRAINER_SURGE: Trainer = {
  id: 'trainer_surge',
  name: 'Lt. Surge',
  title: 'Gym Leader',
  reward: 2800,
  team: [
    {
      id: 'surge_voltorb',
      name: 'Voltorb',
      types: ['Electric'],
      level: 30,
      stats: { hp: 80, atk: 100, def: 70, spAtk: 100, spDef: 70, speed: 150 },
      currentHp: 80,
      moves: [MOVES[0]!, MOVES[1]!, MOVES[2]!, MOVES[3]!],
    },
    {
      id: 'surge_pikachu',
      name: 'Pikachu',
      types: ['Electric'],
      level: 33,
      stats: { hp: 95, atk: 85, def: 75, spAtk: 90, spDef: 80, speed: 110 },
      currentHp: 95,
      moves: [MOVES[0]!, MOVES[1]!, MOVES[2]!, MOVES[3]!],
    },
    {
      id: 'surge_electabuzz',
      name: 'Electabuzz',
      types: ['Electric'],
      level: 35,
      stats: { hp: 100, atk: 83, def: 57, spAtk: 95, spDef: 85, speed: 105 },
      currentHp: 100,
      moves: [MOVES[0]!, MOVES[1]!, MOVES[2]!, MOVES[3]!],
    },
    {
      id: 'surge_raichu',
      name: 'Raichu',
      types: ['Electric'],
      level: 37,
      stats: { hp: 110, atk: 120, def: 90, spAtk: 120, spDef: 100, speed: 100 },
      currentHp: 110,
      moves: [MOVES[0]!, MOVES[1]!, MOVES[2]!, MOVES[3]!],
    },
    {
      id: 'surge_electrode',
      name: 'Electrode',
      types: ['Electric'],
      level: 34,
      stats: { hp: 80, atk: 100, def: 80, spAtk: 120, spDef: 80, speed: 150 },
      currentHp: 80,
      moves: [MOVES[0]!, MOVES[1]!, MOVES[2]!, MOVES[3]!],
    },
    {
      id: 'surge_magneton',
      name: 'Magneton',
      types: ['Electric', 'Steel'],
      level: 36,
      stats: { hp: 85, atk: 100, def: 115, spAtk: 130, spDef: 90, speed: 70 },
      currentHp: 85,
      moves: [MOVES[0]!, MOVES[1]!, MOVES[2]!, MOVES[3]!],
    },
  ],
}

/**
 * Equipo de Erika - Líder de gimnasio (tipo Planta)
 */
export const TRAINER_ERIKA: Trainer = {
  id: 'trainer_erika',
  name: 'Erika',
  title: 'Gym Leader',
  reward: 2400,
  team: [
    {
      id: 'erika_victreebel',
      name: 'Victreebel',
      types: ['Grass', 'Poison'],
      level: 34,
      stats: { hp: 100, atk: 105, def: 65, spAtk: 100, spDef: 70, speed: 80 },
      currentHp: 100,
      moves: [MOVES[0]!, MOVES[1]!, MOVES[2]!, MOVES[3]!],
    },
    {
      id: 'erika_tangela',
      name: 'Tangela',
      types: ['Grass'],
      level: 33,
      stats: { hp: 100, atk: 75, def: 85, spAtk: 90, spDef: 75, speed: 60 },
      currentHp: 100,
      moves: [MOVES[0]!, MOVES[1]!, MOVES[2]!, MOVES[3]!],
    },
    {
      id: 'erika_vileplume',
      name: 'Vileplume',
      types: ['Grass', 'Poison'],
      level: 36,
      stats: { hp: 105, atk: 80, def: 85, spAtk: 110, spDef: 90, speed: 50 },
      currentHp: 105,
      moves: [MOVES[0]!, MOVES[1]!, MOVES[2]!, MOVES[3]!],
    },
    {
      id: 'erika_gloom',
      name: 'Gloom',
      types: ['Grass', 'Poison'],
      level: 31,
      stats: { hp: 100, atk: 80, def: 80, spAtk: 85, spDef: 80, speed: 40 },
      currentHp: 100,
      moves: [MOVES[0]!, MOVES[1]!, MOVES[2]!, MOVES[3]!],
    },
    {
      id: 'erika_bellossom',
      name: 'Bellossom',
      types: ['Grass'],
      level: 35,
      stats: { hp: 100, atk: 80, def: 95, spAtk: 110, spDef: 100, speed: 75 },
      currentHp: 100,
      moves: [MOVES[0]!, MOVES[1]!, MOVES[2]!, MOVES[3]!],
    },
    {
      id: 'erika_exeggutor',
      name: 'Exeggutor',
      types: ['Grass', 'Psychic'],
      level: 37,
      stats: { hp: 105, atk: 95, def: 85, spAtk: 125, spDef: 75, speed: 55 },
      currentHp: 105,
      moves: [MOVES[0]!, MOVES[1]!, MOVES[2]!, MOVES[3]!],
    },
  ],
}

/**
 * Equipo de Blaine - Líder de gimnasio (tipo Fuego)
 */
export const TRAINER_BLAINE: Trainer = {
  id: 'trainer_blaine',
  name: 'Blaine',
  title: 'Gym Leader',
  reward: 2800,
  team: [
    {
      id: 'blaine_growlithe',
      name: 'Growlithe',
      types: ['Fire'],
      level: 31,
      stats: { hp: 100, atk: 110, def: 80, spAtk: 100, spDef: 80, speed: 60 },
      currentHp: 100,
      moves: [MOVES[0]!, MOVES[1]!, MOVES[2]!, MOVES[3]!],
    },
    {
      id: 'blaine_ponyta',
      name: 'Ponyta',
      types: ['Fire'],
      level: 33,
      stats: { hp: 100, atk: 110, def: 65, spAtk: 80, spDef: 65, speed: 90 },
      currentHp: 100,
      moves: [MOVES[0]!, MOVES[1]!, MOVES[2]!, MOVES[3]!],
    },
    {
      id: 'blaine_arcanine',
      name: 'Arcanine',
      types: ['Fire'],
      level: 35,
      stats: { hp: 120, atk: 150, def: 100, spAtk: 100, spDef: 80, speed: 95 },
      currentHp: 120,
      moves: [MOVES[0]!, MOVES[1]!, MOVES[2]!, MOVES[3]!],
    },
    {
      id: 'blaine_rapidash',
      name: 'Rapidash',
      types: ['Fire', 'Ground'],
      level: 37,
      stats: { hp: 120, atk: 140, def: 90, spAtk: 105, spDef: 90, speed: 100 },
      currentHp: 120,
      moves: [MOVES[0]!, MOVES[1]!, MOVES[2]!, MOVES[3]!],
    },
    {
      id: 'blaine_vulpix',
      name: 'Vulpix',
      types: ['Fire'],
      level: 32,
      stats: { hp: 95, atk: 76, def: 73, spAtk: 100, spDef: 85, speed: 99 },
      currentHp: 95,
      moves: [MOVES[0]!, MOVES[1]!, MOVES[2]!, MOVES[3]!],
    },
    {
      id: 'blaine_charizard',
      name: 'Charizard',
      types: ['Fire', 'Flying'],
      level: 38,
      stats: { hp: 109, atk: 133, def: 100, spAtk: 155, spDef: 100, speed: 120 },
      currentHp: 109,
      moves: [MOVES[0]!, MOVES[1]!, MOVES[2]!, MOVES[3]!],
    },
  ],
}

/**
 * Array de todos los entrenadores disponibles
 */
export const ALL_TRAINERS: Trainer[] = [
  TRAINER_BROCK,
  TRAINER_MISTY,
  TRAINER_SURGE,
  TRAINER_ERIKA,
  TRAINER_BLAINE,
]

/**
 * Obtener un entrenador aleatorio
 * @returns Un entrenador Pokémon seleccionado aleatoriamente
 */
export function getRandomTrainer(): Trainer {
  const randomIndex = Math.floor(Math.random() * ALL_TRAINERS.length)
  return ALL_TRAINERS[randomIndex]!
}

/**
 * Obtener un entrenador por su ID
 * @param id - ID único del entrenador
 * @returns El entrenador si existe, undefined en caso contrario
 */
export function getTrainerById(id: string): Trainer | undefined {
  return ALL_TRAINERS.find((trainer) => trainer.id === id)
}

/**
 * Obtener el nombre del título del entrenador
 * @param trainer - Entrenador
 * @returns Nombre completo del entrenador con su título
 */
export function getTrainerFullName(trainer: Trainer): string {
  return `${trainer.title} ${trainer.name}`
}

/**
 * Obtener la recompensa total del entrenador
 * @param trainer - Entrenador
 * @returns Cantidad de dinero ganado al vencer al entrenador
 */
export function getTrainerReward(trainer: Trainer): number {
  return trainer.reward
}
