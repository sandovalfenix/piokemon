/**
 * Battle UI State Contract
 * Feature: 004-modern-battle-ui
 *
 * Type definitions for battle UI state management (animations, views, effects)
 */

/**
 * Battle view modes for control panel
 */
export type BattleViewMode =
  | 'main'                  // Main action buttons (Fight, Bag, Pokemon, Run)
  | 'fight'                 // Move selector
  | 'bag'                   // Item bag
  | 'pokemon'               // Team switching
  | 'trainer-waiting'       // NPC selecting Pokemon
  | 'player-team-switch'    // Forced switch after player faint
  | 'enemy-team-switch'     // Enemy trainer switching

/**
 * Pokemon target identifier
 */
export type PokemonTarget = 'player' | 'enemy'

/**
 * Attack animation phase
 */
export type AttackPhase = 'idle' | 'charging' | 'impact' | 'returning'

/**
 * Attack animation state
 */
export interface AttackAnimationState {
  /** Animation currently active (disables attack buttons) */
  isActive: boolean
  /** Target Pokemon being attacked */
  target: PokemonTarget
  /** Current animation phase */
  phase: AttackPhase
  /** Animation start timestamp (Unix ms) */
  startTime: number
  /** Move type for colored effects (e.g., 'fire', 'water') */
  moveType: string
}

/**
 * Damage effect state
 */
export interface DamageEffectState {
  /** Effect currently active */
  active: boolean
  /** Target Pokemon receiving damage */
  target: PokemonTarget
  /** Optional: damage amount for scaling effect intensity */
  damageAmount?: number
}

/**
 * Animation timing constants (milliseconds)
 */
export interface AnimationTimings {
  /** Attack charge forward duration */
  readonly ATTACK_CHARGE_MS: 300
  /** Attack impact hold duration */
  readonly ATTACK_HOLD_MS: 100
  /** Attack return to origin duration */
  readonly ATTACK_RETURN_MS: 200
  /** Total attack sequence duration */
  readonly ATTACK_TOTAL_MS: 600
  /** Damage effect duration */
  readonly DAMAGE_EFFECT_MS: 300
  /** HP bar width transition duration */
  readonly HP_BAR_TRANSITION_MS: 500
  /** Panel fade in/out duration */
  readonly VIEW_TRANSITION_MS: 200
  /** Sprite loading timeout */
  readonly SPRITE_LOAD_TIMEOUT_MS: 3000
  /** Attack animation easing function */
  readonly EASING_ATTACK: 'cubic-bezier(0.4, 0, 0.2, 1)'
  /** HP bar animation easing function */
  readonly EASING_HP_BAR: 'cubic-bezier(0.4, 0, 0.2, 1)'
}

/**
 * Battle UI state (complete state for BattleScreen component)
 */
export interface BattleUIState {
  /** Current control panel view */
  currentView: BattleViewMode
  /** Attack animation state */
  attackAnimation: AttackAnimationState
  /** Damage effect state */
  damageEffect: DamageEffectState
  /** Player sprite loading state */
  playerSpriteLoading: boolean
  /** Enemy sprite loading state */
  enemySpriteLoading: boolean
}

/**
 * View transition event payload
 */
export interface ViewTransitionEvent {
  /** Previous view mode */
  from: BattleViewMode
  /** New view mode */
  to: BattleViewMode
  /** Transition timestamp */
  timestamp: number
}

/**
 * Attack animation event payload
 */
export interface AttackAnimationEvent {
  /** Animation phase entered */
  phase: AttackPhase
  /** Target Pokemon */
  target: PokemonTarget
  /** Move type */
  moveType: string
  /** Event timestamp */
  timestamp: number
}

/**
 * Damage effect event payload
 */
export interface DamageEffectEvent {
  /** Target Pokemon */
  target: PokemonTarget
  /** Damage amount */
  amount: number
  /** Event timestamp */
  timestamp: number
}

/**
 * CSS class bindings for animations
 */
export interface AnimationClassBindings {
  /** Base sprite class */
  'pokemon-sprite': true
  /** Player or enemy orientation */
  'player-sprite'?: boolean
  'enemy-sprite'?: boolean
  /** Damage effect active */
  'damage-hit'?: boolean
  /** Attack animation active */
  'attack-animation'?: boolean
  /** Attack type-specific class (e.g., 'attack-fire') */
  [key: `attack-${string}`]: boolean | undefined
}

/**
 * Neumorphic button state classes
 */
export interface NeumorphicButtonClasses {
  /** Base neumorphic styling */
  base: string
  /** Hover state styling */
  hover: string
  /** Active/pressed state styling */
  active: string
  /** Disabled state styling */
  disabled: string
}

/**
 * Glassmorphic panel classes
 */
export interface GlassmorphicPanelClasses {
  /** Base glassmorphic styling */
  base: string
  /** Border styling */
  border: string
  /** Shadow styling */
  shadow: string
}

/**
 * Tailwind class configurations for design system
 */
export const NEUMORPHIC_CLASSES: NeumorphicButtonClasses = {
  base: 'bg-gray-100 shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.9)] rounded-xl transition-all duration-150',
  hover: 'hover:shadow-[2px_2px_4px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.9)] hover:translate-x-[1px] hover:translate-y-[1px]',
  active: 'active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)] active:translate-x-[2px] active:translate-y-[2px]',
  disabled: 'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
}

export const GLASSMORPHIC_CLASSES: GlassmorphicPanelClasses = {
  base: 'bg-white/20 backdrop-blur-lg rounded-2xl',
  border: 'border border-white/30',
  shadow: 'shadow-xl',
}

/**
 * HP bar color thresholds
 */
export interface HpColorThresholds {
  /** HP % for green color */
  high: 50
  /** HP % for yellow color */
  medium: 25
  /** HP % for red color (below medium) */
  low: 0
}

/**
 * HP bar colors
 */
export interface HpBarColors {
  /** High HP color (>50%) */
  high: '#10b981'  // green-500
  /** Medium HP color (25-50%) */
  medium: '#fbbf24'  // yellow-400
  /** Low HP color (<25%) */
  low: '#ef4444'  // red-500
}

/**
 * Get HP bar color based on percentage
 *
 * @param percent - HP percentage (0-100)
 * @returns Hex color code
 *
 * @example
 * ```typescript
 * getHpColor(75) // => '#10b981' (green)
 * getHpColor(40) // => '#fbbf24' (yellow)
 * getHpColor(15) // => '#ef4444' (red)
 * ```
 */
export type GetHpColorFn = (percent: number) => string

/**
 * Attack button disabled state check
 *
 * @param attackState - Current attack animation state
 * @param currentView - Current battle view mode
 * @returns True if attack buttons should be disabled
 *
 * @example
 * ```typescript
 * const disabled = isAttackDisabled(attackState, 'fight')
 * // => true if attackState.isActive === true or currentView !== 'fight'
 * ```
 */
export type IsAttackDisabledFn = (
  attackState: AttackAnimationState,
  currentView: BattleViewMode
) => boolean

/**
 * Validate attack state transition
 *
 * @param currentPhase - Current attack phase
 * @param nextPhase - Proposed next phase
 * @returns True if transition is valid
 *
 * @example
 * ```typescript
 * validatePhaseTransition('idle', 'charging') // => true
 * validatePhaseTransition('charging', 'impact') // => true
 * validatePhaseTransition('impact', 'idle') // => false (must go through 'returning')
 * ```
 */
export type ValidatePhaseTransitionFn = (
  currentPhase: AttackPhase,
  nextPhase: AttackPhase
) => boolean

/**
 * Valid attack phase transitions
 */
export const VALID_PHASE_TRANSITIONS: Record<AttackPhase, AttackPhase[]> = {
  idle: ['charging'],
  charging: ['impact'],
  impact: ['returning'],
  returning: ['idle'],
}

/**
 * Initial attack animation state
 */
export const INITIAL_ATTACK_STATE: AttackAnimationState = {
  isActive: false,
  target: 'player',
  phase: 'idle',
  startTime: 0,
  moveType: 'normal',
}

/**
 * Initial damage effect state
 */
export const INITIAL_DAMAGE_STATE: DamageEffectState = {
  active: false,
  target: 'player',
  damageAmount: undefined,
}

/**
 * Initial battle UI state
 */
export const INITIAL_BATTLE_UI_STATE: BattleUIState = {
  currentView: 'main',
  attackAnimation: INITIAL_ATTACK_STATE,
  damageEffect: INITIAL_DAMAGE_STATE,
  playerSpriteLoading: false,
  enemySpriteLoading: false,
}
