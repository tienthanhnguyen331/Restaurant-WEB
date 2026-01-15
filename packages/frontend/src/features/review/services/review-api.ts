const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const reviewApi = {
  getAll: async (menuItemId?: string, page: number = 1, limit: number = 10) => {
    const params = new URLSearchParams();
    if (menuItemId) {
      params.append('menu_item_id', menuItemId);
    }
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const url = `${API_URL}/api/reviews?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch reviews: ${res.statusText}`);
    }
    return res.json();
  },

  create: async (data: any) => {
    const res = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw error;
    }
    return res.json();
  },
  getAverageRating: async (menuItemId: string) => {
    const res = await fetch(`${API_URL}/api/reviews/menu-item/${menuItemId}/average-rating`);
    if (!res.ok) {
      throw new Error(`Failed to fetch average rating: ${res.statusText}`);
    }
    const data = await res.json();
    return data;
  },
};