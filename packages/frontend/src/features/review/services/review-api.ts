const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const reviewApi = {
  getAll: async (menuItemId?: string) => {
    const url = menuItemId
      ? `${API_URL}/api/reviews?menu_item_id=${menuItemId}`
      : `${API_URL}/api/reviews`;
    const res = await fetch(url);
    return res.json();
  },
};