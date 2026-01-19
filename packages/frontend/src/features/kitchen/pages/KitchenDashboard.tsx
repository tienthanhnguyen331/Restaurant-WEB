import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { kitchenApi } from '../services/kitchenApi';
import { KitchenOrderCard } from '../components/KitchenOrderCard';
import type { Order } from '../types';

import { KitchenOrderDetailModal } from '../components/KitchenOrderDetailModal';

export const KitchenDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();

    // Connect to WebSocket
    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3000';
    const newSocket = io(`${wsUrl}/kitchen`, { path: '/socket.io' });

    newSocket.on('orderToKitchen', (order: Order) => {
      setOrders(prev => [order, ...prev]);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const handleAuthError = (error: any) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      alert('Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.');
      localStorage.removeItem('access_token_KITCHEN');
      window.location.href = '/login';
    }
  };

  const loadOrders = async () => {
    try {
      const data = await kitchenApi.getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetPreparing = async (orderId: string) => {
    try {
      await kitchenApi.setPreparing(orderId);
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: 'PREPARING' } : order
        )
      );
    } catch (error) {
      console.error('Failed to set preparing:', error);
      handleAuthError(error);
    }
  };

  const handleSetReady = async (orderId: string) => {
    try {
      await kitchenApi.setReady(orderId);
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: 'READY' } : order
        )
      );
    } catch (error) {
      console.error('Failed to set ready:', error);
      handleAuthError(error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Kitchen Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map(order => (
          <KitchenOrderCard
            key={order.id}
            order={order}
            onSetPreparing={handleSetPreparing}
            onSetReady={handleSetReady}
            onShowDetail={setSelectedOrder}
          />
        ))}
      </div>
      {orders.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No orders in kitchen
        </div>
      )}

      {selectedOrder && (
        <KitchenOrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};
