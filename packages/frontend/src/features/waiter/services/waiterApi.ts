import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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

export const waiterApi = {
  getPendingOrders: async () => {
    const response = await api.get('/api/waiter/orders/pending');
    return response.data;
  },

  acceptOrder: async (orderId: string) => {
    const response = await api.post(`/api/waiter/orders/${orderId}/accept`);
    return response.data;
  },

  rejectOrder: async (orderId: string) => {
    const response = await api.post(`/api/waiter/orders/${orderId}/reject`);
    return response.data;
  },

  sendToKitchen: async (orderId: string) => {
    const response = await api.post(`/api/waiter/orders/${orderId}/send-to-kitchen`);
    return response.data;
  },
};
