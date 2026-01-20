import { X } from 'lucide-react';
import type { Order } from '../types';

interface KitchenOrderDetailModalProps {
    order: Order;
    onClose: () => void;
}

export const KitchenOrderDetailModal = ({ order, onClose }: KitchenOrderDetailModalProps) => {
    // Consolidate items
    const consolidatedItems = order.items.reduce((acc: any[], item) => {
        const existingItem = acc.find(
            (i) => i.menu_item_id === item.menu_item_id && i.notes === item.notes
        );
        if (existingItem) {
            existingItem.quantity += item.quantity;
            // Merge price if needed, though for Kitchen quantity is key
        } else {
            acc.push({ ...item });
        }
        return acc;
    }, []);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Chi tiết đơn hàng #{order.id.slice(0, 8)}</h2>
                    <button onClick={onClose}><X className="w-6 h-6" /></button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="bg-gray-50 p-4 rounded grid grid-cols-2 gap-2 text-sm">
                        <div><span className="font-semibold">Bàn:</span> {order.table_id}</div>
                        <div>
                            <span className="font-semibold">Trạng thái:</span>
                            <span className="uppercase font-bold ml-1 text-blue-600">{order.status}</span>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">Danh sách món:</h3>
                        <div className="space-y-2">
                            {consolidatedItems.map((item) => (
                                <div key={item.id || `${item.menu_item_id}-${item.notes}`} className="flex justify-between border-b pb-2 mb-2">
                                    <div>
                                        <div className="font-medium text-lg">
                                            {item.menuItem?.name || `Món #${item.menu_item_id}`}
                                        </div>
                                        <div className="text-sm text-gray-600 font-bold">
                                            Số lượng: <span className="text-red-600 text-lg">{item.quantity}</span>
                                        </div>
                                        {item.notes && (
                                            <div className="text-sm text-amber-600 italic">
                                                Ghi chú: {item.notes}
                                            </div>
                                        )}
                                    </div>
                                    {/* Kitchen might not care about price, but preserving for consistency if needed */}
                                    {/* <div className="font-semibold">{formatCurrency(Number(item.price) * item.quantity)}</div> */}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t flex justify-end">
                        <button
                            onClick={onClose}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
