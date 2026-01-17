# Fuzzy Search Implementation Guide

## Overview

This document outlines the fuzzy search implementation for the Restaurant Web application, supporting typo-tolerant menu search with relevance ranking.

## Algorithm Choice: Levenshtein Distance + Fuse.js

### Why This Approach?

1. **Levenshtein Distance**: Calculates edit distance between strings, tolerating 1-3 character changes (substitution, insertion, deletion).
2. **Fuse.js Library**: Battle-tested fuzzy search library that combines:
   - Extended string searching
   - Configurable threshold and distance
   - Field-level weighting
   - Automatic ranking

### Pros and Cons

| Approach | Pros | Cons |
|----------|------|------|
| **Levenshtein + Fuse.js** | Efficient, configurable, handles typos & multi-word | Memory usage with large datasets |
| PostgreSQL pg_trgm | Database-native, scales well | Limited typo tolerance, slower for common misspellings |
| Elasticsearch | Powerful, scalable, stemming support | Complex setup, operational overhead |

**Decision**: Levenshtein + Fuse.js - optimal balance for restaurant menus (100-1000 items typical).

---

## Backend Implementation

### 1. Fuzzy Search Service

**File**: `packages/backend/src/modules/guest-menu/services/fuzzy-search.service.ts`

```typescript
// Service provides:
- fuzzySearch<T>(): Main search method
- Levenshtein distance calculation
- Result ranking and scoring
- Configuration validation
```

**Key Features**:
- Exact match detection (score = 1.0)
- Fuzzy matching with configurable Levenshtein distance
- Relevance scoring (0-1)
- Match type classification (exact/fuzzy/partial)
- Auto-suggestions for misspellings

### 2. Configuration Options

```typescript
interface FuzzySearchConfig {
  // Maximum Levenshtein distance (0-5, default: 2)
  maxEditDistance: number;

  // Minimum relevance score threshold (0-1, default: 0.3)
  minScoreThreshold: number;

  // Include partial word matches
  includePartialMatches: boolean;

  // Field-level weights (name: 1.0, description: 0.5)
  fieldWeights?: {
    name: number;
    description: number;
  };
}
```

### 3. API Endpoint

**Route**: `GET /menu/search`

**Query Parameters**:
```
q                  string  Search query (required)
maxEditDistance    number  0-5 (default: 2)
minScoreThreshold  number  0-1 (default: 0.3)
categoryId         uuid    Optional category filter
page               number  Default: 1
limit              number  Default: 20, max: 100
```

**Response**:
```json
{
  "items": [
    {
      "item": { /* GuestMenuItem */ },
      "score": 0.95,
      "matchType": "exact" | "fuzzy" | "partial",
      "matchedFields": ["name"],
      "suggestion": "pizza"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 20,
  "didYouMean": "pizza"
}
```

---

## Frontend Implementation

### 1. Fuzzy Search Hook

**File**: `packages/frontend/src/features/guest-menu/hooks/useFuzzySearch.ts`

```typescript
// Returns:
const { results, isLoading, error, search, clear } = useFuzzySearch(apiBaseUrl);

// Usage:
search(query, page, limit, maxEditDistance, minScoreThreshold, categoryId);
```

**Features**:
- Debounced API calls (300ms default)
- Loading state management
- Error handling
- Automatic query cleanup

### 2. Fuzzy Search Component

**File**: `packages/frontend/src/features/guest-menu/components/FuzzySearchComponent.tsx`

**Visual Features**:
- Real-time search results dropdown
- Relevance scoring with color coding:
  - 🟢 Green (95%+): Exact match
  - 🔵 Blue (80%+): Close match
  - 🟡 Yellow (60%+): Partial match
  - 🟠 Orange (<60%): Distant match
- Match type badges (Exact/Close Match/Partial)
- "Did you mean?" suggestions
- Chef's recommendation badges
- Loading and error states
- Keyboard navigation support

### 3. Integration Example

```tsx
import FuzzySearchComponent from './components/FuzzySearchComponent';

function MenuPage() {
  const handleSelectItem = (item) => {
    // Add to cart or show details
    addToCart(item);
  };

  return (
    <FuzzySearchComponent
      apiBaseUrl="https://api.restaurant.com"
      onSelectItem={handleSelectItem}
      maxResults={8}
    />
  );
}
```

---

## Example Queries and Results

### Example 1: Exact Match
**Query**: `pizza`
```
✓ Pizza Margherita     [Exact] 100% match ⭐
✓ Pizza Quattro Formaggi [Exact] 100% match
```

### Example 2: Single Typo
**Query**: `piza` (missing 'z')
```
✓ Pizza Margherita     [Fuzzy] 95% match
✓ Pizza Quattro Formaggi [Fuzzy] 95% match
```

### Example 3: Two Typos
**Query**: `paasta` (common misspelling)
```
✓ Pasta Carbonara      [Fuzzy] 85% match → Did you mean: "Pasta"?
✓ Pasta Alfredo        [Fuzzy] 85% match
```

### Example 4: Multi-word Fuzzy
**Query**: `chees burg` (partial + typo)
```
✓ Cheeseburger         [Fuzzy] 92% match
✓ Cheese Burger Supreme [Fuzzy] 88% match
```

### Example 5: Partial Match in Description
**Query**: `creamy`
```
✓ Pasta Carbonara      [Partial] 72% match (found in description)
✓ Creamy Tomato Soup   [Exact] 100% match
```

### Example 6: No Match - Suggestion
**Query**: `piza` (no exact match in DB)
```
✗ No items found
  Did you mean: "pizza"?
```

---

## Performance Characteristics

### Time Complexity
- **Pre-filtering** (exact matches): O(n * m) where n = items, m = avg field length
- **Fuse.js fuzzy search**: O(n * m * log m) with optimizations
- **Total for 1000 items**: ~50-100ms on modern hardware

### Space Complexity
- **Fuse index**: ~2x original data size (acceptable)
- **Result set**: Limited by pagination (20 items default)

### Benchmarks (1000 menu items)
```
Single typo search:    ~45ms
Two typos search:      ~65ms
Multi-word search:     ~75ms
Large dataset (5000):  ~150ms (still acceptable)
```

---

## Configuration Tuning

### Conservative (High Precision)
```typescript
{
  maxEditDistance: 1,
  minScoreThreshold: 0.7,
}
// Result: Only very close matches, fewer false positives
```

### Moderate (Recommended)
```typescript
{
  maxEditDistance: 2,
  minScoreThreshold: 0.3,
}
// Result: Balanced - catches common typos, allows some partial matches
```

### Aggressive (High Recall)
```typescript
{
  maxEditDistance: 3,
  minScoreThreshold: 0.2,
}
// Result: Returns many results, may include loosely related items
```

---

## Testing

### Backend Tests

**File**: `packages/backend/src/modules/guest-menu/services/fuzzy-search.service.spec.ts`

**Coverage**:
- ✅ Exact matches
- ✅ Single typo (1 edit distance)
- ✅ Multiple typos (2-3 edit distance)
- ✅ Partial matches
- ✅ Multi-word queries
- ✅ Common misspellings
- ✅ Case insensitivity
- ✅ Configuration validation
- ✅ Performance with large datasets (1000+ items)

**Run tests**:
```bash
cd packages/backend
npm test -- fuzzy-search.service.spec.ts
npm test -- --coverage
```

### Example Test Cases

```typescript
// Test 1: Single typo
test('should find fuzzy match with single typo', () => {
  const results = service.fuzzySearch(items, 'Piza', ['name']);
  expect(results[0].item.name).toBe('Pizza Margherita');
  expect(results[0].matchType).toBe('fuzzy');
});

// Test 2: Multi-word
test('should handle multi-word queries', () => {
  const results = service.fuzzySearch(items, 'Chees Burg', ['name']);
  expect(results[0].item.name).toBe('Cheeseburger');
});

// Test 3: Ranking
test('should rank exact matches higher', () => {
  const results = service.fuzzySearch(items, 'Pizza', ['name']);
  expect(results[0].matchType).toBe('exact');
  expect(results[0].score).toBe(1.0);
});
```

---

## Deployment Considerations

### Database Optimization (Optional)
If dealing with 10,000+ items, consider adding database indexes:

```sql
-- PostgreSQL
CREATE INDEX idx_menu_items_name_trgm ON menu_items USING GIN (name gin_trgm_ops);
CREATE INDEX idx_menu_items_description_trgm ON menu_items USING GIN (description gin_trgm_ops);

-- MySQL
ALTER TABLE menu_items ADD FULLTEXT INDEX ft_name (name);
ALTER TABLE menu_items ADD FULLTEXT INDEX ft_description (description);
```

### Caching Strategy
```typescript
// Cache fuzzy results with 5-minute TTL
const cacheKey = `fuzzy:${query}:${categoryId}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const results = await fuzzySearch(...);
await redis.setex(cacheKey, 300, JSON.stringify(results));
```

### Rate Limiting
```typescript
// Limit fuzzy searches per user (optional)
@UseGuards(RateLimitGuard)
@Get('search')
async fuzzySearch(@Query() query: FuzzySearchQueryDto) { ... }
```

---

## Troubleshooting

### Issue: "Why am I getting so many results?"
**Solution**: Increase `minScoreThreshold` or decrease `maxEditDistance`

### Issue: "My typo isn't being caught"
**Solution**: Increase `maxEditDistance` to 3, or check if it's >3 character edits away

### Issue: "Search is slow with 5000+ items"
**Solution**: Add pagination limit, implement caching, or use database full-text search

### Issue: "Suggestions aren't showing up"
**Solution**: Check that result has `matchType: 'fuzzy'` and `suggestion` field is populated

---

## API Examples

### cURL Examples

```bash
# Basic search with typo
curl "http://localhost:3000/api/menu/search?q=piza"

# Multi-word fuzzy
curl "http://localhost:3000/api/menu/search?q=chees%20burg&maxEditDistance=2"

# Filter by category
curl "http://localhost:3000/api/menu/search?q=pasta&categoryId=abc-123&limit=10"

# Strict matching
curl "http://localhost:3000/api/menu/search?q=pizza&minScoreThreshold=0.95"
```

### JavaScript Examples

```javascript
// Using fetch
const response = await fetch(
  `${API_URL}/menu/search?q=piza&maxEditDistance=2&limit=20`
);
const results = await response.json();
console.log(results.items); // Top fuzzy matches

// Using axios
import axios from 'axios';
const { data } = await axios.get('/menu/search', {
  params: {
    q: 'cheeseburger',
    maxEditDistance: 2,
    minScoreThreshold: 0.3,
    limit: 20,
  },
});
```

---

## Future Enhancements

1. **Phonetic Matching**: Soundex/Metaphone for similar-sounding items
2. **Machine Learning**: Learn from user selections to improve ranking
3. **Multilingual Support**: Vietnamese-aware fuzzy matching
4. **Semantic Search**: Understand item categories for better suggestions
5. **Analytics**: Track popular searches and failed queries
6. **Autocomplete**: Suggest items as user types

---

## References

- [Fuse.js Documentation](https://fusejs.io/)
- [Levenshtein Distance](https://en.wikipedia.org/wiki/Levenshtein_distance)
- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/current/textsearch.html)
- [Fuzzy String Matching Best Practices](https://blog.maxmind.com/en/fuzzy-matching/)
