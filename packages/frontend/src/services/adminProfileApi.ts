import axios from 'axios';
import { getAccessTokenByRole } from '../features/auth/hooks/useAuth';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://restaurant-web-five-wine.vercel.app';
// Lưu ý: getProfile thường nằm ở /api/auth/profile, còn các tính năng admin nằm ở /api/admin/profile
const ADMIN_API_BASE = `${BASE_URL}/api/admin/profile`;
const AUTH_API_BASE = `${BASE_URL}/api/auth/profile`;

const getAuthHeaders = () => {
  const token = getAccessTokenByRole('ADMIN'); 
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

interface UpdateProfilePayload {
  fullName: string;
  displayName?: string;
}

interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

interface ChangeEmailPayload {
  newEmail: string;
  password: string;
}

export const adminProfileApi = {
  /**
   * Lấy thông tin hồ sơ (Sử dụng endpoint auth chung)
   */
  getProfile: async () => {
    // Phải thêm getAuthHeaders() để Backend biết bạn là ai
    return axios.get(`${AUTH_API_BASE}`, getAuthHeaders());
  },

  /**
   * Cập nhật thông tin cơ bản
   */
  updateProfile: (data: UpdateProfilePayload) =>
    // Thêm tham số thứ 3 là headers
    axios.patch(`${ADMIN_API_BASE}`, data, getAuthHeaders()).then(res => res.data),

  /**
   * Thay đổi mật khẩu
   */
  changePassword: (data: ChangePasswordPayload) =>
    axios.patch(`${ADMIN_API_BASE}/password`, data, getAuthHeaders()).then(res => res.data),

  /**
   * Thay đổi email
   */
  changeEmail: (data: ChangeEmailPayload) =>
    axios.patch(`${ADMIN_API_BASE}/email`, data, getAuthHeaders()).then(res => res.data),

  /**
   * Tải lên avatar
   */
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const authConfig = getAuthHeaders();
    return axios.post(`${ADMIN_API_BASE}/avatar`, formData, {
      headers: {
        ...authConfig.headers,
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data);
  },
};