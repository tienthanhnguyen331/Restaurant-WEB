export interface Review {
  id: string;
  user_id: string;
  menu_item_id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;

  // Thông tin User (được join từ backend)
  user?: {
    id: string;
    name: string;
  };

  // Thông tin Món ăn (được join từ backend)
  menu_item?: {
    id: string;
    name: string;
    image_url?: string;
  };
}
