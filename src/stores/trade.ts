import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { TradeItem, TradeStatus, PlayerTradeState } from '../types/trade';
import itemsData from '../data/items.json';
import playersData from '../data/players.json';

export const useTradeStore = defineStore('trade', () => {
    const status = ref<TradeStatus>('idle');
    const timer = ref(0);

    // Helper to get item by ID
    const getItemById = (id: string): TradeItem | null => {
        const item = itemsData.find(i => i.id === id);
        return item ? { ...item } as TradeItem : null;
    };

    // Initialize Players from JSON
    const localPlayer = ref<PlayerTradeState>({
        name: playersData.local.name,
        items: Array(4).fill(null),
        isReady: false,
        money: playersData.local.money
    });

    const remotePlayer = ref<PlayerTradeState>({
        name: playersData.remote.name,
        items: playersData.remote.inventory.map(slot => {
            const item = getItemById(slot.itemId);
            if (item) {
                item.quantity = slot.quantity;
                return item;
            }
            return null;
        }).concat(Array(4 - playersData.remote.inventory.length).fill(null)),
        isReady: false,
        money: playersData.remote.money
    });

    // Initialize Inventory (Available items for demo)
    // For this demo, we'll populate the sidebar with the local player's inventory from JSON
    const inventory = ref<TradeItem[]>(
        playersData.local.inventory.map(slot => {
            const item = getItemById(slot.itemId);
            if (item) {
                item.quantity = slot.quantity;
                return item;
            }
            return null;
        }).filter((i): i is TradeItem => i !== null)
    );

    const startCountdown = () => {
        status.value = 'confirming';
        timer.value = 10;
        const interval = setInterval(() => {
            timer.value--;
            if (timer.value <= 0) {
                clearInterval(interval);
                status.value = 'completed';
            }
        }, 1000);
    };

    const toggleReady = () => {
        localPlayer.value.isReady = !localPlayer.value.isReady;
        // Simulate remote player ready
        if (localPlayer.value.isReady) {
            setTimeout(() => {
                remotePlayer.value.isReady = true;
                if (localPlayer.value.isReady && remotePlayer.value.isReady) {
                    startCountdown();
                }
            }, 1500);
        } else {
            remotePlayer.value.isReady = false;
            status.value = 'idle';
        }
    };

    const cancelTrade = () => {
        status.value = 'cancelled';
        localPlayer.value.isReady = false;
        remotePlayer.value.isReady = false;
        timer.value = 0;
        setTimeout(() => status.value = 'idle', 2000);
    }

    const addItemToSlot = (item: TradeItem, index: number, isLocal: boolean = true) => {
        const targetPlayer = isLocal ? localPlayer.value : remotePlayer.value;
        // Clone item to avoid reference issues
        const newItem = { ...item, quantity: 1 };
        targetPlayer.items[index] = newItem;
    };

    const addItemToTrade = (item: TradeItem, isLocal: boolean = true) => {
        const targetPlayer = isLocal ? localPlayer.value : remotePlayer.value;

        // Check for existing stackable item
        const existingSlotIndex = targetPlayer.items.findIndex(
            (i) => i !== null && i.id === item.id && i.quantity < 30
        );

        if (existingSlotIndex !== -1) {
            // Stack item
            const existingItem = targetPlayer.items[existingSlotIndex]!;
            existingItem.quantity++;
            // Trigger reactivity if needed (Vue refs usually handle deep mutation but replacing object is safer if issues arise)
            // targetPlayer.items[existingSlotIndex] = { ...existingItem }; 
        } else {
            // Find first empty slot
            const emptySlotIndex = targetPlayer.items.findIndex((i) => i === null);
            if (emptySlotIndex !== -1) {
                // Add new item
                targetPlayer.items[emptySlotIndex] = { ...item, quantity: 1 };
            }
        }
    };

    const removeItemFromSlot = (index: number, isLocal: boolean = true) => {
        if (isLocal) {
            localPlayer.value.items[index] = null;
        } else {
            remotePlayer.value.items[index] = null;
        }
    }

    const calculateTradeValue = (items: (TradeItem | null)[]) => {
        return items.reduce((total, item) => {
            if (item) {
                return total + (item.value * item.quantity);
            }
            return total;
        }, 0);
    };

    const localTradeValue = computed(() => calculateTradeValue(localPlayer.value.items));
    const remoteTradeValue = computed(() => calculateTradeValue(remotePlayer.value.items));
    const tradeDifference = computed(() => localTradeValue.value - remoteTradeValue.value);

    return {
        status,
        timer,
        localPlayer,
        remotePlayer,
        inventory,
        localTradeValue,
        remoteTradeValue,
        tradeDifference,
        toggleReady,
        cancelTrade,
        addItemToSlot,
        addItemToTrade,
        removeItemFromSlot
    };
});
