import axios from 'axios';
import { type MenuCategory, type CreateMenuCategoryDto,type UpdateMenuCategoryDto } from '@shared/types/menu.d';

const API_BASE = '/api/admin/menu/categories';

export const categoryApi = {
  getAll: (params: any) => axios.get(API_BASE, { params }).then(res => res.data),
  create: (data: CreateMenuCategoryDto) => axios.post(API_BASE, data),
  update: (id: string, data: UpdateMenuCategoryDto) => axios.put(`${API_BASE}/${id}`, data),
  delete: (id: string) => axios.delete(`${API_BASE}/${id}`),
};