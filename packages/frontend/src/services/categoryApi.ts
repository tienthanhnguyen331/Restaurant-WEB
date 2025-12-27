import axios from 'axios';
import { type CreateMenuCategoryDto,type UpdateMenuCategoryDto } from '@shared/types/menu.d';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://restaurant-web-five-wine.vercel.app';
const API_BASE = `${BASE_URL}/api/admin/menu/categories`;

export const categoryApi = {
  getAll: (params: any) => axios.get(API_BASE, { params }).then(res => res.data),
  create: (data: CreateMenuCategoryDto) => axios.post(API_BASE, data),
  update: (id: string, data: UpdateMenuCategoryDto) => axios.put(`${API_BASE}/${id}`, data),
  delete: (id: string) => axios.delete(`${API_BASE}/${id}`),
};