import React from 'react';
import type { TableQueryDto } from '@shared/types/table';

interface FilterBarProps {
    currentQuery: TableQueryDto;
    onQueryChange: React.Dispatch<React.SetStateAction<TableQueryDto>>;
}

export const FilterBar: React.FC<FilterBarProps> = ({ currentQuery, onQueryChange }) => {
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        onQueryChange(prev => ({ 
            ...prev, 
            [name]: value === '' ? undefined : value, // Chuyển empty string thành undefined để loại khỏi query
            page: 1 // Reset về trang 1 khi filter thay đổi
        }));
    };

    return (
        <div className="filter-bar p-4 border rounded-lg bg-gray-50 mb-4 flex space-x-4">
            <input 
                name="search"
                placeholder="Tìm kiếm số bàn hoặc vị trí..." 
                value={currentQuery.search || ''} 
                onChange={handleChange} 
                className="p-2 border rounded w-1/3"
            />
            <select 
                name="status" 
                value={currentQuery.status || ''} 
                onChange={handleChange}
                className="p-2 border rounded"
            >
                <option value="">Tất cả trạng thái</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
            </select>
            <input 
                name="location"
                placeholder="Lọc theo Vị trí" 
                value={currentQuery.location || ''} 
                onChange={handleChange} 
                className="p-2 border rounded w-1/4"
            />
            <select 
                name="sort" 
                value={currentQuery.sort || ''}
                onChange={handleChange}
                className="p-2 border rounded"
            >
                <option value="">Sắp xếp theo</option>
                <option value="tableNumber">Số bàn</option>
                <option value="capacity">Sức chứa</option>
                <option value="createdAt">Ngày tạo</option>
            </select>
            <select 
                name="order" 
                value={currentQuery.order || ''}
                onChange={handleChange}
                className="p-2 border rounded"
            >
                <option value="ASC">Tăng dần</option>
                <option value="DESC">Giảm dần</option>
            </select>
            {/* Có thể thêm Sort/Order ở đây */}
        </div>
    );
};