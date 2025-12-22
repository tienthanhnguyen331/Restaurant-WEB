import { useState, useEffect } from 'react';
import axios from 'axios';
import MenuFilters from './MenuFilters';
import MenuItemCard from './MenuItemCard';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface GuestMenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  primaryPhotoUrl?: string;
  status: 'available' | 'unavailable' | 'sold_out';
  isChefRecommended: boolean;
  prepTimeMinutes?: number;
  modifierGroups: {
    id: string;
    name: string;
    selectionType: 'single' | 'multiple';
    isRequired: boolean;
    minSelections?: number;
    maxSelections?: number;
    options: {
      id: string;
      name: string;
      priceAdjustment: number;
    }[];
  }[];
}

export interface GuestMenuCategory {
  id: string;
  name: string;
  description?: string;
  items: GuestMenuItem[];
}

export interface GuestMenuResponse {
  data: {
    categories: GuestMenuCategory[];
  };
  page: number;
  limit: number;
  total: number;
}

export interface MenuFiltersState {
  q: string;
  categoryId: string;
  sort: 'createdAt' | 'price' | 'popularity';
  order: 'ASC' | 'DESC';
  chefRecommended: boolean;
}

export default function GuestMenuPage() {
  const [menuData, setMenuData] = useState<GuestMenuResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<MenuFiltersState>({
    q: '',
    categoryId: '',
    sort: 'createdAt',
    order: 'ASC',
    chefRecommended: false,
  });

  const loadMenu = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.q) params.append('q', filters.q);
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.order) params.append('order', filters.order);
      if (filters.chefRecommended) params.append('chefRecommended', 'true');
      params.append('page', page.toString());
      params.append('limit', '20');

      const response = await axios.get(`${API_BASE_URL}/api/menu?${params.toString()}`);
      setMenuData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, [page, filters]);

  const handleFilterChange = (newFilters: Partial<MenuFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to page 1 when filters change
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Error Loading Menu</h2>
          <p>{error}</p>
          <button
            onClick={loadMenu}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!menuData || menuData.data.categories.length === 0) {
    return (
      <div className="min-h-screen p-6">
        <MenuFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          categories={[]}
        />
        <div className="text-center py-12 text-gray-500">
          No menu items available at the moment.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Our Menu</h1>
          <p className="text-gray-600 mt-1">Browse our delicious offerings</p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <MenuFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          categories={menuData.data.categories}
        />
      </div>

      {/* Menu Content */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {menuData.data.categories.map((category) => (
          <div key={category.id} className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
              {category.description && (
                <p className="text-gray-600 mt-1">{category.description}</p>
              )}
            </div>

            {category.items.length === 0 ? (
              <p className="text-gray-500 italic">No items in this category.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.items.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Pagination */}
        {menuData.total > 20 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-gray-700">
              Page {page} of {Math.ceil(menuData.total / 20)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(menuData.total / 20)}
              className="px-4 py-2 bg-white border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
