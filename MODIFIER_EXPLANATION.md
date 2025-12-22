# MỤC ĐÍCH CỦA MODIFIER TRONG HỆ THỐNG RESTAURANT

## 🎯 MODIFIER LÀ GÌ?

**Modifier** cho phép khách hàng **tùy chỉnh món ăn** khi đặt order.

---

## 📱 FLOW THỰC TẾ CHO KHÁCH HÀNG

### Bước 1: Khách scan QR code bàn
```
Khách ngồi tại Bàn 5 → Scan QR → Vào Guest Menu
```

### Bước 2: Browse menu và chọn món
```
Khách thấy món: "Phở Bò Đặc Biệt" - 85.000đ
Click nút "Customize" 
```

### Bước 3: Chọn modifiers
```
┌─────────────────────────────────────┐
│ PHỞ BÒ ĐẶC BIỆT - 85.000đ          │
├─────────────────────────────────────┤
│                                     │
│ 🍜 KÍCH CỠ (Chọn 1) *Bắt buộc*     │
│   ○ Nhỏ           +0đ               │
│   ● Vừa           +10.000đ  ✓       │
│   ○ Lớn           +20.000đ          │
│                                     │
│ 🥩 THỊT BÒ (Chọn tối đa 3)         │
│   ☑ Tái           +15.000đ  ✓       │
│   ☑ Nạm           +12.000đ  ✓       │
│   ☐ Gầu           +18.000đ          │
│   ☐ Bò viên       +10.000đ          │
│                                     │
│ 🌿 RAUUỂ (Chọn nhiều)               │
│   ☐ Không hành    +0đ               │
│   ☑ Thêm rau      +5.000đ   ✓       │
│   ☐ Thêm chanh    +2.000đ           │
│                                     │
├─────────────────────────────────────┤
│ TỔNG: 127.000đ                      │
│                                     │
│ [Thêm vào giỏ hàng]                │
└─────────────────────────────────────┘

Tính toán:
  Base price:     85.000đ
  + Size Vừa:     10.000đ
  + Tái:          15.000đ
  + Nạm:          12.000đ
  + Thêm rau:      5.000đ
  ─────────────────────────
  TOTAL:         127.000đ
```

### Bước 4: Add to cart
```
✅ Món đã được thêm vào giỏ với đầy đủ tùy chọn
   Cart hiển thị:
   - Phở Bò Đặc Biệt (Vừa, Tái, Nạm, Thêm rau) - 127.000đ × 1
```

---

## 👨‍💼 FLOW THỰC TẾ CHO ADMIN

### Admin tạo Modifier Groups cho món

**File liên quan:** 
- Backend: `/packages/backend/src/modules/modifiers/`
- Frontend: `/packages/frontend/src/features/admin-modifiers/`

```javascript
// 1. Admin tạo Modifier Group: "Size"
POST /api/admin/menu/modifier-groups
{
  "name": "Size",
  "selectionType": "single",    // Chọn duy nhất 1
  "isRequired": true,            // Bắt buộc phải chọn
  "displayOrder": 1
}

// 2. Admin thêm Options vào group "Size"
POST /api/admin/menu/modifier-groups/{groupId}/options
{
  "name": "Small",
  "priceAdjustment": 0
}

POST /api/admin/menu/modifier-groups/{groupId}/options
{
  "name": "Medium",
  "priceAdjustment": 10000
}

POST /api/admin/menu/modifier-groups/{groupId}/options
{
  "name": "Large",
  "priceAdjustment": 20000
}

// 3. Admin attach modifier group vào món "Phở Bò"
POST /api/admin/menu/items/{phoBoItemId}/modifier-groups
{
  "modifierGroupIds": ["size-group-id", "meat-group-id", "veggies-group-id"]
}
```

---

## 🎨 UI COMPONENTS LIÊN QUAN

### 1. MenuItemCard (Guest view)
**File:** `packages/frontend/src/features/guest-menu/MenuItemCard.tsx`

- Hiển thị nút "Customize" nếu món có modifiers
- Show/hide ModifierSelector
- Tính giá real-time khi chọn modifiers
- Validate required modifiers trước khi add to cart

### 2. ModifierSelector
**File:** `packages/frontend/src/features/guest-menu/ModifierSelector.tsx`

- Render từng modifier group
- Handle single-select (radio) vs multi-select (checkbox)
- Enforce min/max selections
- Display price adjustments

### 3. CartSidebar
**File:** `packages/frontend/src/features/guest-menu/components/CartSidebar.tsx`

- Hiển thị modifiers đã chọn trong cart
- Format: "Medium (+$1), Extra Cheese (+$0.5)"
- Tính tổng giá cho từng cart item

---

## 💾 DATABASE STRUCTURE

```sql
-- Modifier Groups (nhóm tùy chọn)
modifier_groups
  - id: uuid
  - restaurant_id: uuid
  - name: "Size", "Toppings", "Remove"
  - selection_type: "single" | "multiple"
  - is_required: boolean
  - min_selections, max_selections: int

-- Modifier Options (từng option trong group)
modifier_options
  - id: uuid
  - group_id: uuid
  - name: "Small", "Extra Cheese"
  - price_adjustment: decimal (có thể = 0)
  - status: "active" | "inactive"

-- Link modifiers với menu items
menu_item_modifier_groups
  - menu_item_id: uuid
  - modifier_group_id: uuid
```

---

## 🔄 DATA FLOW

```
┌─────────────┐
│   ADMIN     │
│  Dashboard  │
└──────┬──────┘
       │
       │ 1. Create Modifier Groups
       │ 2. Add Options
       │ 3. Attach to Menu Items
       ▼
┌─────────────┐
│  DATABASE   │
└──────┬──────┘
       │
       │ Load menu with modifiers
       ▼
┌─────────────┐
│   GUEST     │
│  Menu Page  │
└──────┬──────┘
       │
       │ Select modifiers
       ▼
┌─────────────┐
│    CART     │
│  + Price    │
│ Calculation │
└──────┬──────┘
       │
       │ Checkout
       ▼
┌─────────────┐
│    ORDER    │
│ (with mods) │
└─────────────┘
```

---

## 🎁 LỢI ÍCH CỦA MODIFIER

### Cho Nhà hàng:
1. **Tăng doanh thu**: Upsell với premium options
2. **Flexibility**: Dễ dàng thay đổi giá/options
3. **Giảm lỗi order**: Khách tự chọn, không nhầm lẫn
4. **Data analytics**: Biết topping nào popular

### Cho Khách hàng:
1. **Customize**: Order đúng ý
2. **Transparent pricing**: Thấy rõ giá từng option
3. **Self-service**: Không cần hỏi nhân viên
4. **Faster**: Order nhanh hơn

---

## 📝 VÍ DỤ THỰC TẾ TRONG MOCK DATA

**File:** `packages/frontend/src/features/customer-view/components/MockMenu.tsx`

Bạn có thể thấy ví dụ modifier trong mock data:

```typescript
{
  id: 'item-1',
  name: 'Phở Bò Đặc Biệt',
  price: 85000,
  modifierGroups: [
    {
      id: 'mod-group-1',
      name: 'Kích cỡ',
      selectionType: 'single',
      isRequired: true,
      options: [
        { id: 'opt-1', name: 'Nhỏ', priceAdjustment: 0 },
        { id: 'opt-2', name: 'Vừa', priceAdjustment: 10000 },
        { id: 'opt-3', name: 'Lớn', priceAdjustment: 20000 }
      ]
    }
  ]
}
```

---

## 🚀 TEST NGAY

### Backend (đã có):
```bash
cd packages/backend
npm run start:dev

# Test APIs:
GET    /api/admin/menu/modifier-groups
POST   /api/admin/menu/modifier-groups
POST   /api/admin/menu/modifier-groups/:id/options
POST   /api/admin/menu/items/:id/modifier-groups
```

### Frontend (đã có):
```bash
cd packages/frontend
npm run dev

# Navigate to:
1. Admin: http://localhost:5173/admin/modifiers
   → Tạo modifier groups và options

2. Guest Menu: Scan QR link
   → Click "Customize" trên món
   → Chọn modifiers
   → Add to cart
   → Xem cart với modifiers
```

---

## 💡 TÓM LẠI

**Modifier = Tính năng customize món ăn**

- Admin setup các options (size, toppings, remove items)
- Guest chọn khi order
- Hệ thống tự tính giá
- Lưu vào cart và order với đầy đủ chi tiết

**Đây là tính năng CORE của mọi hệ thống order online!** 🎯
