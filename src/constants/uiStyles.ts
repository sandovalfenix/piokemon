/**
 * UI Style Constants
 * Feature: 004-modern-battle-ui
 *
 * Tailwind utility class configurations for neumorphic and glassmorphic design patterns
 */

import type { NeumorphicButtonClasses, GlassmorphicPanelClasses } from '@/types/battle-ui-state'

/**
 * Neumorphic button styling (soft embossed appearance)
 * Use for interactive buttons with depth effect
 */
export const NEUMORPHIC_CLASSES: NeumorphicButtonClasses = {
  base: 'bg-gray-100 shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.9)] rounded-xl transition-all duration-150',
  hover: 'hover:shadow-[2px_2px_4px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.9)] hover:translate-x-[1px] hover:translate-y-[1px]',
  active: 'active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)] active:translate-x-[2px] active:translate-y-[2px]',
  disabled: 'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
}

/**
 * Glassmorphic panel styling (frosted glass effect)
 * Use for overlay panels and status displays
 */
export const GLASSMORPHIC_CLASSES: GlassmorphicPanelClasses = {
  base: 'bg-white/20 backdrop-blur-lg rounded-2xl',
  border: 'border border-white/30',
  shadow: 'shadow-xl',
}

/**
 * Get complete neumorphic button classes as string
 */
export function getNeumorphicButtonClasses(): string {
  return `${NEUMORPHIC_CLASSES.base} ${NEUMORPHIC_CLASSES.hover} ${NEUMORPHIC_CLASSES.active} ${NEUMORPHIC_CLASSES.disabled}`
}

/**
 * Get complete glassmorphic panel classes as string
 */
export function getGlassmorphicPanelClasses(): string {
  return `${GLASSMORPHIC_CLASSES.base} ${GLASSMORPHIC_CLASSES.border} ${GLASSMORPHIC_CLASSES.shadow}`
}
