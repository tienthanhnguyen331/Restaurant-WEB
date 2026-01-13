import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { waiterApi } from '../services/waiterApi';
import { OrderCard } from '../components/OrderCard';
import type { Order } from '../../order/types'; // Ensure we are using the canonical Order type
import { orderApi } from '../../order/services/order-api';
import { OrderDetailModal } from '../../order/components/OrderDetailModal';

export const WaiterDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [historyOrders, setHistoryOrders] = useState<Order[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleAuthError = (error: any) => {
    if (error && error.response && (error.response.status === 401 || error.response.status === 403)) {
      alert('Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.');
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
  };

  // Hàm lấy danh sách đơn đang xử lý, dùng useCallback để tránh tạo lại không cần thiết
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await waiterApi.getPendingOrders();
      setOrders(data);
    } catch (error) {
      console.error('Lỗi khi tải đơn hàng:', error);
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    // Kết nối socket để lắng nghe sự kiện đồng bộ đơn hàng
    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3000';
    const newSocket = io(`${wsUrl}/waiter`, { path: '/socket.io' });

    // Khi có đơn mới hoặc trạng thái đơn thay đổi, luôn gọi lại fetchOrders để đồng bộ dữ liệu
    newSocket.on('newOrder', fetchOrders);
    newSocket.on('orderReady', fetchOrders);
    newSocket.on('order_status_update', fetchOrders);

    return () => {
      newSocket.close();
    };
  }, [fetchOrders]);

  // Hàm này đã được thay bằng fetchOrders ở trên

  const loadOrderHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await orderApi.getAll();
      setHistoryOrders(data);
    } catch (error) {
      setHistoryOrders([]);
      handleAuthError(error);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Sau mỗi thao tác, luôn gọi lại fetchOrders để đảm bảo đồng bộ dữ liệu
  const handleAcceptOrder = async (orderId: string) => {
    try {
      await waiterApi.acceptOrder(orderId);
      fetchOrders();
    } catch (error) {
      console.error('Lỗi khi xác nhận đơn:', error);
      handleAuthError(error);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      await waiterApi.rejectOrder(orderId);
      fetchOrders();
    } catch (error) {
      console.error('Lỗi khi từ chối đơn:', error);
      handleAuthError(error);
    }
  };

  const handleSendToKitchen = async (orderId: string) => {
    try {
      await waiterApi.sendToKitchen(orderId);
      fetchOrders();
    } catch (error) {
      console.error('Lỗi khi gửi bếp:', error);
      handleAuthError(error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Waiter Dashboard</h1>
      <div className="mb-4 flex gap-4">
        <button
          className={`px-4 py-2 rounded ${!showHistory ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setShowHistory(false)}
        >
          Đơn đang xử lý
        </button>
        <button
          className={`px-4 py-2 rounded ${showHistory ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => {
            setShowHistory(true);
            if (historyOrders.length === 0) loadOrderHistory();
          }}
        >
          Lịch sử đơn hàng
        </button>
      </div>
      {!showHistory ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onAccept={handleAcceptOrder}
                onReject={handleRejectOrder}
                onSendToKitchen={handleSendToKitchen}
              />
            ))}
          </div>
          {orders.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              No pending orders
            </div>
          )}
        </>
      ) : (
        <div>
          {historyLoading ? (
            <div>Đang tải lịch sử đơn hàng...</div>
          ) : historyOrders.length === 0 ? (
            <div>Chưa có đơn hàng nào.</div>
          ) : (
            <div className="space-y-4">
              {historyOrders.map(order => (
                <div
                  key={order.id}
                  className="border p-4 rounded shadow hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex justify-between">
                    <span className="font-bold">Đơn #{order.id.slice(0, 8)}</span>
                    <span className={`px-2 py-1 rounded text-sm font-bold uppercase ${
                      order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      order.status === 'PENDING' ? 'bg-gray-100 text-gray-800' :
                      order.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      order.status === 'PREPARING' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'READY' ? 'bg-indigo-100 text-indigo-800' :
                      order.status === 'SERVED' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">Bàn: {order.table_id} | Tổng: {order.total_amount}</div>
                  <div className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
          {selectedOrder && (
            <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
          )}
        </div>
      )}
    </div>
  );
};
