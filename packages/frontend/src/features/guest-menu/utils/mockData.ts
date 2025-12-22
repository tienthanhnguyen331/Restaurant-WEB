import type { GuestMenuResponse, MenuFiltersState, GuestMenuCategory } from '../GuestMenuPage';
import { mockMenuItems } from '../../customer-view/components/MockMenu';

/**
 * Build a GuestMenuResponse from the MockMenu data with basic filters and paging.
 */
export function buildMockGuestMenu(filters: MenuFiltersState, page: number, limit = 20): GuestMenuResponse {
  // Map categories
  const categories = mockMenuItems.map((cat) => ({
    id: cat.id,
    name: cat.category,
    description: undefined,
    items: cat.items.map((item, idx) => {
      const itemId = `${cat.id}-${idx + 1}`;
      
      // Add modifiers to specific items (demo data)
      let modifierGroups: any[] = [];
      
      // Thêm modifiers cho món Phở (id '2-2')
      if (item.name.toLowerCase().includes('phở')) {
        modifierGroups = [
          {
            id: 'mod-size-pho',
            name: 'Kích cỡ',
            selectionType: 'single',
            isRequired: true,
            displayOrder: 1,
            options: [
              { id: 'size-s', name: 'Nhỏ', priceAdjustment: 0 },
              { id: 'size-m', name: 'Vừa', priceAdjustment: 10000 },
              { id: 'size-l', name: 'Lớn', priceAdjustment: 20000 }
            ]
          },
          {
            id: 'mod-meat-pho',
            name: 'Thịt bò',
            selectionType: 'multiple',
            isRequired: false,
            minSelections: 0,
            maxSelections: 3,
            displayOrder: 2,
            options: [
              { id: 'meat-tai', name: 'Tái', priceAdjustment: 15000 },
              { id: 'meat-nam', name: 'Nạm', priceAdjustment: 12000 },
              { id: 'meat-gau', name: 'Gầu', priceAdjustment: 18000 },
              { id: 'meat-vien', name: 'Bò viên', priceAdjustment: 10000 }
            ]
          },
          {
            id: 'mod-veggies-pho',
            name: 'Rau ăn kèm',
            selectionType: 'multiple',
            isRequired: false,
            displayOrder: 3,
            options: [
              { id: 'veg-no-onion', name: 'Không hành', priceAdjustment: 0 },
              { id: 'veg-extra', name: 'Thêm rau', priceAdjustment: 5000 },
              { id: 'veg-lemon', name: 'Thêm chanh', priceAdjustment: 2000 }
            ]
          }
        ];
      }
      // Thêm modifiers cho món Bún bò Huế
      else if (item.name.toLowerCase().includes('bún bò')) {
        modifierGroups = [
          {
            id: 'mod-size-bun',
            name: 'Kích cỡ',
            selectionType: 'single',
            isRequired: true,
            options: [
              { id: 'size-s-bun', name: 'Nhỏ', priceAdjustment: 0 },
              { id: 'size-m-bun', name: 'Vừa', priceAdjustment: 10000 },
              { id: 'size-l-bun', name: 'Lớn', priceAdjustment: 15000 }
            ]
          },
          {
            id: 'mod-spicy-bun',
            name: 'Độ cay',
            selectionType: 'single',
            isRequired: false,
            options: [
              { id: 'spicy-mild', name: 'Ít cay', priceAdjustment: 0 },
              { id: 'spicy-medium', name: 'Vừa cay', priceAdjustment: 0 },
              { id: 'spicy-hot', name: 'Cay nồng', priceAdjustment: 0 }
            ]
          }
        ];
      }
      // Thêm modifiers cho đồ uống
      else if (cat.category === 'Đồ uống') {
        modifierGroups = [
          {
            id: `mod-ice-${itemId}`,
            name: 'Đá',
            selectionType: 'single',
            isRequired: true,
            options: [
              { id: 'ice-normal', name: 'Đá bình thường', priceAdjustment: 0 },
              { id: 'ice-less', name: 'Ít đá', priceAdjustment: 0 },
              { id: 'ice-no', name: 'Không đá', priceAdjustment: 0 }
            ]
          },
          {
            id: `mod-sweet-${itemId}`,
            name: 'Đường',
            selectionType: 'single',
            isRequired: false,
            options: [
              { id: 'sweet-normal', name: '100% đường', priceAdjustment: 0 },
              { id: 'sweet-less', name: '50% đường', priceAdjustment: 0 },
              { id: 'sweet-no', name: 'Không đường', priceAdjustment: 0 }
            ]
          }
        ];
      }
      
      return {
        id: itemId,
        name: item.name,
        description: item.description,
        price: item.price,
        primaryPhotoUrl: undefined,
        status: 'available' as const,
        isChefRecommended: item.name.toLowerCase().includes('phở bò') || item.name.toLowerCase().includes('bún bò'),
        prepTimeMinutes: cat.category === 'Món chính' ? 15 : undefined,
        modifierGroups,
      };
    }),
  }));

  // Apply filters
  const q = filters.q?.trim().toLowerCase();
  const categoryId = filters.categoryId?.trim();

  let filtered = categories;

  if (categoryId) {
    filtered = filtered.filter((c) => c.id === categoryId);
  }

  if (q) {
    filtered = filtered.map((c) => ({
      ...c,
      items: c.items.filter((i) => i.name.toLowerCase().includes(q)),
    })).filter((c) => c.items.length > 0);
  }

  // Flatten items count for total
  const totalItems = filtered.reduce((sum, c) => sum + c.items.length, 0);

  // Paging per overall list (simple): slice items inside each category until reaching page window
  const start = (page - 1) * limit;
  const end = start + limit;
  const flat = filtered.flatMap((c) => c.items.map((i) => ({ category: c, item: i })));
  const window = flat.slice(start, end);

  // Re-group into categories for UI
  const groupedMap = new Map<string, { id: string; name: string; description?: string; items: typeof filtered[number]['items'] }>();
  window.forEach(({ category, item }) => {
    if (!groupedMap.has(category.id)) {
      groupedMap.set(category.id, { id: category.id, name: category.name, description: category.description, items: [] });
    }
    groupedMap.get(category.id)!.items.push(item);
  });

  const pagedCategories = Array.from(groupedMap.values());

  return {
    data: {
      categories: pagedCategories,
    },
    page,
    limit,
    total: totalItems,
  };
}

export function getMockCategoryOptions(): GuestMenuCategory[] {
  return mockMenuItems.map((cat) => ({
    id: cat.id,
    name: cat.category,
    description: undefined,
    items: [],
  }));
}
