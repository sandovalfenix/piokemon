/**
 * Trainer Types
 * Feature: 006-battle-module-update
 *
 * Basic trainer interface used for battle UI
 */

import type { Pokemon } from '@/domain/battle/engine/entities'

export interface Trainer {
  id: string
  name: string
  title?: string
  team: Pokemon[]
  spriteUrl?: string
  quote?: string
}
