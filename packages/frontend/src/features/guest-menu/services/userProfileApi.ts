import axios from 'axios';

export const userProfileApi = {
  getProfile: () => axios.get('/api/user/profile'),
  updateProfile: (data: { fullName: string; displayName?: string }) => axios.put('/api/user/profile', data),
  changePassword: (data: { oldPassword: string; newPassword: string; confirmNewPassword: string }) => axios.post('/api/user/change-password', data),
  changeEmail: (data: { newEmail: string; password: string }) => axios.post('/api/user/change-email', data),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return axios.post('/api/user/upload-avatar', formData);
  },
};
