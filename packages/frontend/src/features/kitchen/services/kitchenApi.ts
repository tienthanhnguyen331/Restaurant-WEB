import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api'
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const kitchenApi = {
  getOrders: async () => {
    const response = await api.get('/kitchen/orders');
    return response.data;
  },

  setPreparing: async (orderId: string) => {
    const response = await api.post(`/kitchen/orders/${orderId}/preparing`);
    return response.data;
  },

  setReady: async (orderId: string) => {
    const response = await api.post(`/kitchen/orders/${orderId}/ready`);
    return response.data;
  },
};
