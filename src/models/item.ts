export interface Item {
  id: string;
  name: string;
  description: string;
  sprite: string;
  quantity: number;
  category: 'medicine' | 'pokeballs' | 'battle-items' | 'berries' | 'other';
}
