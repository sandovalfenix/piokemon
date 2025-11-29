import type { AudioPort } from '@/composables/useAudio'
import { Howl } from 'howler'

/**
 * Sound library type for managing multiple Howl instances
 */
type SoundLibrary = Record<string, Howl>

/**
 * Create Howler.js-based audio adapter
 * Implements AudioPort interface with lazy loading
 *
 * @param soundPaths Map of sound IDs to file paths
 * @returns AudioPort implementation using Howler.js
 */
export function createHowlerAudio(soundPaths: Record<string, string> = {}): AudioPort {
  const sounds: SoundLibrary = {}
  let currentVolume = 1.0

  /**
   * Get or create a Howl instance for the given sound ID
   */
  const getSound = (soundId: string): Howl | null => {
    // If sound already loaded, return it
    if (sounds[soundId]) {
      return sounds[soundId]
    }

    // Try to load from provided paths
    const path = soundPaths[soundId]
    if (!path) {
      console.warn(`[HowlerAudio] Sound "${soundId}" not found in soundPaths`)
      return null
    }

    // Create new Howl instance
    sounds[soundId] = new Howl({
      src: [path],
      volume: currentVolume,
    })

    return sounds[soundId]
  }

  return {
    play(soundId: string) {
      const sound = getSound(soundId)
      if (sound) {
        sound.play()
      }
    },

    stop() {
      // Stop all currently playing sounds
      Object.values(sounds).forEach(sound => {
        sound.stop()
      })
    },

    setVolume(v: number) {
      currentVolume = Math.max(0, Math.min(1, v))
      // Update volume for all loaded sounds
      Object.values(sounds).forEach(sound => {
        sound.volume(currentVolume)
      })
    },

    async preload(soundIds: string[]) {
      // Preload all requested sounds
      const loadPromises = soundIds.map(soundId => {
        return new Promise<void>((resolve) => {
          const sound = getSound(soundId)
          if (!sound) {
            resolve() // Skip if sound not found
            return
          }

          if (sound.state() === 'loaded') {
            resolve()
            return
          }

          sound.once('load', () => resolve())
          sound.once('loaderror', () => {
            console.warn(`[HowlerAudio] Failed to load sound: ${soundId}`)
            resolve() // Resolve anyway to not block other sounds
          })

          // Force load if not already loading
          sound.load()
        })
      })

      await Promise.all(loadPromises)
    },
  }
}

/**
 * Default sound paths for battle module
 * These can be overridden when creating the audio port
 */
export const DEFAULT_BATTLE_SOUNDS = {
  hit: '/sounds/hit.mp3',
  miss: '/sounds/miss.mp3',
  superEffective: '/sounds/super-effective.mp3',
  notVeryEffective: '/sounds/not-very-effective.mp3',
  victory: '/sounds/victory.mp3',
  defeat: '/sounds/defeat.mp3',
}
