import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://restaurant-web-five-wine.vercel.app';
const API_BASE = `${BASE_URL}/api/admin/profile`;

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
   * Get current admin's profile information
   */
  getProfile: () => axios.get(`${API_BASE}`).then(res => res.data),

  /**
   * Update basic profile information
   */
  updateProfile: (data: UpdateProfilePayload) =>
    axios.patch(`${API_BASE}`, data).then(res => res.data),

  /**
   * Change password
   */
  changePassword: (data: ChangePasswordPayload) =>
    axios.patch(`${API_BASE}/password`, data).then(res => res.data),

  /**
   * Initiate email change
   */
  changeEmail: (data: ChangeEmailPayload) =>
    axios.patch(`${API_BASE}/email`, data).then(res => res.data),

  /**
   * Upload avatar
   */
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return axios.post(`${API_BASE}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data);
  },

  /**
   * Verify email change with token
   */
  verifyEmail: (token: string) =>
    axios.get(`${API_BASE}/email/verify/${token}`).then(res => res.data),
};
