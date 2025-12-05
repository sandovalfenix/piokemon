export interface Rng {
  next(): number // 0..1
}

export function createSeededRng(seed?: number | string): Rng {
  let s = 0
  if (typeof seed === 'number') s = seed
  else if (typeof seed === 'string') {
    for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0
  } else {
    s = Date.now() >>> 0
  }
  // simple LCG for determinism in tests (not crypto)
  let state = (s ^ 0xdeadbeef) >>> 0
  return {
    next() {
      state = (1664525 * state + 1013904223) >>> 0
      return (state >>> 8) / 0x01000000
    },
  }
}
