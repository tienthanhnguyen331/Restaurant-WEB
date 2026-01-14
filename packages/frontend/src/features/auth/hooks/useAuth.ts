import axios from 'axios';

// Cập nhật baseURL thêm /api để khớp với app.setGlobalPrefix('api') ở Backend
const api = axios.create({ 
    baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api'
});

// Helper: Lấy access_token theo role hiện tại
function getTokenByRole() {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    const role = user?.role?.toUpperCase();
    if (!role) return null;
    return localStorage.getItem(`access_token_${role}`);
  } catch {
    return null;
  }
}

api.interceptors.request.use((config) => {
  const token = getTokenByRole();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Định nghĩa Interface để tránh lỗi 'implicitly has any type'
export interface LoginCredentials {
  email: string;
  password?: string;
}

export const login = async (credentials: LoginCredentials) => {
  // Request thực tế: POST http://localhost:3000/api/auth/login
  const { data } = await api.post('/auth/login', credentials);
  if (data.access_token && data.user?.role) {
    const role = data.user.role.toUpperCase();
    localStorage.setItem(`access_token_${role}`, data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user)); // Save user info
  }
  return data.user;
};
export const logout = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      const role = user?.role?.toUpperCase();
      if (role) {
        localStorage.removeItem(`access_token_${role}`);
      }
    } catch {}
  }
  localStorage.removeItem('user');
  // Điều hướng về trang login và reload để xóa sạch state cũ
  window.location.href = '/login';
};
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) return JSON.parse(userStr);
  return null;
};

// Helper: Lấy access_token theo role (public)
export const getAccessTokenByRole = (role?: string) => {
  if (!role) {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      const user = JSON.parse(userStr);
      role = user?.role?.toUpperCase();
    } catch {
      return null;
    }
  }
  return role ? localStorage.getItem(`access_token_${role}`) : null;
};