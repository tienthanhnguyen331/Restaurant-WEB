import axios from 'axios';
import type { MenuItemPhoto } from '@shared/types/menu.d.ts'; // Đã thêm 'type'

const BASE_URL = import.meta.env.VITE_BACKEND_URL || '';
const API_BASE = `${BASE_URL}/api/admin/menu/items`;

export const photoApi = {
  // Sử dụng MenuItemPhoto[] để hết lỗi 6133
  getByItem: (itemId: string): Promise<MenuItemPhoto[]> => 
    axios.get(`${API_BASE}/${itemId}/photos`).then(res => res.data),
    
  setPrimary: (itemId: string, photoId: string) => 
    axios.patch(`${API_BASE}/${itemId}/photos/${photoId}/primary`),
    
  delete: (itemId: string, photoId: string) => 
    axios.delete(`${API_BASE}/${itemId}/photos/${photoId}`),
    
  upload: (itemId: string, files: FileList) => {
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append('files', file));
    return axios.post(`${API_BASE}/${itemId}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};