/**
 * Sprite Loader Composable
 * Feature: 004-modern-battle-ui
 *
 * Load Pokemon sprites from PokemonShowdown with fallback mechanism
 */

import { ref, watch, unref, type Ref } from 'vue'
import type { SpriteLoaderReturn, SpriteFallbackTier } from '@/types/pokemonshowdown-sprite'
import { ANIMATION_TIMINGS } from '@/constants/animationTimings'
import { getPokemonBackSpriteUrl, getPokemonFrontSpriteUrl, getPokemonStaticSpriteUrl } from '@/utils/pokemonSpriteMap'

/**
 * Options for the sprite loader
 */
export interface SpriteLoaderOptions {
  pokemonName: string | Ref<string>
  view: 'front' | 'back'
  timeout?: number
}

/**
 * Test if an image URL loads successfully within timeout
 */
async function testImageLoad(url: string, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    const timer = setTimeout(() => {
      img.src = '' // Cancel loading
      resolve(false)
    }, timeoutMs)

    img.onload = () => {
      clearTimeout(timer)
      resolve(true)
    }

    img.onerror = () => {
      clearTimeout(timer)
      resolve(false)
    }

    img.src = url
  })
}

/**
 * Load Pokemon sprite with automatic fallback handling
 * Uses PokemonShowdown sprites exclusively
 *
 * Fallback hierarchy:
 * 1. Animated GIF from PokemonShowdown (ani-back/ or ani/)
 * 2. Static PNG from PokemonShowdown (dex/)
 * 3. Placeholder image
 *
 * @param options - Sprite loader configuration
 * @returns Reactive sprite state
 *
 * @example
 * ```typescript
 * const { spriteUrl, isLoading, error, tier } = useSpriteLoader({
 *   pokemonName: 'Charizard',
 *   view: 'back',
 *   timeout: 3000
 * })
 * ```
 */
export function useSpriteLoader(options: SpriteLoaderOptions): SpriteLoaderReturn {
  const spriteUrl = ref<string>('')
  const isLoading = ref<boolean>(true)
  const error = ref<Error | null>(null)
  const tier = ref<SpriteFallbackTier>('animated')

  // Token to track the latest request and ignore stale ones
  let currentRequestToken = 0

  const timeout = options.timeout ?? ANIMATION_TIMINGS.SPRITE_LOAD_TIMEOUT_MS

  async function loadSprite() {
    const token = ++currentRequestToken

    isLoading.value = true
    error.value = null
    tier.value = 'animated'

    try {
      // Get the current Pokemon name (works with both ref and string)
      const pokemonName = unref(options.pokemonName)

      // Skip loading for placeholder names to avoid unnecessary 404s
      if (pokemonName === 'Selecciona tu equipo' || pokemonName.includes('placeholder')) {
        if (token === currentRequestToken) {
          spriteUrl.value = '/sprites/placeholder-pokemon.png'
          tier.value = 'placeholder'
          isLoading.value = false
        }
        return
      }

      // Tier 1: Try animated GIF from PokemonShowdown
      const animatedUrl = options.view === 'back'
        ? getPokemonBackSpriteUrl(pokemonName)
        : getPokemonFrontSpriteUrl(pokemonName)

      const animatedLoaded = await testImageLoad(animatedUrl, timeout)

      if (token !== currentRequestToken) return

      if (animatedLoaded) {
        spriteUrl.value = animatedUrl
        tier.value = 'animated'
        isLoading.value = false
        return
      }

      // Tier 2: Try static PNG from PokemonShowdown (dex/)
      const staticUrl = getPokemonStaticSpriteUrl(pokemonName)
      const staticLoaded = await testImageLoad(staticUrl, timeout)

      if (token !== currentRequestToken) return

      if (staticLoaded) {
        spriteUrl.value = staticUrl
        tier.value = 'static'
        isLoading.value = false
        return
      }

      // Tier 3: Fallback to placeholder
      spriteUrl.value = '/sprites/placeholder-pokemon.png'
      tier.value = 'placeholder'
      error.value = new Error(`Failed to load sprite for ${pokemonName}`)
      isLoading.value = false
    } catch (err) {
      if (token !== currentRequestToken) return

      error.value = err instanceof Error ? err : new Error('Unknown sprite loading error')
      spriteUrl.value = '/sprites/placeholder-pokemon.png'
      tier.value = 'placeholder'
      isLoading.value = false
    }
  }

  // Reload when Pokemon name changes
  watch(
    () => unref(options.pokemonName),
    () => {
      loadSprite()
    },
    { immediate: true }
  )

  const retry = async () => {
    await loadSprite()
  }

  return {
    spriteUrl,
    isLoading,
    error,
    tier,
    retry,
  }
}
