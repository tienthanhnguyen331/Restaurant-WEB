import React, { useState, useEffect, useCallback } from 'react';
import { type MenuCategory, type CategoryQueryDto } from '@shared/types/menu.d'; 
import { categoryApi } from '../../services/categoryApi';

import { CategoryFilter } from './components/CategoryFilter';
import { CategoryGrid } from './components/CategoryGrid';
import { CategoryForm } from './components/CategoryForm';

export const CategoryPage: React.FC = () => {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  
  const [query, setQuery] = useState<any>({ 
      status: undefined, 
      search: undefined, 
      page: 1, 
      limit: 10 
  });

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await categoryApi.getAll(query);
      setCategories(result.data);
      setTotalItems(result.total);
    } catch (error) {
      console.error("Lỗi khi tải danh mục:", error);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSuccess = () => {
      setIsModalOpen(false);
      fetchCategories(); 
  };

  const handleOpenModal = (category: MenuCategory | null) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto p-4 md:p-8 bg-white shadow-xl rounded-lg">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-3xl font-extrabold text-gray-800">Quản Lý Danh Mục</h2>
        <button 
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition" 
          onClick={() => handleOpenModal(null)}
        >
          + Thêm Danh Mục
        </button>
      </div>
      
      <div className="mb-6">
        <CategoryFilter currentQuery={query} onQueryChange={setQuery} />
      </div>

      {isLoading ? (
        <p className="text-center py-12 text-gray-500">Đang tải dữ liệu...</p>
      ) : (
        <CategoryGrid 
          categories={categories} 
          onEdit={(cat) => handleOpenModal(cat)} 
        />
      )}
      
      {isModalOpen && (
        <CategoryForm
          category={editingCategory}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};