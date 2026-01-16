import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useOrderSocket } from '../../order/hooks/useOrderSocket'; 
import { orderApi } from '../../order/services/order-api';
import { getCurrentUser } from '../../auth/hooks/useAuth';
// Lưu ý: Đảm bảo import đúng đường dẫn type của bạn
import type { GuestOrder } from '../types/guest-order';

// 1. Định nghĩa lại Interface cho Item hiển thị (đã gộp)
interface GuestOrderItem {
  id: string; // menu_item_id
  name: string;
  quantity: number;
  unitPrice: number;
  totalLinePrice: number; // = quantity * unitPrice
}

// 2. Hàm helper để gộp các món giống nhau (xử lý logic outside component cho sạch)
const aggregateItems = (rawItems: any[]): GuestOrderItem[] => {
  const groupedMap = rawItems.reduce((acc: any, item: any) => {
    // Dùng menu_item_id làm key để gom nhóm
    const itemId = item.menu_item_id; 

    if (!acc[itemId]) {
      acc[itemId] = {
        id: itemId,
        name: item.menuItem?.name || `Món #${itemId.toString().slice(0, 4)}`,
        quantity: 0,
        unitPrice: item.price,
        totalLinePrice: 0
      };
    }

    // Cộng dồn số lượng và thành tiền
    acc[itemId].quantity += item.quantity;
    acc[itemId].totalLinePrice += (item.price * item.quantity);

    return acc;
  }, {});

  return Object.values(groupedMap);
};

// Hàm gửi request_invoice vào namespace /waiter
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
function emitRequestInvoice(orderId: string, tableId: string | number) {
  const waiterSocket = io(`${SOCKET_URL}/waiter`);
  waiterSocket.on('connect', () => {
    waiterSocket.emit('request_invoice', { orderId, tableId });
    waiterSocket.close();
  });
}

export const GuestOrderStatus = ({ viewMode = 'history' }: { viewMode?: 'history' | 'tracking' }) => {
  const [orders, setOrders] = useState<GuestOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL'); // State for the filter
  const { socket } = useOrderSocket();

  // 3. Fetch dữ liệu từ API và Gộp món ngay lập tức
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const currentUser = getCurrentUser();
        const data = currentUser ? await orderApi.getMyOrders() : await orderApi.getAll();
        
        const mappedOrders: GuestOrder[] = data.map((o: any) => ({
          id: o.id,
          created_at: o.created_at,
          total_amount: o.total_amount,
          status: o.status,
          payment: o.payments?.length > 0 
            ? { 
                status: o.payments[o.payments.length - 1].status, 
                method: o.payments[o.payments.length - 1].method 
              }
            : undefined,
          items: aggregateItems(o.items) as any,
          table_id: o.table_id ?? o.tableId ?? 0,
        }));

        setOrders(mappedOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      } catch (err) {
        console.error("Failed to load orders", err);
      }
    };

    fetchOrders();
  }, []);

  // 4. Lắng nghe Real-time (Status & Payment)
  useEffect(() => {
    if (!socket) return;
    
    socket.on('order_status_update', ({ orderId, status }) => {
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: status } : o
      ));
    });

    socket.on('payment_status_update', ({ orderId, status }) => {
       setOrders(prev => prev.map(o => 
        o.id === orderId 
          ? { 
              ...o, 
              payment: o.payment 
                ? { ...o.payment, status } 
                : { status: status as any, method: 'cash' } 
            } 
          : o
      ));
    });

    return () => {
      socket.off('order_status_update');
      socket.off('payment_status_update');
    }
  }, [socket]);

  // --- UI Helpers ---
  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    
    if (viewMode === 'tracking') {
       return (
        <span className="px-2 py-0.5 rounded text-xs font-bold border bg-blue-50 text-blue-700 border-blue-200 uppercase">
            {s}
        </span>
       );
    }

    const colors: Record<string, string> = {
      PENDING: 'bg-gray-200 text-gray-700 border-gray-300',
      ACCEPTED: 'bg-blue-100 text-blue-800 border-blue-200',
      REJECTED: 'bg-red-100 text-red-700 border-red-200',
      PREPARING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      READY: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      SERVED: 'bg-purple-100 text-purple-700 border-purple-200',
      COMPLETED: 'bg-green-100 text-green-700 border-green-200',
      CANCELLED: 'bg-red-100 text-red-700 border-red-200'
    };
    
    const labels: Record<string, string> = {
      PENDING: 'Đang gửi',
      ACCEPTED: 'Đã nhận đơn',
      REJECTED: 'Từ chối',
      PREPARING: 'Đang nấu',
      READY: 'Món đã xong',
      SERVED: 'Đã phục vụ',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã hủy'
    };

    return (
        <span className={`px-2 py-0.5 rounded text-xs font-bold border ${colors[s] || 'bg-gray-100'}`}>
            {labels[s] || s}
        </span>
    );
  };

  const getPaymentIcon = (status: string) => {
      if (status === 'success' || status === 'completed') return <span title="Đã thanh toán">✅</span>;
      if (status === 'pending') return <span title="Chờ thanh toán">⏳</span>;
      if (status === 'failed') return <span title="Thất bại">❌</span>;
      return <span title="Chưa thanh toán">💰</span>;
  }

  const getProgressStep = (status: string) => {
      const s = status.toUpperCase();
      switch (s) {
        case 'PENDING': return 1;
        case 'ACCEPTED': return 2;
        case 'PREPARING': return 3;
        case 'READY': return 4;
        case 'SERVED': return 5;
        case 'COMPLETED': return 6;
        default: return 0;
      }
  };

  const steps = [
      { step: 1, label: 'Pending' },
      { step: 2, label: 'Accepted' },
      { step: 3, label: 'Preparing' },
      { step: 4, label: 'Ready' },
      { step: 5, label: 'Served' },
      { step: 6, label: 'Completed' }
  ];

  const filteredOrders = viewMode === 'history'
    ? orders.filter(o => statusFilter === 'ALL' || o.status.toUpperCase() === statusFilter)
    : orders;

  const displayOrders = viewMode === 'tracking' 
    ? filteredOrders.slice(0, 1)
    : filteredOrders;

  const orderStatuses = ['ALL', 'PENDING', 'ACCEPTED', 'REJECTED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED'];

  return (
    <div className="p-4 space-y-4 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">
            {viewMode === 'tracking' ? 'Theo dõi đơn hàng' : 'Lịch sử đơn hàng'}
        </h2>
        {viewMode === 'history' && (
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border rounded-md"
          >
            {orderStatuses.map(status => (
              <option key={status} value={status}>{status === 'ALL' ? 'Tất cả' : status.charAt(0) + status.slice(1).toLowerCase()}</option>
            ))}
          </select>
        )}
      </div>
        
        {displayOrders.length === 0 && (
            <div className="text-center text-gray-500 py-8">
                {viewMode === 'tracking' ? 'Không có đơn đang xử lý.' : 'Chưa có đơn hàng nào trong lịch sử.'}
            </div>
        )}

        {displayOrders.map(order => {
            const currentStep = getProgressStep(order.status);
            const isCancelled = ['REJECTED', 'CANCELLED'].includes(order.status.toUpperCase());

            return (
            <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 transition-all hover:shadow-md">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-700">#{order.id.slice(0, 5)}</span>
                    <span className="text-xs uppercase font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5">
                      Bàn {order.table_id}
                    </span>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                {viewMode === 'tracking' && !isCancelled && (
                <div className="mb-6 pl-2">
                    <div className="relative pt-1 pb-1">
                        <div className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-gray-200" />
                        <div 
                           className="absolute left-[5px] top-2 w-0.5 bg-blue-500 transition-all duration-700 ease-out" 
                           style={{ 
                               height: `calc(${Math.max(0, Math.min(100, (currentStep - 1) / (steps.length - 1) * 100))}% - 0px)`
                           }}
                        />

                        <div className="space-y-8">
                            {steps.map((s) => {
                                const isCompleted = s.step <= currentStep;
                                const isCurrent = s.step === currentStep;

                                return (
                                <div key={s.step} className="relative flex items-center pl-8">
                                    <div className={`absolute left-0 w-3 h-3 rounded-full border-2 z-10 transition-all duration-300 bg-white ${
                                        isCompleted 
                                        ? 'border-blue-500 bg-blue-500 scale-125' 
                                        : 'border-gray-300'
                                    } ${isCurrent ? 'ring-4 ring-blue-100' : ''}`} />
                                    
                                    <span className={`text-sm font-medium transition-colors ${
                                        isCompleted ? 'text-gray-800' : 'text-gray-400'
                                    } ${isCurrent ? 'text-blue-700 font-bold' : ''}`}>
                                        {s.label}
                                    </span>
                                </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                )}
                
                <div className="flex justify-between text-xs text-gray-500 mb-4">
                    <span>{new Date(order.created_at).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</span>
                    <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded">
                        <span className="text-xs">{getPaymentIcon(order.payment?.status || 'pending')}</span>
                        <span className="uppercase font-semibold text-gray-600">
                            {order.payment?.method === 'momo' ? 'MoMo' : 'Tiền mặt'}
                        </span>
                    </div>
                </div>

                <div className="space-y-3">
                    {(order.items as unknown as GuestOrderItem[]).map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start group">
                            <div className="flex-1 pr-2">
                                <div className="font-medium text-gray-800 text-sm">
                                    {item.name}
                                </div>
                                <div className="text-xs text-gray-400 mt-0.5">
                                    {item.quantity} x {item.unitPrice.toLocaleString()}đ
                                </div>
                            </div>

                            <div className="text-right">
                                <span className="font-semibold text-gray-900 text-sm block">
                                    {item.totalLinePrice.toLocaleString()}đ
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-dashed border-gray-300">
                    <span className="font-medium text-gray-600">Tổng cộng</span>
                    <span className="text-blue-600 text-lg font-bold">
                        {order.total_amount.toLocaleString()}đ
                    </span>
                </div>

                {/* Nút Xuất hóa đơn cho khách */}
                {viewMode === 'tracking' && order.status.toUpperCase() === 'SERVED' && (
                  <div className="mt-4 flex justify-end">
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition"
                      onClick={() => {
                        console.log('[GUEST] Emit request_invoice', { orderId: order.id, tableId: order.table_id });
                        emitRequestInvoice(order.id, order.table_id);
                        alert('Đã gửi yêu cầu xuất hóa đơn cho nhân viên!');
                      }}
                    >
                      Xuất hóa đơn
                    </button>
                  </div>
                )}
            </div>
          );
        })}
    </div>
  );
};