import type { Order } from "../../order/types";

interface OrderCardProps {
  order: Order;
  onAccept: (orderId: string) => void;
  onReject: (orderId: string) => void;
  onSendToKitchen: (orderId: string) => void;
  onServe?: (orderId: string) => void;
  onComplete?: (orderId: string) => void;
}

import { useState, useEffect } from "react";

export const OrderCard = ({ order, onAccept, onReject, onSendToKitchen, onServe, onComplete }: OrderCardProps) => {
  const [localStatus, setLocalStatus] = useState(order.status);

  // Keep localStatus in sync if parent updates order.status (socket updates / re-fetch)
  useEffect(() => {
    setLocalStatus(order.status);
  }, [order.status]);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED': return 'bg-blue-100 text-blue-800';
      case 'PREPARING': return 'bg-purple-100 text-purple-800';
      case 'READY': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">Table {order.table_id}</h3>
          <p className="text-sm text-gray-600">
            {new Date(order.created_at).toLocaleTimeString()}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(localStatus)}`}>
          {localStatus}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600">Items: {order.items?.length || 0}</p>
        <p className="text-lg font-bold">${order.total_amount}</p>
      </div>

      <div className="flex gap-2">
        {localStatus === 'PENDING' && (
          <>
            <button
              onClick={() => onAccept(order.id)}
              className="flex-1 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
            >
              Accept
            </button>
            <button
              onClick={() => onReject(order.id)}
              className="flex-1 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
            >
              Reject
            </button>
          </>
        )}
        {localStatus === 'ACCEPTED' && (
          <button
            onClick={() => onSendToKitchen(order.id)}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Send to Kitchen
          </button>
        )}
        {/* PREPARING: không hiện nút serve */}
        {localStatus === 'READY' && (
          <button
            onClick={() => onServe && onServe(order.id)}
            className="w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600"
          >
            Serve
          </button>
        )}
        {localStatus === 'SERVED' && (
          <button
            onClick={() => onComplete && onComplete(order.id)}
            className="w-full bg-gray-700 text-white py-2 px-4 rounded hover:bg-gray-900"
          >
            Complete
          </button>
        )}
      </div>
    </div>
  );
};
