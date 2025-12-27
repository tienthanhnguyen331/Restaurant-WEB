import { useState, useEffect } from 'react';
import type { MenuFiltersState, GuestMenuCategory } from './GuestMenuPage';

interface MenuFiltersProps {
  filters: MenuFiltersState;
  onFilterChange: (filters: Partial<MenuFiltersState>) => void;
  categories: GuestMenuCategory[];
}

export default function MenuFilters({ filters, onFilterChange, categories }: MenuFiltersProps) {
  const [localSearch, setLocalSearch] = useState(filters.q);

  useEffect(() => {
    setLocalSearch(filters.q);
  }, [filters.q]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.q) {
        onFilterChange({ q: localSearch });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearch, filters.q, onFilterChange]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search menu items..."
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={filters.categoryId}
            onChange={(e) => onFilterChange({ categoryId: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            value={`${filters.sort}-${filters.order}`}
            onChange={(e) => {
              const [sort, order] = e.target.value.split('-') as [
                'createdAt' | 'price' | 'popularity',
                'ASC' | 'DESC'
              ];
              onFilterChange({ sort, order });
            }}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="createdAt-DESC">Newest First</option>
            <option value="createdAt-ASC">Oldest First</option>
            <option value="price-ASC">Price: Low to High</option>
            <option value="price-DESC">Price: High to Low</option>
            <option value="popularity-DESC">Most Popular</option>
          </select>
        </div>

        {/* Chef Recommended */}
        <div className="flex items-end">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={filters.chefRecommended}
              onChange={(e) => onFilterChange({ chefRecommended: e.target.checked })}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              Chef's Recommendations Only
            </span>
          </label>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(filters.q || filters.categoryId || filters.chefRecommended) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {filters.q && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              Search: "{filters.q}"
              <button
                onClick={() => onFilterChange({ q: '' })}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.categoryId && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
              Category: {categories.find(c => c.id === filters.categoryId)?.name}
              <button
                onClick={() => onFilterChange({ categoryId: '' })}
                className="ml-2 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.chefRecommended && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
              Chef's Recommendations
              <button
                onClick={() => onFilterChange({ chefRecommended: false })}
                className="ml-2 text-yellow-600 hover:text-yellow-800"
              >
                ×
              </button>
            </span>
          )}
          <button
            onClick={() => onFilterChange({ q: '', categoryId: '', chefRecommended: false })}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
