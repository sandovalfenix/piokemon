export interface StoragePort {
  get<T>(key: string, fallback: T): T
  set<T>(key: string, value: T): void
}

export function createLocalStorage(): StoragePort {
  return {
    get<T>(key: string, fallback: T): T {
      try {
        const v = localStorage.getItem(key)
        return v ? (JSON.parse(v) as T) : fallback
      } catch {
        return fallback
      }
    },
    set<T>(key: string, value: T) {
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch {
        // ignore
      }
    },
  }
}
