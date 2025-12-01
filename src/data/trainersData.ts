/**
 * Datos de entrenadores con sprites e información
 */

export interface TrainerData {
  id: string
  name: string
  imageUrl: string
  description: string
}

export const TRAINERS: TrainerData[] = [
  {
    id: 'ash',
    name: 'Ash Ketchum',
    imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/male/1.png',
    description: 'El campeón de Pallet Town',
  },
  {
    id: 'misty',
    name: 'Misty',
    imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/female/1.png',
    description: 'Líder del Gimnasio Azul',
  },
  {
    id: 'brock',
    name: 'Brock',
    imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/male/2.png',
    description: 'Criador experto de Pokémon',
  },
  {
    id: 'gary',
    name: 'Gary Oak',
    imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/male/3.png',
    description: 'Rival decidido',
  },
  {
    id: 'surge',
    name: 'Lt. Surge',
    imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/male/4.png',
    description: 'Capitán del ejército',
  },
  {
    id: 'erika',
    name: 'Erika',
    imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/female/2.png',
    description: 'Maestra de Pokémon planta',
  },
]

/**
 * Obtener entrenador aleatorio
 */
export function getRandomTrainer(): TrainerData {
  return TRAINERS[Math.floor(Math.random() * TRAINERS.length)]!
}

/**
 * Obtener entrenador por ID
 */
export function getTrainerById(id: string): TrainerData | undefined {
  return TRAINERS.find(t => t.id === id)
}
