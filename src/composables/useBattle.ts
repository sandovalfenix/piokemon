// src/composables/useBattle.ts

import { ref, computed } from 'vue';
import { BattleType, battleConfigs, type BattleConfig } from '@/data/battleTypes';
import { gymLeaders, type GymLeader } from '@/data/gymLeaders';

export function useBattle() {
  const currentBattleType = ref<BattleType>(BattleType.WILD);
  const currentOpponent = ref<GymLeader | null>(null);

  // Obtiene la configuración actual de batalla
  const battleConfig = computed<BattleConfig>(() => {
    return battleConfigs[currentBattleType.value];
  });

  // Inicia una batalla contra líder de gimnasio
  const startGymBattle = (gymLeaderId: number) => {
    const leader = gymLeaders.find(l => l.id === gymLeaderId);
    if (!leader) {
      console.error('Líder de gimnasio no encontrado');
      return false;
    }

    currentBattleType.value = BattleType.GYM_LEADER;
    currentOpponent.value = leader;
    return true;
  };

  // Inicia batalla contra entrenador común
  const startTrainerBattle = () => {
    currentBattleType.value = BattleType.TRAINER;
    currentOpponent.value = null;
  };

  // Inicia batalla salvaje
  const startWildBattle = () => {
    currentBattleType.value = BattleType.WILD;
    currentOpponent.value = null;
  };

  // Verifica si puede huir
  const canFlee = computed(() => battleConfig.value.canFlee);

  // Verifica si puede cambiar Pokémon
  const canSwitch = computed(() => battleConfig.value.canSwitch);

  // Obtiene la música de batalla (removed - musicTrack not in BattleConfig)
  const battleMusic = computed(() => 'battle-theme');

  // Obtiene el fondo de batalla (removed - background not in BattleConfig)
  const battleBackground = computed(() => 'default-bg');

  return {
    currentBattleType,
    currentOpponent,
    battleConfig,
    startGymBattle,
    startTrainerBattle,
    startWildBattle,
    canFlee,
    canSwitch,
    battleMusic,
    battleBackground,
    gymLeaders
  };
}
