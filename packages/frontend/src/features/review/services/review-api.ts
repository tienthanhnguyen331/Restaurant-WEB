const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const reviewApi = {
  getAll: async (menuItemId?: string) => {
    const url = menuItemId
      ? `${API_URL}/api/reviews?menu_item_id=${menuItemId}`
      : `${API_URL}/api/reviews`;
    const res = await fetch(url);
    return res.json();
  },

  create: async (data: any) => {
    const res = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return res.json();
  },
  getAverageRating: async (menuItemId: string) => {
    const res = await fetch(`${API_URL}/api/reviews/menu-item/${menuItemId}/average-rating`);
    return res.json();
  },
};