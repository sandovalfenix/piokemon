import type { Item } from '@/models/item';

// Mock data for potions
const POTIONS: Item[] = [
  {
    id: 'potion',
    name: 'Poción',
    description: 'Restaura 20 PS',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/potion.png',
    quantity: 3,
    category: 'medicine'
  },
  {
    id: 'super-potion',
    name: 'Superpoción',
    description: 'Restaura 50 PS',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/super-potion.png',
    quantity: 1,
    category: 'medicine'
  },
  {
    id: 'hyper-potion',
    name: 'Hiperpoción',
    description: 'Restaura 200 PS',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/hyper-potion.png',
    quantity: 0,
    category: 'medicine'
  },
  {
    id: 'max-potion',
    name: 'Poción Máxima',
    description: 'Restaura todos los PS',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/max-potion.png',
    quantity: 0,
    category: 'medicine'
  }
];

export const itemService = {
  /**
   * Get all potion items
   */
  getPotions(): Promise<Item[]> {
    // Simulate async call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(POTIONS.filter(item => item.category === 'medicine'));
      }, 100);
    });
  },

  /**
   * Use an item (decrement quantity)
   * @param itemId
   */
  useItem(itemId: string): boolean {
      const item = POTIONS.find(i => i.id === itemId);
      if (item && item.quantity > 0) {
          item.quantity--;
          return true;
      }
      return false;
  }
};
