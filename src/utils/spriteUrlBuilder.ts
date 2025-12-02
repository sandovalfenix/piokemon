/**
 * Sprite URL Builder
 * Feature: 004-modern-battle-ui
 *
 * Construct PokemonShowdown sprite URLs with normalized names
 */

import type { BuildSpriteUrlFn, SpriteView, SpriteType, SpriteUrlResult } from '@/types/pokemonshowdown-sprite'
import { normalizePokemonName } from './spriteNormalizer'

const BASE_URL = 'https://play.pokemonshowdown.com/sprites'

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
export const buildSpriteUrl: BuildSpriteUrlFn = (
  pokemonName: string,
  view: SpriteView,
  type: SpriteType
): SpriteUrlResult => {
  const normalizedName = normalizePokemonName(pokemonName)

  let path: string
  let extension: string

  if (type === 'animated') {
    path = view === 'back' ? 'ani-back' : 'ani'
    extension = 'gif'
  } else {
    path = 'dex'
    extension = 'png'
  }

  const url = `${BASE_URL}/${path}/${normalizedName}.${extension}`

  return {
    url,
    normalizedName,
  }
}
