import type { Order } from "../types.ts";

interface KitchenOrderCardProps {
  order: Order;
  onSetPreparing: (orderId: string) => void;
  onSetReady: (orderId: string) => void;
}

export const KitchenOrderCard = ({ order, onSetPreparing, onSetReady }: KitchenOrderCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'bg-yellow-100 text-yellow-800';
      case 'PREPARING': return 'bg-orange-100 text-orange-800';
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
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600">Items: {order.items?.length || 0}</p>
        <p className="text-lg font-bold">${order.total_amount}</p>
      </div>

      <div className="flex gap-2">
        {order.status === 'ACCEPTED' && (
          <button
            onClick={() => onSetPreparing(order.id)}
            className="w-full bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600"
          >
            Start Preparing
          </button>
        )}
        {order.status === 'PREPARING' && (
          <button
            onClick={() => onSetReady(order.id)}
            className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
          >
            Mark as Ready
          </button>
        )}
      </div>
    </div>
  );
};
