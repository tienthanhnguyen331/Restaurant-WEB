import { useCallback, useState } from 'react';
import React from 'react';
import axios from 'axios';

/**
 * Fuzzy search result item
 */
export interface FuzzySearchResultItem {
  item: {
    id: string;
    name: string;
    description?: string;
    price: number;
    primaryPhotoUrl?: string | null;
    status: 'available' | 'unavailable' | 'sold_out';
    isChefRecommended: boolean;
    prepTimeMinutes?: number;
    modifierGroups: any[];
  };
  score: number;
  matchType: 'exact' | 'fuzzy' | 'partial';
  matchedFields: string[];
  suggestion?: string;
}

/**
 * Fuzzy search response
 */
export interface FuzzySearchResponse {
  items: FuzzySearchResultItem[];
  total: number;
  page: number;
  limit: number;
  didYouMean?: string;
}

/**
 * Hook for fuzzy search with debouncing
 */
export function useFuzzySearch(apiBaseUrl: string) {
  const [results, setResults] = useState<FuzzySearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Perform fuzzy search
   */
  const search = useCallback(
    async (
      query: string,
      page = 1,
      limit = 20,
      maxEditDistance = 2,
      minScoreThreshold = 0.3,
      categoryId?: string,
    ) => {
      if (!query || query.trim().length === 0) {
        setResults(null);
        setError(null);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams({
          q: query,
          page: page.toString(),
          limit: limit.toString(),
          maxEditDistance: maxEditDistance.toString(),
          minScoreThreshold: minScoreThreshold.toString(),
        });

        if (categoryId) {
          params.append('categoryId', categoryId);
        }

        const response = await axios.get<FuzzySearchResponse>(
          `${apiBaseUrl}/menu/search?${params.toString()}`,
        );

        setResults(response.data);
      } catch (err) {
        const errorMessage = axios.isAxiosError(err)
          ? err.response?.data?.message || err.message
          : 'Failed to perform fuzzy search';
        setError(errorMessage);
        setResults(null);
      } finally {
        setIsLoading(false);
      }
    },
    [apiBaseUrl],
  );

  /**
   * Clear results
   */
  const clear = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  return {
    results,
    isLoading,
    error,
    search,
    clear,
  };
}

/**
 * Debounce hook
 */
export function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
