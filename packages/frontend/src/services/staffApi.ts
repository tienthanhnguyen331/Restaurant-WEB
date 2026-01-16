import axios from 'axios';
import { getAccessTokenByRole } from '../features/auth/hooks/useAuth';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://restaurant-web-five-wine.vercel.app';
const STAFF_API_BASE = `${BASE_URL}/api/admin/staff`;

const getAuthHeaders = () => {
  const token = getAccessTokenByRole('ADMIN');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export interface CreateStaffPayload {
  fullName: string;
  email: string;
  password: string;
  role: 'WAITER' | 'KITCHEN_STAFF';
}

export interface UpdateStaffPayload {
  fullName?: string;
  email?: string;
  role?: 'WAITER' | 'KITCHEN_STAFF';
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'WAITER' | 'KITCHEN_STAFF';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export const staffApi = {
  /**
   * Create a new staff account
   */
  createStaff: async (data: CreateStaffPayload) => {
    const response = await axios.post(`${STAFF_API_BASE}`, data, getAuthHeaders());
    return response.data;
  },

  /**
   * Get all staff members
   */
  getAllStaff: async () => {
    const response = await axios.get(`${STAFF_API_BASE}`, getAuthHeaders());
    return response.data;
  },

  /**
   * Get a specific staff member
   */
  getStaffById: async (staffId: string) => {
    const response = await axios.get(`${STAFF_API_BASE}/${staffId}`, getAuthHeaders());
    return response.data;
  },

  /**
   * Update staff information
   */
  updateStaff: async (staffId: string, data: UpdateStaffPayload) => {
    const response = await axios.patch(
      `${STAFF_API_BASE}/${staffId}`,
      data,
      getAuthHeaders(),
    );
    return response.data;
  },

  /**
   * Delete a staff member
   */
  deleteStaff: async (staffId: string) => {
    const response = await axios.delete(`${STAFF_API_BASE}/${staffId}`, getAuthHeaders());
    return response.data;
  },
};
