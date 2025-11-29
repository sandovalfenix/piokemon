import type { Move } from '@/domain/battle/engine/entities'

export const MOVES: Move[] = [
  { id: 'tackle', name: 'Tackle', type: 'Normal', power: 40, accuracy: 100, category: 'physical' },
  { id: 'ember', name: 'Ember', type: 'Fire', power: 40, accuracy: 100, category: 'special' },
  { id: 'water-gun', name: 'Water Gun', type: 'Water', power: 40, accuracy: 100, category: 'special' },
  { id: 'thunder', name: 'Thunder', type: 'Electric', power: 110, accuracy: 70, category: 'special' },
]
