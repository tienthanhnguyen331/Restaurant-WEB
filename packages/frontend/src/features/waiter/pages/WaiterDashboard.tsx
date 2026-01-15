import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { waiterApi } from '../services/waiterApi';
import { OrderCard } from '../components/OrderCard';
import type { Order } from '../../order/types';
import { orderApi } from '../../order/services/order-api';
import { OrderDetailModal } from '../../order/components/OrderDetailModal';

export const WaiterDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [showHistory, setShowHistory] = useState(false);
  const [historyOrders, setHistoryOrders] = useState<Order[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: '',
  });

  /* ===================== Utils ===================== */

  const showToast = (message: string, ms = 3000) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), ms);
  };

  const handleAuthError = (error: any) => {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      localStorage.removeItem('access_token_WAITER');
      window.location.href = '/login';
    }
  };

  /* ===================== Fetch ===================== */

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await waiterApi.getPendingOrders();
      setOrders(data);
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOrderHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await orderApi.getAll();
      setHistoryOrders(data);
    } catch (error) {
      handleAuthError(error);
    } finally {
      setHistoryLoading(false);
    }
  };

  /* ===================== Socket ===================== */

  useEffect(() => {
    fetchOrders();

    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3000';
    const socket = io(`${wsUrl}/waiter`, { path: '/socket.io' });

    socket.on('newOrder', fetchOrders);
    socket.on('order_status_update', fetchOrders);

    // Lắng nghe yêu cầu xuất hóa đơn từ khách
    socket.on('request_invoice', ({ orderId, tableId }) => {
      console.log('[WAITER] Nhận request_invoice:', { orderId, tableId });
      alert(`Bàn ${tableId} vừa yêu cầu xuất hóa đơn!`);
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchOrders]);

  /* ===================== Actions ===================== */

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await waiterApi.acceptOrder(orderId);
      fetchOrders();
    } catch (error) {
      handleAuthError(error);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      await waiterApi.rejectOrder(orderId);
      fetchOrders();
    } catch (error) {
      handleAuthError(error);
    }
  };

  const handleSendToKitchen = async (orderId: string) => {
    try {
      await waiterApi.sendToKitchen(orderId);
      fetchOrders();
    } catch (error) {
      handleAuthError(error);
    }
  };

  const handleServeOrder = async (orderId: string) => {
    try {
      await waiterApi.serveOrder(orderId);
      fetchOrders();
    } catch (error) {
      handleAuthError(error);
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    try {
      await waiterApi.completeOrder(orderId);
      setOrders(prev => prev.filter(o => o.id !== orderId));
      showToast('Đơn hàng đã hoàn thành');
    } catch (error) {
      handleAuthError(error);
    }
  };

  /* ===================== Render ===================== */

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      {/* Toast */}
      {toast.show && (
        <div className="fixed top-6 right-6 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50">
          {toast.message}
        </div>
      )}

      <h1 className="text-3xl font-bold mb-6">Waiter Dashboard</h1>

      {/* Tabs */}
      <div className="mb-4 flex gap-4">
        <button
          className={`px-4 py-2 rounded ${!showHistory ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          onClick={() => setShowHistory(false)}
        >
          Đơn đang xử lý
        </button>
        <button
          className={`px-4 py-2 rounded ${showHistory ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          onClick={() => {
            setShowHistory(true);
            if (historyOrders.length === 0) loadOrderHistory();
          }}
        >
          Lịch sử đơn hàng
        </button>
      </div>

      {/* ================= TAB CONTENT ================= */}

      {!showHistory ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders
              .filter(o => o.status !== 'COMPLETED')
              .map(order => {
                return (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onAccept={handleAcceptOrder}
                    onReject={handleRejectOrder}
                    onSendToKitchen={handleSendToKitchen}
                    onServe={handleServeOrder}
                    onComplete={handleCompleteOrder}
                    onShowDetail={setSelectedOrder}
                  />
                );
              })}
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
            <div>Đang tải lịch sử...</div>
          ) : historyOrders.length === 0 ? (
            <div>Chưa có đơn hàng.</div>
          ) : (
            <div className="space-y-4">
              {historyOrders.map(order => (
                <div
                  key={order.id}
                  className="border p-4 rounded shadow hover:shadow-lg cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex justify-between">
                    <span className="font-bold">Đơn #{order.id.slice(0, 8)}</span>
                    <span className="font-bold uppercase">{order.status}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Bàn: {order.table_id} | Tổng: {order.total_amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ✅ MODAL RENDER ĐỘC LẬP – FIX 100% */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};
