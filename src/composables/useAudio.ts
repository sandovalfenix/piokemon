import { ref } from 'vue'

export interface AudioPort {
  play(name: string): void
  stop(): void
  setVolume(v: number): void
  preload(sounds: string[]): Promise<void>
}

/**
 * Composable for audio playback management
 * Wraps an AudioPort implementation (e.g., HowlerAudio)
 *
 * @param port AudioPort implementation (defaults to noop implementation)
 * @returns Object with audio control functions and state
 */
export function useAudio(port?: AudioPort) {
  const volume = ref(1.0)
  const isMuted = ref(false)

  // Use provided port or create a noop implementation
  const audioPort = port ?? createNoopAudioPort()

  const play = (soundId: string) => {
    if (!isMuted.value) {
      audioPort.play(soundId)
    }
  }

  const stop = () => {
    audioPort.stop()
  }

  const setVolume = (v: number) => {
    volume.value = Math.max(0, Math.min(1, v))
    audioPort.setVolume(volume.value)
  }

  const toggleMute = () => {
    isMuted.value = !isMuted.value
    audioPort.setVolume(isMuted.value ? 0 : volume.value)
  }

  const preload = async (sounds: string[]) => {
    await audioPort.preload(sounds)
  }

  return {
    play,
    stop,
    setVolume,
    toggleMute,
    preload,
    volume,
    isMuted,
  }
}

/**
 * Create a no-op audio port for testing or when audio is disabled
 */
function createNoopAudioPort(): AudioPort {
  return {
    play: () => {},
    stop: () => {},
    setVolume: () => {},
    preload: async () => {},
  }
}
