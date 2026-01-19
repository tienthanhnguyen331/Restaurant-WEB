import { useState } from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import type { GuestMenuItem } from './GuestMenuPage';
import ModifierSelector from './ModifierSelector';
import { useCart } from '../../contexts/CartContext';

interface MenuItemCardProps {
  item: GuestMenuItem;
  tableInfo?: { tableId: string; tableNumber: string } | null;
}

export default function MenuItemCard({ item, tableInfo }: MenuItemCardProps) {
  const { addItem } = useCart();
  const [showModifiers, setShowModifiers] = useState(false);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string[]>>({});
  const [isExpanded, setIsExpanded] = useState(false);

  const calculateTotalPrice = (): number => {
    let total = item.price;

    // Add price adjustments from selected modifiers
    Object.entries(selectedModifiers).forEach(([groupId, optionIds]) => {
      const group = item.modifierGroups.find(g => g.id === groupId);
      if (group) {
        optionIds.forEach(optionId => {
          const option = group.options.find(o => o.id === optionId);
          if (option) {
            total += option.priceAdjustment;
          }
        });
      }
    });

    return total;
  };

  const handleAddToCart = () => {
    // Validate required modifier groups
    const missingRequired = item.modifierGroups
      .filter(g => g.isRequired)
      .filter(g => !selectedModifiers[g.id] || selectedModifiers[g.id].length === 0);

    if (missingRequired.length > 0) {
      alert(`Please select options for: ${missingRequired.map(g => g.name).join(', ')}`);
      return;
    }

    // Add to cart using context
    addItem({
      menuItemId: item.id,
      menuItemName: item.name,
      basePrice: item.price,
      quantity: 1,
      selectedModifiers,
      modifierGroups: item.modifierGroups.map(g => ({
        id: g.id,
        name: g.name,
        options: g.options.map(o => ({
          id: o.id,
          name: o.name,
          priceAdjustment: o.priceAdjustment,
        })),
      })),
      tableId: tableInfo?.tableNumber ? parseInt(tableInfo.tableNumber, 10) : undefined,
    });

    // Reset state and show success
    setSelectedModifiers({});
    setShowModifiers(false);

  };

  const isSoldOut = item.status === 'sold_out';
  const isUnavailable = item.status === 'unavailable';

  // Helper to resolve image URL (handles relative and absolute)
  const getImageUrl = (url?: string) => {
    if (!url) return undefined;
    if (/^https?:\/\//i.test(url)) return url;
    // Use VITE_BACKEND_URL if set, fallback to production
    const backend = import.meta.env.VITE_BACKEND_URL || 'https://restaurant-web-five-wine.vercel.app';
    return `${backend}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative aspect-[4/3] w-full bg-gray-200">
        {item.primaryPhotoUrl ? (
          <img
            src={getImageUrl(item.primaryPhotoUrl)}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No Image
          </div>
        )}

        {/* Status Badges */}
        {item.isChefRecommended && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
            Chef's Pick
          </div>
        )}
        {isSoldOut && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
            Sold Out
          </div>
        )}
        {isUnavailable && (
          <div className="absolute top-2 right-2 bg-gray-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
            Unavailable
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h3>

        {item.description && (
          <div className="mb-3">
            <p className={`text-sm text-gray-600 ${isExpanded ? '' : 'line-clamp-2'}`}>
              {item.description}
            </p>
            {item.description.length > 60 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-1 focus:outline-none"
              >
                {isExpanded ? 'Thu gọn' : 'Xem thêm'}
              </button>
            )}
          </div>
        )}

        <div className="mb-3">
          <Link to={`/reviews?menu_item_id=${item.id}`} className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline mb-2">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span>Xem đánh giá</span>
          </Link>
          <div className="font-bold text-blue-600 border border-blue-200 bg-blue-50 px-3 py-1 rounded-lg">
            {formatCurrency(calculateTotalPrice())}
          </div>
        </div>

        {/* Modifier Selector (when expanded) */}
        {showModifiers && (
          <div className="mb-4 border-t pt-3">
            <ModifierSelector
              modifierGroups={item.modifierGroups}
              selectedModifiers={selectedModifiers}
              onModifierChange={setSelectedModifiers}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {item.modifierGroups.length > 0 && (
            <button
              onClick={() => setShowModifiers(!showModifiers)}
              className="flex-1 border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-50 transition-colors text-sm font-medium"
            >
              {showModifiers ? 'Hide Options' : 'Customize'}
            </button>
          )}
          <button
            onClick={handleAddToCart}
            disabled={isSoldOut || isUnavailable}
            className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-colors ${isSoldOut || isUnavailable
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
          >
            {isSoldOut ? 'Sold Out' : isUnavailable ? 'Unavailable' : 'Chọn'}
          </button>
        </div>
      </div>
    </div>
  );
}
