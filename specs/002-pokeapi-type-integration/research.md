# Research: PokeAPI Type Chart Integration

**Feature**: 002-pokeapi-type-integration  
**Phase**: 0 (Outline & Research)  
**Date**: November 29, 2025

## Research Questions

### Q1: What is the exact structure of PokeAPI type endpoint response?

**Investigation Method**: Direct API call analysis

**Findings**:
- **Endpoint**: `GET https://pokeapi.co/api/v2/type/{id or name}`
- **Example**: Fire type response structure:
  ```json
  {
    "id": 10,
    "name": "fire",
    "damage_relations": {
      "double_damage_to": [
        { "name": "bug", "url": "..." },
        { "name": "steel", "url": "..." },
        { "name": "grass", "url": "..." },
        { "name": "ice", "url": "..." }
      ],
      "half_damage_to": [
        { "name": "rock", "url": "..." },
        { "name": "fire", "url": "..." },
        { "name": "water", "url": "..." },
        { "name": "dragon", "url": "..." }
      ],
      "no_damage_to": []
    }
  }
  ```

**Decision**: Use type names (e.g., "fire") instead of IDs for API calls - more readable and matches our TYPE_CHART format.

---

### Q2: What is the optimal cache strategy for type chart data?

**Investigation Method**: Browser storage research + performance analysis

**Findings**:
- **localStorage limits**: 5-10MB depending on browser (sufficient for ~10KB type chart)
- **Cache key versioning**: Use `pokemon-type-chart-v1` to support future schema migrations
- **Expiration policy**: 7 days (604800000ms) balances freshness vs API load
- **Fallback hierarchy**:
  1. In-memory cache (Pinia store state)
  2. localStorage (persistent across sessions)
  3. Fresh API fetch
  4. Hardcoded TYPE_CHART (ultimate fallback)

**Decision**: Implement 3-tier caching with automatic fallback. Cache metadata includes `fetchedAt`, `expiresAt`, and `source` for debugging.

**Alternatives Considered**:
- IndexedDB: Rejected (overkill for 10KB data, adds complexity)
- SessionStorage: Rejected (doesn't persist across sessions)
- No expiration: Rejected (stale data risk if PokeAPI updates)

---

### Q3: How should we handle partial API failures (e.g., 15/18 types load)?

**Investigation Method**: Failure scenario analysis

**Findings**:
- **Promise.allSettled()** allows batch fetching with partial success
- If <18 types load successfully:
  - Option A: Use hardcoded fallback entirely (consistency)
  - Option B: Merge partial API data with fallback for missing types (complexity)
  - Option C: Retry failed types individually (delay)

**Decision**: Option A - If any type fails, use complete hardcoded fallback. Ensures consistency and simplicity.

**Rationale**: Type effectiveness calculations depend on complete chart. Mixing API and fallback data could cause subtle bugs if data formats differ slightly.

---

### Q4: What HTTP client should we use for API requests?

**Investigation Method**: Bundle size and feature comparison

| Library | Size (gzipped) | Features | Verdict |
|---------|----------------|----------|---------|
| Native Fetch | 0KB (built-in) | Timeout via AbortController, Promise-based | ✅ **Selected** |
| axios | 14KB | Interceptors, automatic JSON parsing | ❌ Overkill |
| ky | 8KB | Retry, timeout, hooks | ❌ Not needed |

**Decision**: Use native Fetch API with AbortController for timeout handling.

**Implementation**:
```typescript
const controller = new AbortController()
const timeoutId = setTimeout(() => controller.abort(), 5000)

try {
  const response = await fetch(url, { signal: controller.signal })
  clearTimeout(timeoutId)
  return await response.json()
} catch (error) {
  if (error.name === 'AbortError') {
    // Handle timeout
  }
}
```

---

### Q5: How to validate API response integrity?

**Investigation Method**: Schema validation libraries comparison

**Findings**:
- **Zod** (5KB gzipped): Full-featured schema validation
- **Runtime type guards**: Manual validation, zero bundle cost
- **JSON Schema**: Requires additional library

**Decision**: Manual runtime type guards with TypeScript type predicates.

**Rationale**: Simple validation needs don't justify 5KB library. Custom type guard:
```typescript
function isValidPokeAPIResponse(data: unknown): data is PokeAPITypeResponse {
  return typeof data === 'object' && data !== null &&
         'name' in data && typeof data.name === 'string' &&
         'damage_relations' in data && /* ... */
}
```

---

## Best Practices Research

### PokeAPI Rate Limiting

**Official Docs**: "We do ask that you be nice to the API and don't hit us with more than 100 requests per second."

**Our Usage**: 18 requests on first load, then cached for 7 days = negligible load.

**Safeguard**: Implement exponential backoff for 429 responses (though unlikely with our usage):
```typescript
async function fetchWithRetry(url: string, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    const response = await fetch(url)
    if (response.status !== 429) return response
    await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
  }
  throw new Error('Max retries exceeded')
}
```

---

### localStorage Best Practices

**Quota Detection**:
```typescript
function saveToCache(data: TypeChartCache): boolean {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
    return true
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded, clearing old caches')
      // Clear other caches if needed
    }
    return false
  }
}
```

**Data Integrity**: Always validate JSON.parse() result before use.

---

## Technology Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| HTTP Client | Native Fetch API | Zero bundle cost, sufficient features |
| Cache Storage | localStorage | Persistent, simple, adequate size |
| Validation | Manual type guards | Lightweight, sufficient for simple schema |
| Batch Strategy | Promise.allSettled() | Partial success handling |
| Fallback Strategy | All-or-nothing | Ensures data consistency |
| Expiration | 7 days | Balances freshness vs API load |

---

## Open Questions

None - all research questions resolved.

---

## Next Steps

1. ✅ Research complete - proceed to Phase 1 (Design & Contracts)
2. Create `data-model.md` with TypeScript interfaces
3. Generate `contracts/pokeapi-type-response.ts`
4. Write `quickstart.md` usage guide
5. Update agent context after Phase 1 completion
