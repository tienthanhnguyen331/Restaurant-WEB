import React, { useState, useEffect } from 'react';
import { type MenuCategory } from '@shared/types/menu.d'; 
import { categoryApi } from '../../../services/categoryApi';

interface CategoryFormProps {
  category: MenuCategory | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({ category, onClose, onSuccess }) => {
  const isEdit = !!category;
  const [formData, setFormData] = useState<any>({
    name: '',
    description: '',
    displayOrder: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        displayOrder: category.displayOrder,
      });
    }
  }, [category]);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  // Chỉ lấy đúng các trường mà Backend DTO yêu cầu
  const payload = {
    name: formData.name,
    displayOrder: Number(formData.displayOrder),
    description: formData.description || undefined, 
  };

  try {
    if (isEdit && category) {
      // Khi Update, có thể Backend cần thêm trường 'status'
      await categoryApi.update(category.id, payload);
    } else {
      await categoryApi.create(payload);
    }
    onSuccess();
  } catch (error: any) {
    // In ra lỗi chi tiết từ Backend để debug
    const message = error.response?.data?.message;
    alert("Thao tác thất bại: " + (Array.isArray(message) ? message.join(', ') : message));
  } finally {
    setIsLoading(false);
  }
};

  const handleDelete = async () => {
    if (!category || !window.confirm("Bạn có chắc chắn muốn xóa?")) return;
    try {
      await categoryApi.delete(category.id);
      onSuccess();
    } catch (error) {
      alert("Không thể xóa danh mục này!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">{isEdit ? 'Sửa Danh Mục' : 'Thêm Danh Mục'}</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tên danh mục</label>
            <input 
              className="mt-1 block w-full border rounded-md p-2"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Thứ tự hiển thị</label>
            <input 
                type="number"
                className="mt-1 block w-full border rounded-md p-2"
                // Đảm bảo không truyền NaN vào value
                value={isNaN(formData.displayOrder) ? '' : formData.displayOrder} 
                onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setFormData({ ...formData, displayOrder: isNaN(val) ? 0 : val });
                }}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          {isEdit && (
            <button 
              type="button" 
              onClick={handleDelete}
              className="px-4 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
            >
              Xóa
            </button>
          )}
          <div className="flex space-x-2 ml-auto">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600">Hủy</button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Lưu
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};