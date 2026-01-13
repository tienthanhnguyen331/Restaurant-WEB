export interface Order {
  id: string;
  table_id: number;
  waiter_id?: string;
  kitchen_id?: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: number;
  quantity: number;
  price: number;
  notes?: string;
}
