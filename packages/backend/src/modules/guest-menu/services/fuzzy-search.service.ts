import { Injectable, BadRequestException } from '@nestjs/common';
import Fuse, { FuseResult } from 'fuse.js';

/**
 * Configuration for fuzzy search behavior
 */
export interface FuzzySearchConfig {
  /** Maximum Levenshtein distance allowed (0-3 recommended) */
  maxEditDistance: number;
  /** Minimum score threshold (0-1, higher = stricter matching) */
  minScoreThreshold: number;
  /** Include partial word matches */
  includePartialMatches: boolean;
  /** Custom weights for different fields */
  fieldWeights?: {
    name: number;
    description: number;
  };
}

/**
 * Fuzzy search result with relevance score and metadata
 */
export interface FuzzySearchResult<T> {
  item: T;
  score: number;
  matchType: 'exact' | 'fuzzy' | 'partial';
  matchedFields: string[];
  suggestion?: string;
}

/**
 * Service for fuzzy search using Fuse.js library
 * Supports:
 * - Typo tolerance (Levenshtein distance)
 * - Multi-word fuzzy matching
 * - Relevance scoring and ranking
 * - Common misspellings
 */
@Injectable()
export class FuzzySearchService {
  private defaultConfig: FuzzySearchConfig = {
    maxEditDistance: 2,
    minScoreThreshold: 0.3,
    includePartialMatches: true,
    fieldWeights: {
      name: 1.0,
      description: 0.5,
    },
  };

  /**
   * Perform fuzzy search on a collection of items
   *
   * @param items Array of items to search through
   * @param query Search query string
   * @param searchableFields Fields to search in each item
   * @param config Fuzzy search configuration
   * @returns Sorted array of results with scores
   */
  fuzzySearch<T extends Record<string, any>>(
    items: T[],
    query: string,
    searchableFields: (keyof T)[],
    config?: Partial<FuzzySearchConfig>,
  ): FuzzySearchResult<T>[] {
    if (!query || query.trim().length === 0) {
      return [];
    }

    if (!items || items.length === 0) {
      return [];
    }

    const mergedConfig = { ...this.defaultConfig, ...config };

    // Pre-filter items for exact matches
    const exactMatches = this.findExactMatches(items, query, searchableFields);

    // Create Fuse instance for fuzzy matching
    const fuse = new Fuse(items, {
      keys: searchableFields.map((field) => ({
        name: field as string,
        weight: mergedConfig.fieldWeights?.[field as keyof typeof mergedConfig.fieldWeights] || 1,
      })),
      threshold: 1 - mergedConfig.minScoreThreshold,
      distance: mergedConfig.maxEditDistance * 10,
      minMatchCharLength: 2,
      useExtendedSearch: true,
    });

    // Perform fuzzy search
    const fuzzyResults = fuse.search(query);

    // Combine and rank results
    return this.rankAndCombineResults(
      items,
      query,
      fuzzyResults,
      exactMatches,
      searchableFields,
      mergedConfig,
    );
  }

  /**
   * Find items that exactly match the query
   */
  private findExactMatches<T extends Record<string, any>>(
    items: T[],
    query: string,
    fields: (keyof T)[],
  ): Map<T, string> {
    const exactMatches = new Map<T, string>();
    const lowerQuery = query.toLowerCase();

    items.forEach((item) => {
      fields.forEach((field) => {
        const fieldValue = String(item[field] || '').toLowerCase();
        if (fieldValue === lowerQuery) {
          exactMatches.set(item, field as string);
        }
      });
    });

    return exactMatches;
  }

  /**
   * Rank and combine exact matches with fuzzy results
   * Ranking order: exact > fuzzy with high score > fuzzy with low score
   */
  private rankAndCombineResults<T extends Record<string, any>>(
    items: T[],
    query: string,
    fuzzyResults: FuseResult<T>[],
    exactMatches: Map<T, string>,
    searchableFields: (keyof T)[],
    config: FuzzySearchConfig,
  ): FuzzySearchResult<T>[] {
    const results: FuzzySearchResult<T>[] = [];
    const processedItems = new Set<T>();

    // 1. Add exact matches first (score = 1.0)
    exactMatches.forEach((field, item) => {
      results.push({
        item,
        score: 1.0,
        matchType: 'exact',
        matchedFields: [field],
      });
      processedItems.add(item);
    });

    // 2. Add fuzzy matches (score = 1 - Fuse score)
    fuzzyResults.forEach((result) => {
      if (processedItems.has(result.item)) {
        return; // Skip already processed items
      }

      const score = 1 - (result.score || 0);
      if (score >= config.minScoreThreshold) {
        const matchedFields = result.matches?.map((m) => m.key || '') || [];
        const suggestion = this.generateSuggestion(result.item, query, searchableFields);

        results.push({
          item: result.item,
          score,
          matchType: score > 0.8 ? 'fuzzy' : 'partial',
          matchedFields,
          suggestion,
        });
        processedItems.add(result.item);
      }
    });

    // Sort by score descending, then by match type priority
    return results.sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score;
      }
      const matchTypePriority = { exact: 3, fuzzy: 2, partial: 1 };
      return matchTypePriority[b.matchType] - matchTypePriority[a.matchType];
    });
  }

  /**
   * Generate a "Did you mean...?" suggestion
   * Returns the field value if it's likely a misspelling of the query
   */
  private generateSuggestion<T extends Record<string, any>>(
    item: T,
    query: string,
    fields: (keyof T)[],
  ): string | undefined {
    const queryLower = query.toLowerCase();

    for (const field of fields) {
      const fieldValue = String(item[field] || '').toLowerCase();
      const distance = this.levenshteinDistance(queryLower, fieldValue);

      // If distance is 1-3 and field is shorter than query + 3 chars, suggest it
      if (distance > 0 && distance <= 3 && Math.abs(queryLower.length - fieldValue.length) <= 3) {
        return fieldValue;
      }
    }

    return undefined;
  }

  /**
   * Calculate Levenshtein distance between two strings
   * Measures the minimum number of single-character edits needed to transform one string into another
   */
  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1, // deletion
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  /**
   * Validate fuzzy search configuration
   */
  validateConfig(config: Partial<FuzzySearchConfig>): void {
    if (config.maxEditDistance !== undefined) {
      if (config.maxEditDistance < 0 || config.maxEditDistance > 5) {
        throw new BadRequestException(
          'maxEditDistance must be between 0 and 5',
        );
      }
    }

    if (config.minScoreThreshold !== undefined) {
      if (config.minScoreThreshold < 0 || config.minScoreThreshold > 1) {
        throw new BadRequestException(
          'minScoreThreshold must be between 0 and 1',
        );
      }
    }
  }
}
