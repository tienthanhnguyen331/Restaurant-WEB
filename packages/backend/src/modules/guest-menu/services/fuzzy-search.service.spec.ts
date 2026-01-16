import { Test, TestingModule } from '@nestjs/testing';
import { FuzzySearchService, FuzzySearchConfig } from './fuzzy-search.service';

describe('FuzzySearchService', () => {
  let service: FuzzySearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FuzzySearchService],
    }).compile();

    service = module.get<FuzzySearchService>(FuzzySearchService);
  });

  describe('fuzzySearch - Basic Functionality', () => {
    const items = [
      { id: '1', name: 'Pizza Margherita', description: 'Classic cheese pizza' },
      { id: '2', name: 'Cheeseburger', description: 'Burger with melted cheese' },
      { id: '3', name: 'Pasta Carbonara', description: 'Creamy pasta with bacon' },
      { id: '4', name: 'Caesar Salad', description: 'Salad with romaine lettuce' },
      { id: '5', name: 'Grilled Salmon', description: 'Fresh salmon fillet' },
    ];

    it('should find exact match', () => {
      const results = service.fuzzySearch(items, 'Pizza', ['name', 'description']);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].item.name).toContain('Pizza');
      expect(results[0].matchType).toBe('exact');
      expect(results[0].score).toBeGreaterThan(0.9);
    });

    it('should find fuzzy match with single typo', () => {
      const results = service.fuzzySearch(items, 'Piza', ['name', 'description']);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].item.name).toBe('Pizza Margherita');
      expect(results[0].matchType).toBe('fuzzy');
    });

    it('should find fuzzy match with two typos', () => {
      const results = service.fuzzySearch(items, 'Paasta', ['name', 'description']);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].item.name).toContain('Pasta');
    });

    it('should find partial match in description', () => {
      const results = service.fuzzySearch(items, 'cheese', ['name', 'description']);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle multi-word queries', () => {
      const results = service.fuzzySearch(items, 'Grilled Fish', ['name', 'description']);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty array for no matches', () => {
      const results = service.fuzzySearch(items, 'xyz123notexist', ['name']);
      expect(results.length).toBe(0);
    });

    it('should return empty array for empty query', () => {
      const results = service.fuzzySearch(items, '', ['name']);
      expect(results.length).toBe(0);
    });

    it('should handle null items array', () => {
      const results = service.fuzzySearch(null as any, 'pizza', ['name']);
      expect(results.length).toBe(0);
    });
  });

  describe('fuzzySearch - Ranking and Scoring', () => {
    const items = [
      { id: '1', name: 'Pizza', description: 'A pizza item' },
      { id: '2', name: 'Pizza Margherita', description: 'Classic pizza' },
      { id: '3', name: 'Pepperoni Pizza', description: 'Pizza with pepperoni' },
    ];

    it('should rank exact matches higher than fuzzy matches', () => {
      const results = service.fuzzySearch(items, 'Pizza', ['name', 'description']);
      expect(results[0].matchType).toBe('exact');
      expect(results[0].score).toBe(1.0);
    });

    it('should sort results by relevance score descending', () => {
      const results = service.fuzzySearch(items, 'Pizza', ['name']);
      let previousScore = results[0].score;
      for (let i = 1; i < results.length; i++) {
        expect(results[i].score).toBeLessThanOrEqual(previousScore);
        previousScore = results[i].score;
      }
    });

    it('should include matchedFields in results', () => {
      const results = service.fuzzySearch(items, 'pizza', ['name', 'description']);
      expect(results[0].matchedFields).toBeDefined();
      expect(results[0].matchedFields.length).toBeGreaterThan(0);
    });
  });

  describe('fuzzySearch - Configuration', () => {
    const items = [
      { id: '1', name: 'Pizza', description: '' },
      { id: '2', name: 'Piza', description: '' },
    ];

    it('should respect maxEditDistance config', () => {
      const config: Partial<FuzzySearchConfig> = { maxEditDistance: 0 };
      const results = service.fuzzySearch(items, 'Piza', ['name'], config);
      // With maxEditDistance=0, should not match typo
      const hasPizza = results.some((r) => r.item.id === '1');
      expect(hasPizza).toBeFalsy();
    });

    it('should respect minScoreThreshold config', () => {
      const config: Partial<FuzzySearchConfig> = { minScoreThreshold: 0.9 };
      const results = service.fuzzySearch(items, 'Piza', ['name'], config);
      // With high threshold, should filter out low scores
      expect(results.every((r) => r.score >= 0.9)).toBeTruthy();
    });

    it('should validate maxEditDistance in range', () => {
      const invalidConfig: Partial<FuzzySearchConfig> = { maxEditDistance: 10 };
      expect(() => service.validateConfig(invalidConfig)).toThrow();
    });

    it('should validate minScoreThreshold in range', () => {
      const invalidConfig: Partial<FuzzySearchConfig> = { minScoreThreshold: 1.5 };
      expect(() => service.validateConfig(invalidConfig)).toThrow();
    });
  });

  describe('fuzzySearch - Field Weights', () => {
    const items = [
      { id: '1', name: 'Burger', description: 'Delicious pizza' },
      { id: '2', name: 'Pizza', description: 'Delicious burger' },
    ];

    it('should prioritize name field when searching for pizza', () => {
      const config: Partial<FuzzySearchConfig> = {
        fieldWeights: { name: 1.0, description: 0.1 },
      };
      const results = service.fuzzySearch(items, 'Pizza', ['name', 'description'], config);
      expect(results[0].item.id).toBe('2');
    });
  });

  describe('fuzzySearch - Common Misspellings', () => {
    const items = [
      { id: '1', name: 'Cheeseburger', description: 'Classic cheeseburger' },
      { id: '2', name: 'Spaghetti', description: 'Italian pasta' },
      { id: '3', name: 'Cappuccino', description: 'Italian coffee' },
    ];

    it('should handle single character substitution', () => {
      const results = service.fuzzySearch(items, 'Chezseburger', ['name']);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].item.name).toBe('Cheeseburger');
    });

    it('should handle character deletion', () => {
      const results = service.fuzzySearch(items, 'Spageti', ['name']);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].item.name).toBe('Spaghetti');
    });

    it('should handle character insertion', () => {
      const results = service.fuzzySearch(items, 'Cappuccinno', ['name']);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].item.name).toBe('Cappuccino');
    });

    it('should generate suggestion for likely misspelling', () => {
      const results = service.fuzzySearch(items, 'Chezseburger', ['name']);
      expect(results[0].suggestion).toBeDefined();
    });
  });

  describe('fuzzySearch - Case Insensitivity', () => {
    const items = [
      { id: '1', name: 'PIZZA', description: 'Uppercase' },
      { id: '2', name: 'pizza', description: 'Lowercase' },
      { id: '3', name: 'Pizza', description: 'Mixed case' },
    ];

    it('should find matches regardless of case', () => {
      const resultsLower = service.fuzzySearch(items, 'pizza', ['name']);
      const resultsUpper = service.fuzzySearch(items, 'PIZZA', ['name']);
      expect(resultsLower.length).toBeGreaterThan(0);
      expect(resultsUpper.length).toBeGreaterThan(0);
    });
  });

  describe('Levenshtein Distance', () => {
    it('should calculate correct distance for identical strings', () => {
      // Access private method through any type
      const distance = (service as any).levenshteinDistance('pizza', 'pizza');
      expect(distance).toBe(0);
    });

    it('should calculate correct distance for one substitution', () => {
      const distance = (service as any).levenshteinDistance('pizza', 'piza');
      expect(distance).toBe(1);
    });

    it('should calculate correct distance for multiple edits', () => {
      const distance = (service as any).levenshteinDistance('pizza', 'peza');
      expect(distance).toBe(1); // One substitution
    });

    it('should calculate correct distance for insertion', () => {
      const distance = (service as any).levenshteinDistance('pizza', 'pizzaa');
      expect(distance).toBe(1);
    });

    it('should calculate correct distance for deletion', () => {
      const distance = (service as any).levenshteinDistance('pizza', 'piza');
      expect(distance).toBe(1);
    });

    it('should calculate symmetric distance', () => {
      const d1 = (service as any).levenshteinDistance('cat', 'cut');
      const d2 = (service as any).levenshteinDistance('cut', 'cat');
      expect(d1).toBe(d2);
    });
  });

  describe('fuzzySearch - Performance', () => {
    it('should handle large datasets efficiently', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `item-${i}`,
        name: `Item ${i}`,
        description: `This is item number ${i}`,
      }));

      const startTime = Date.now();
      const results = service.fuzzySearch(largeDataset, 'Item 5', ['name', 'description']);
      const endTime = Date.now();

      expect(results.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(500); // Should complete in less than 500ms
    });
  });
});
