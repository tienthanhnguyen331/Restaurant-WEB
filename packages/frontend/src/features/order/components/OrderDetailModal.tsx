import React from 'react';
import { useOrderSocket } from '../hooks/useOrderSocket';
import { orderApi } from '../services/order-api';
import type { MenuItemDropdown } from '../../../services/menuItemApi';
import { X } from 'lucide-react';
import type { Order } from '../types';
import type { MenuCategory } from '@shared/types/menu';

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose }) => {
  const [menuItems, setMenuItems] = React.useState<MenuItemDropdown[]>([]);
  const [categories, setCategories] = React.useState<MenuCategory[]>([]);
  const [currentOrder, setCurrentOrder] = React.useState<Order>(order);
  const { socket } = useOrderSocket();

  React.useEffect(() => {
    (async () => {
      const menuRes = await import('../../../../src/services/menuItemApi');
      const catRes = await import('../../../../src/services/categoryApi');
      const menuList = await menuRes.menuItemApi.getMenuItems();
      const catList = await catRes.categoryApi.getAll({});
      setMenuItems(menuList);
      setCategories(catList.data || catList);
    })();
  }, []);

  // Refetch order when backend emits status update
  React.useEffect(() => {
    if (!socket) return;
    const handleStatusUpdate = async ({ orderId }: { orderId: string }) => {
      if (orderId === currentOrder.id) {
        try {
          const updatedOrder = await orderApi.getById(orderId);
          setCurrentOrder(updatedOrder);
        } catch (e) {
          // Optionally handle error
        }
      }
    };
    socket.on('order_status_update', handleStatusUpdate);
    return () => {
      socket.off('order_status_update', handleStatusUpdate);
    };
  }, [socket, currentOrder.id]);

  // Sync with parent order prop if it changes
  React.useEffect(() => {
    setCurrentOrder(order);
  }, [order]);

  const getMenuInfo = (menu_item_id: number | string) => {
    const item = menuItems.find((m) => String(m.id) === String(menu_item_id));
    if (!item) return { name: `#${menu_item_id}`, categoryId: '', categoryName: '' };
    const category = categories.find((c) => String(c.id) === String(item.categoryId));
    return {
      name: item.name,
      categoryId: item.categoryId,
      categoryName: category ? category.name : '',
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Chi tiết đơn hàng #{currentOrder.id.slice(0, 8)}</h2>
          <button onClick={onClose}><X className="w-6 h-6" /></button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-50 p-4 rounded grid grid-cols-2 gap-2 text-sm">
             <div><span className="font-semibold">Bàn:</span> {currentOrder.table_id}</div>
             <div><span className="font-semibold">Trạng thái:</span> <span className="uppercase font-bold text-blue-600">{currentOrder.status}</span></div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Món đã đặt:</h3>
            {currentOrder.items.map((item) => {
              const info = getMenuInfo(item.menu_item_id);
              return (
                <div key={item.id} className="flex justify-between border-b pb-2 mb-2">
                  <div>
                    <div className="font-medium">{info.name}</div>
                    <div className="text-sm text-gray-600">SL: {item.quantity}</div>
                    <div className="text-xs text-gray-400">Category: {info.categoryName}</div>
                  </div>
                  <div className="font-semibold">{(Number(item.price) * item.quantity).toLocaleString()}đ</div>
                </div>
              );
            })}
          </div>

          <div className="border-t pt-4 flex justify-between text-lg font-bold">
            <span>Tổng cộng:</span>
            <span className="text-blue-600">{Number(currentOrder.total_amount).toLocaleString()}đ</span>
          </div>
        </div>
      </div>
    </div>
  );
};