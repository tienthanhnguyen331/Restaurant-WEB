import { getAccessTokenByRole } from '../../auth/hooks/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const buildHeaders = (extra: Record<string, string> = {}): Record<string, string> => {
  const token = getAccessTokenByRole() ?? getAccessTokenByRole('USER');
  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
  return { ...extra, ...authHeader };
};

export const orderApi = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/api/orders`);
    return res.json();
  },
  getAllByStatus: async (status: string) => {
    if (status === 'ALL') {
      return orderApi.getAll();
    }
    const res = await fetch(`${API_URL}/api/orders?status=${status}`);
    return res.json();
  },
  getMyOrders: async () => {
    const res = await fetch(`${API_URL}/api/orders/me`, {
      headers: buildHeaders({ 'Content-Type': 'application/json' }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || `Failed to load your orders: ${res.status}`);
    }
    return res.json();
  },
  create: async (data: any) => {
    const headers = buildHeaders({ 'Content-Type': 'application/json' });
    const res = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || `Order creation failed: ${res.status}`);
    }
    return res.json();
  },
  getById: async (id: string) => {
      const res = await fetch(`${API_URL}/api/orders/${id}`);
      return res.json();
  },
  updateStatus: async (id: string, status: string) => {
    const res = await fetch(`${API_URL}/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
        throw new Error(`Failed to update status: ${res.status}`);
    }
    return res.json();
  }
};