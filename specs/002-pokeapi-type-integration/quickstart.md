# Quickstart Guide: PokeAPI Type Chart Integration

**Feature**: 002-pokeapi-type-integration  
**Audience**: Developers working with Pokemon battle mechanics  
**Last Updated**: November 29, 2025

---

## Overview

The type chart system automatically fetches Pokemon type effectiveness data from PokeAPI on first battle access, caches it for 7 days, and falls back to hardcoded data if the API is unavailable. This guide shows how to use the system.

---

## For Most Developers: Just Use It

**The type chart loads automatically.** You don't need to do anything special.

### Using in Battle Logic

```typescript
import { computeTypeMultiplier } from '@/domain/battle/calc/typeChart'

// Calculate damage multiplier (works exactly as before)
const multiplier = computeTypeMultiplier('fire', 'grass')  // Returns 2 (super effective)
const multiplier2 = computeTypeMultiplier('fire', 'water') // Returns 0.5 (not very effective)
```

**No changes required to existing battle code** - the function signature remains identical.

---

## Advanced Usage: Accessing the Store

### Checking Load State

```typescript
import { useTypeChartStore } from '@/stores/typeChart'

const typeChartStore = useTypeChartStore()

// Check if data is loading
if (typeChartStore.isLoading) {
  console.log('Loading type chart from PokeAPI...')
}

// Check data source
console.log(`Type chart loaded from: ${typeChartStore.source}`)
// Outputs: "api" | "cache" | "fallback"

// Check last update time
console.log(`Last updated: ${typeChartStore.lastUpdated}`)
```

### Reactive Type Chart Access

```typescript
import { computed } from 'vue'
import { useTypeChartStore } from '@/stores/typeChart'

const typeChartStore = useTypeChartStore()

// Access the full type chart (reactive)
const typeChart = computed(() => typeChartStore.typeChart)

// Watch for changes
watch(() => typeChartStore.source, (newSource) => {
  console.log(`Type chart source changed to: ${newSource}`)
})
```

---

## Forcing a Refresh

If you need to fetch fresh data from PokeAPI (ignoring cache):

```typescript
import { useTypeChartStore } from '@/stores/typeChart'

const typeChartStore = useTypeChartStore()

// Force fresh API fetch
await typeChartStore.refreshTypeChart()

// This will:
// 1. Clear localStorage cache
// 2. Fetch all 18 types from PokeAPI
// 3. Cache the new data
// 4. Update the store
```

**Use Case**: Admin panel, testing, or manual data refresh feature.

---

## Testing & Development

### Mocking PokeAPI in Tests

```typescript
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

const server = setupServer(
  http.get('https://pokeapi.co/api/v2/type/:typeName', ({ params }) => {
    return HttpResponse.json({
      id: 1,
      name: params.typeName,
      damage_relations: {
        double_damage_to: [{ name: 'grass', url: '...' }],
        half_damage_to: [{ name: 'water', url: '...' }],
        no_damage_to: [],
      },
    })
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

### Simulating API Failure

```typescript
server.use(
  http.get('https://pokeapi.co/api/v2/type/:typeName', () => {
    return new HttpResponse(null, { status: 500 })
  })
)

// System will automatically fall back to hardcoded TYPE_CHART
const result = await typeChartStore.loadTypeChart()
expect(result.source).toBe('fallback')
```

---

## Debugging

### Viewing Cache in Browser

1. Open DevTools → Application → Local Storage
2. Find key: `pokemon-type-chart-v1`
3. View cached data structure:
   ```json
   {
     "version": "1.0.0",
     "typeChart": { "Fire": { "Grass": 2 } },
     "fetchedAt": "2025-11-29T12:00:00.000Z",
     "expiresAt": "2025-12-06T12:00:00.000Z",
     "source": "api"
   }
   ```

### Clearing Cache Manually

**Option 1: Via DevTools**
- Delete `pokemon-type-chart-v1` key in Local Storage

**Option 2: Via Code**
```typescript
localStorage.removeItem('pokemon-type-chart-v1')
location.reload()  // Reload to fetch fresh data
```

**Option 3: Via Store**
```typescript
await typeChartStore.refreshTypeChart()  // Clears and refetches
```

---

## Performance Notes

### First Load (Cold Cache)

- **Time**: ~2-3 seconds (18 API requests in parallel)
- **Network**: ~50KB total (uncompressed)
- **UX Impact**: Battle starts immediately with fallback, then updates to API data

### Subsequent Loads (Warm Cache)

- **Time**: <50ms (localStorage read)
- **Network**: 0 requests
- **UX Impact**: Instant, no delay

### After 7 Days (Cache Expired)

- **Behavior**: Treats as first load, fetches fresh data
- **Fallback**: Uses stale cache if API fails, logs warning

---

## Common Issues

### Issue: "Type chart not loading"

**Symptoms**: Battle always uses fallback data

**Diagnosis**:
```typescript
console.log(typeChartStore.error)  // Check for error message
console.log(typeChartStore.source) // Should be 'api' or 'cache', not 'fallback'
```

**Solutions**:
1. Check network tab for failed PokeAPI requests
2. Verify localStorage is enabled (not private/incognito mode)
3. Check console for CORS or timeout errors

---

### Issue: "localStorage quota exceeded"

**Symptoms**: `QuotaExceededError` in console

**Solution**:
```typescript
// System automatically handles this by:
// 1. Catching QuotaExceededError
// 2. Logging warning
// 3. Using fallback data
// 4. Not caching (API fetch every time)
```

**Manual Fix**: Clear other localStorage data to free space

---

### Issue: "Type effectiveness seems wrong"

**Diagnosis**:
```typescript
// Compare API data vs hardcoded fallback
console.log(typeChartStore.source)  // Check data source

// Inspect specific matchup
import { computeTypeMultiplier } from '@/domain/battle/calc/typeChart'
console.log(computeTypeMultiplier('fire', 'grass'))  // Should be 2
```

**Validation**:
- API data matches official Pokemon mechanics
- Fallback data matches existing game behavior
- If mismatch found, file a bug report with matchup details

---

## FAQ

### Q: Does this work offline?

**A:** Yes, after the first load:
1. First visit (online): Fetches from API, caches
2. Offline visits: Uses cached data
3. Cache expires offline: Uses hardcoded fallback

---

### Q: Can I customize the type chart?

**A:** Not directly, but you can:
1. Fork and modify hardcoded fallback in `src/data/typeChart.ts`
2. Or implement custom logic in `computeTypeMultiplier()` function

---

### Q: What happens if PokeAPI changes their API?

**A:** 
1. Runtime validation will catch invalid responses
2. System falls back to hardcoded data
3. Console warning logged for developers
4. Game continues working without interruption

---

### Q: How do I see which data source is active?

**A:** Check Vue DevTools:
1. Open Vue DevTools
2. Navigate to Pinia tab
3. Find `typeChart` store
4. Check `source` field: `'api'` | `'cache'` | `'fallback'`

---

## Migration Guide (For Existing Code)

### Before (Hardcoded)

```typescript
import { TYPE_CHART } from '@/data/typeChart'
const multiplier = TYPE_CHART['Fire']?.['Grass'] ?? 1
```

### After (Dynamic)

```typescript
import { computeTypeMultiplier } from '@/domain/battle/calc/typeChart'
const multiplier = computeTypeMultiplier('fire', 'grass')
```

**Breaking Changes**: None - existing `computeTypeMultiplier` usage works unchanged.

---

## Architecture Overview

```
Battle Component
    ↓ uses
computeTypeMultiplier()
    ↓ reads from
TypeChart Store (Pinia)
    ↓ loads data via
TypeChart Service
    ↓ tries in order
1. Memory Cache (instant)
2. localStorage Cache (fast)
3. PokeAPI Fetch (slow)
4. Hardcoded Fallback (instant)
```

---

## Next Steps

- **Explore**: Open DevTools and watch cache/API interactions
- **Test**: Try offline mode to see fallback in action
- **Integrate**: Type chart "just works" in battle calculations
- **Monitor**: Check Vue DevTools Pinia tab for store state

---

**Need Help?** Check the [full implementation plan](./plan.md) or [data model docs](./data-model.md).
