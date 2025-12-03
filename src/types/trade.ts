export interface TradeItem {
    id: string;
    name: string;
    image: string;
    value: number;
    rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythical';
    quantity: number;
}

export type TradeStatus = 'idle' | 'locked' | 'confirming' | 'completed' | 'cancelled';

export interface PlayerTradeState {
    name: string;
    items: (TradeItem | null)[];
    isReady: boolean;
    money: number;
}
