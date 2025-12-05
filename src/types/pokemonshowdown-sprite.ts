/**
 * PokemonShowdown Sprite API Contract
 * Feature: 004-modern-battle-ui
 *
 * Type definitions for interacting with PokemonShowdown sprite endpoints
 */

/**
 * Sprite view orientation
 */
export type SpriteView = 'front' | 'back'

/**
 * Sprite type (animated GIF or static PNG)
 */
export type SpriteType = 'animated' | 'static'

/**
 * Fallback tier used for sprite resolution
 */
export type SpriteFallbackTier = 'animated' | 'static' | 'legacy' | 'placeholder'

/**
 * PokemonShowdown sprite URL configuration
 */
export interface PokemonShowdownSpriteConfig {
  /** Base URL for all sprites */
  readonly BASE_URL: 'https://play.pokemonshowdown.com/sprites'
  /** Path for animated front sprites */
  readonly ANIMATED_FRONT_PATH: 'ani'
  /** Path for animated back sprites */
  readonly ANIMATED_BACK_PATH: 'ani-back'
  /** Path for static dex sprites */
  readonly STATIC_PATH: 'dex'
  /** File extension for animated sprites */
  readonly ANIMATED_EXTENSION: 'gif'
  /** File extension for static sprites */
  readonly STATIC_EXTENSION: 'png'
  /** Fallback placeholder URL */
  readonly PLACEHOLDER_URL: '/sprites/placeholder-pokemon.png'
}

/**
 * Result of sprite URL construction
 */
export interface SpriteUrlResult {
  /** Full sprite URL */
  url: string
  /** Normalized Pokemon name used in URL */
  normalizedName: string
}

/**
 * Sprite loader options
 */
export interface SpriteLoaderOptions {
  /** Pokemon name (will be normalized for URL) - can be string or computed ref */
  pokemonName: string | import('vue').ComputedRef<string>
  /** Sprite orientation */
  view: SpriteView
  /** Timeout in milliseconds (default: 3000) */
  timeout?: number
}

/**
 * Sprite loader reactive state
 */
export interface SpriteLoaderState {
  /** Resolved sprite URL */
  spriteUrl: string
  /** Loading in progress */
  isLoading: boolean
  /** Error if all fallbacks failed */
  error: Error | null
  /** Which fallback tier succeeded */
  tier: SpriteFallbackTier
}

/**
 * Sprite loader return type (Vue composable)
 */
export interface SpriteLoaderReturn {
  /** Resolved sprite URL (reactive) */
  spriteUrl: import('vue').Ref<string>
  /** Loading state (reactive) */
  isLoading: import('vue').Ref<boolean>
  /** Error state (reactive) */
  error: import('vue').Ref<Error | null>
  /** Fallback tier used (reactive) */
  tier: import('vue').Ref<SpriteFallbackTier>
  /** Retry loading function */
  retry: () => Promise<void>
}

/**
 * Pokemon name normalization rules
 */
export interface NameNormalizationRules {
  /** Convert to lowercase */
  lowercase: true
  /** Replace spaces with hyphens */
  spacesToHyphens: true
  /** Remove apostrophes */
  removeApostrophes: true
  /** Remove colons */
  removeColons: true
  /** Handle gender symbols: ♀ → -f, ♂ → -m */
  genderSuffixes: true
  /** Collapse multiple hyphens */
  collapseHyphens: true
  /** Trim leading/trailing hyphens */
  trimHyphens: true
}

/**
 * Example normalized names for common edge cases
 */
export const NORMALIZATION_EXAMPLES = {
  'Pikachu': 'pikachu',
  'Mr. Mime': 'mr-mime',
  "Farfetch'd": 'farfetchd',
  'Type: Null': 'typenull',
  'Nidoran♀': 'nidoran-f',
  'Nidoran♂': 'nidoran-m',
  'Tapu Koko': 'tapu-koko',
  'Ho-Oh': 'ho-oh',
  'Porygon-Z': 'porygon-z',
} as const

/**
 * Sprite load test result
 */
export interface SpriteLoadTestResult {
  /** Whether sprite loaded successfully */
  success: boolean
  /** Load time in milliseconds */
  loadTimeMs: number
  /** Error if load failed */
  error?: Error
}

/**
 * Build sprite URL from Pokemon name
 *
 * @param pokemonName - Pokemon name to normalize
 * @param view - front or back orientation
 * @param type - animated GIF or static PNG
 * @returns Sprite URL result with normalized name
 *
 * @example
 * ```typescript
 * buildSpriteUrl('Charizard', 'back', 'animated')
 * // => { url: 'https://play.pokemonshowdown.com/sprites/ani-back/charizard.gif', normalizedName: 'charizard' }
 *
 * buildSpriteUrl('Mr. Mime', 'front', 'static')
 * // => { url: 'https://play.pokemonshowdown.com/sprites/dex/mr-mime.png', normalizedName: 'mr-mime' }
 * ```
 */
export type BuildSpriteUrlFn = (
  pokemonName: string,
  view: SpriteView,
  type: SpriteType
) => SpriteUrlResult

/**
 * Normalize Pokemon name for URL usage
 *
 * @param name - Original Pokemon name
 * @returns Normalized name (lowercase, hyphens, no special chars)
 *
 * @throws {TypeError} If name is empty or not a string
 *
 * @example
 * ```typescript
 * normalizePokemonName('Pikachu') // => 'pikachu'
 * normalizePokemonName("Farfetch'd") // => 'farfetchd'
 * normalizePokemonName('Mr. Mime') // => 'mr-mime'
 * normalizePokemonName('Type: Null') // => 'typenull'
 * ```
 */
export type NormalizePokemonNameFn = (name: string) => string

/**
 * Test if image URL loads successfully within timeout
 *
 * @param url - Image URL to test
 * @param timeoutMs - Max time to wait (default: 3000)
 * @returns Promise resolving to test result
 *
 * @example
 * ```typescript
 * const result = await testImageLoad('https://example.com/sprite.gif', 3000)
 * if (result.success) {
 *   console.log(`Loaded in ${result.loadTimeMs}ms`)
 * } else {
 *   console.error('Failed to load:', result.error)
 * }
 * ```
 */
export type TestImageLoadFn = (url: string, timeoutMs?: number) => Promise<SpriteLoadTestResult>
