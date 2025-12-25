import React from 'react';

export const CategoryFilter: React.FC<{currentQuery: any, onQueryChange: any}> = ({ currentQuery, onQueryChange }) => {
  return (
    <div className="flex gap-4">
      <input 
        type="text" 
        placeholder="Tìm tên danh mục..." 
        className="border rounded-lg p-2 flex-1"
        value={currentQuery.search || ''}
        onChange={(e) => onQueryChange({...currentQuery, search: e.target.value})}
      />
      <select 
        className="border rounded-lg p-2"
        value={currentQuery.status || ''}
        onChange={(e) => onQueryChange({...currentQuery, status: e.target.value || undefined})}
      >
        <option value="">Tất cả trạng thái</option>
        <option value="active">Hoạt động</option>
        <option value="inactive">Ngừng hoạt động</option>
      </select>
    </div>
  );
};