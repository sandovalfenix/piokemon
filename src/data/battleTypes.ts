// src/data/battleTypes.ts

export enum BattleType {
  WILD = 'wild',
  TRAINER = 'trainer',
  GYM_LEADER = 'gym_leader',
}

export interface BattleConfig {
  type: BattleType
  canFlee: boolean
  canSwitch: boolean
  earnsExp: boolean
  displayName: string
}

export const battleConfigs: Record<BattleType, BattleConfig> = {
  [BattleType.WILD]: {
    type: BattleType.WILD,
    canFlee: true,
    canSwitch: true,
    earnsExp: true,
    displayName: 'Batalla Salvaje'
  },
  [BattleType.TRAINER]: {
    type: BattleType.TRAINER,
    canFlee: false,
    canSwitch: true,
    earnsExp: true,
    displayName: 'Batalla de Entrenador'
  },
  [BattleType.GYM_LEADER]: {
    type: BattleType.GYM_LEADER,
    canFlee: false,
    canSwitch: true,
    earnsExp: true,
    displayName: 'Batalla de Gimnasio'
  },
}
