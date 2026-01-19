import React, { useEffect, useRef } from 'react';
import { formatCurrency } from '../../../utils/formatCurrency';
import { Search, AlertCircle, CheckCircle } from 'lucide-react';
import { useFuzzySearch, useDebounce, type FuzzySearchResultItem } from '../hooks/useFuzzySearch';

interface FuzzySearchComponentProps {
  apiBaseUrl: string;
  categoryId?: string;
  onSelectItem?: (item: FuzzySearchResultItem['item']) => void;
  maxResults?: number;
}

/**
 * Fuzzy search component with typo tolerance
 * Features:
 * - Debounced input (300ms)
 * - Relevance scoring with color coding
 * - Match type badges (exact/fuzzy/partial)
 * - "Did you mean" suggestions
 * - Loading and error states
 */
export default function FuzzySearchComponent({
  apiBaseUrl,
  categoryId,
  onSelectItem,
  maxResults = 8,
}: FuzzySearchComponentProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const debouncedQuery = useDebounce(searchQuery, 300);
  const { results, isLoading, error, search, clear } = useFuzzySearch(apiBaseUrl);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      search(debouncedQuery, 1, maxResults, 2, 0.3, categoryId);
      setIsOpen(true);
    } else {
      clear();
      setIsOpen(false);
    }
  }, [debouncedQuery, categoryId, search, clear, maxResults]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Get color based on relevance score
   */
  const getScoreColor = (score: number): string => {
    if (score >= 0.95) return 'text-green-700 bg-green-50';
    if (score >= 0.8) return 'text-blue-700 bg-blue-50';
    if (score >= 0.6) return 'text-yellow-700 bg-yellow-50';
    return 'text-orange-700 bg-orange-50';
  };

  /**
   * Get badge color and label for match type
   */
  const getMatchTypeBadge = (matchType: string): { label: string; color: string } => {
    const badges: Record<string, { label: string; color: string }> = {
      exact: { label: 'Exact', color: 'bg-green-100 text-green-800' },
      fuzzy: { label: 'Close Match', color: 'bg-blue-100 text-blue-800' },
      partial: { label: 'Partial', color: 'bg-yellow-100 text-yellow-800' },
    };
    return badges[matchType] || { label: matchType, color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <div className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery.trim() && setIsOpen(true)}
          placeholder="Search menu items... (supports typos)"
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {/* Loading State */}
          {isLoading && (
            <div className="p-4 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              <p className="mt-2">Searching...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="p-4 bg-red-50 border-t border-red-200">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Results */}
          {results && results.items.length > 0 && !isLoading && (
            <>
              {/* Did You Mean Suggestion */}
              {results.didYouMean && (
                <div className="p-3 bg-blue-50 border-b border-blue-200">
                  <p className="text-sm text-blue-700">
                    Did you mean: <strong>{results.didYouMean}</strong>?
                  </p>
                </div>
              )}

              {/* Results List */}
              <div className="divide-y divide-gray-100">
                {results.items.map((result) => {
                  const matchBadge = getMatchTypeBadge(result.matchType);
                  const scoreColor = getScoreColor(result.score);

                  return (
                    <button
                      key={result.item.id}
                      onClick={() => {
                        if (onSelectItem) {
                          onSelectItem(result.item);
                        }
                        setSearchQuery('');
                        setIsOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-900 truncate">
                              {result.item.name}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${matchBadge.color}`}
                            >
                              {matchBadge.label}
                            </span>
                          </div>

                          {result.item.description && (
                            <p className="text-sm text-gray-600 truncate">
                              {result.item.description}
                            </p>
                          )}

                          {/* Matched Fields */}
                          <div className="flex items-center gap-2 mt-1">
                            <div className="text-xs text-gray-500">
                              Matched: {result.matchedFields.join(', ')}
                            </div>
                          </div>

                          {/* Suggestion if available */}
                          {result.suggestion && result.matchType !== 'exact' && (
                            <div className="text-xs text-blue-600 mt-1">
                              Did you mean: <strong>{result.suggestion}</strong>?
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {/* Price */}
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(result.item.price)}
                          </div>

                          {/* Relevance Score */}
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded ${scoreColor}`}>
                            {result.score >= 0.9 && (
                              <CheckCircle className="h-3 w-3" />
                            )}
                            <span className="text-xs font-medium">
                              {(result.score * 100).toFixed(0)}%
                            </span>
                          </div>

                          {/* Chef Recommended Badge */}
                          {result.item.isChefRecommended && (
                            <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              ⭐ Chef's Pick
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Results Summary */}
              <div className="p-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
                Showing {results.items.length} of {results.total} results
                {results.total > maxResults && (
                  <span className="block">
                    Type more to refine results
                  </span>
                )}
              </div>
            </>
          )}

          {/* No Results State */}
          {results && results.items.length === 0 && !isLoading && !error && (
            <div className="p-4 text-center text-gray-500">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No items found for "{searchQuery}"</p>
              <p className="text-xs mt-1">Try different keywords or check spelling</p>
            </div>
          )}
        </div>
      )}

      {/* Clear Button */}
      {searchQuery && (
        <button
          onClick={() => {
            setSearchQuery('');
            setIsOpen(false);
            searchInputRef.current?.focus();
          }}
          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      )}
    </div>
  );
}
