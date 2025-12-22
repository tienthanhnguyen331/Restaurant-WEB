# HƯỚNG DẪN GẮN MODIFIER VÀO MÓN PHỞ

## 🚀 CÁCH 1: SỬ DỤNG API (Backend)

### Bước 1: Khởi động Backend
```bash
cd packages/backend
npm run start:dev
```
Backend sẽ chạy tại: `http://localhost:3000`

---

### Bước 2: Tạo Modifier Group "Size"

**API:** `POST /api/admin/menu/modifier-groups`

```bash
curl -X POST http://localhost:3000/api/admin/menu/modifier-groups \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kích cỡ",
    "selectionType": "single",
    "isRequired": true,
    "displayOrder": 1,
    "status": "active"
  }'
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Kích cỡ",
  "selectionType": "single",
  "isRequired": true,
  ...
}
```

**💾 Lưu lại `id` này!** → Ví dụ: `550e8400-e29b-41d4-a716-446655440001`

---

### Bước 3: Thêm Options vào Group "Kích cỡ"

**API:** `POST /api/admin/menu/modifier-groups/{groupId}/options`

**Option 1: Nhỏ (không tính phí)**
```bash
curl -X POST http://localhost:3000/api/admin/menu/modifier-groups/550e8400-e29b-41d4-a716-446655440001/options \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nhỏ",
    "priceAdjustment": 0,
    "status": "active"
  }'
```

**Option 2: Vừa (+10.000đ)**
```bash
curl -X POST http://localhost:3000/api/admin/menu/modifier-groups/550e8400-e29b-41d4-a716-446655440001/options \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vừa",
    "priceAdjustment": 10000,
    "status": "active"
  }'
```

**Option 3: Lớn (+20.000đ)**
```bash
curl -X POST http://localhost:3000/api/admin/menu/modifier-groups/550e8400-e29b-41d4-a716-446655440001/options \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lớn",
    "priceAdjustment": 20000,
    "status": "active"
  }'
```

---

### Bước 4: Tạo Modifier Group "Topping" (Multi-select)

```bash
curl -X POST http://localhost:3000/api/admin/menu/modifier-groups \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Thịt bò",
    "selectionType": "multiple",
    "isRequired": false,
    "minSelections": 0,
    "maxSelections": 3,
    "displayOrder": 2,
    "status": "active"
  }'
```

**💾 Lưu lại `id`** → Ví dụ: `550e8400-e29b-41d4-a716-446655440002`

**Thêm options:**
```bash
# Tái (+15.000đ)
curl -X POST http://localhost:3000/api/admin/menu/modifier-groups/550e8400-e29b-41d4-a716-446655440002/options \
  -H "Content-Type: application/json" \
  -d '{"name": "Tái", "priceAdjustment": 15000, "status": "active"}'

# Nạm (+12.000đ)
curl -X POST http://localhost:3000/api/admin/menu/modifier-groups/550e8400-e29b-41d4-a716-446655440002/options \
  -H "Content-Type: application/json" \
  -d '{"name": "Nạm", "priceAdjustment": 12000, "status": "active"}'

# Bò viên (+10.000đ)
curl -X POST http://localhost:3000/api/admin/menu/modifier-groups/550e8400-e29b-41d4-a716-446655440002/options \
  -H "Content-Type: application/json" \
  -d '{"name": "Bò viên", "priceAdjustment": 10000, "status": "active"}'
```

---

### Bước 5: Tìm ID của món Phở

**Nếu chưa có món Phở**, tạo trước:
```bash
# TODO: Cần có API tạo menu item trước
# Hoặc kiểm tra database để lấy ID món Phở
```

**Giả sử món Phở có ID:** `pho-bo-id-12345`

---

### Bước 6: Attach Modifier Groups vào món Phở

**API:** `POST /api/admin/menu/items/{itemId}/modifier-groups`

```bash
curl -X POST http://localhost:3000/api/admin/menu/items/pho-bo-id-12345/modifier-groups \
  -H "Content-Type: application/json" \
  -d '{
    "modifierGroupIds": [
      "550e8400-e29b-41d4-a716-446655440001",
      "550e8400-e29b-41d4-a716-446655440002"
    ]
  }'
```

**Response:** `204 No Content` (Success!)

---

### Bước 7: Verify kết quả

**Kiểm tra modifier groups:**
```bash
curl http://localhost:3000/api/admin/menu/modifier-groups
```

**Kiểm tra guest menu:**
```bash
curl http://localhost:3000/api/menu
```

Bạn sẽ thấy món Phở có `modifierGroups` kèm theo!

---

## 🎨 CÁCH 2: SỬ DỤNG UI ADMIN (Frontend)

### Bước 1: Khởi động Frontend
```bash
cd packages/frontend
npm run dev
```
Frontend sẽ chạy tại: `http://localhost:5173`

---

### Bước 2: Vào Admin Modifiers Page

1. Mở trình duyệt: `http://localhost:5173/admin/modifiers`
2. Hoặc: `http://localhost:5173/admin/dashboard` → Click menu "Modifiers"

**File UI:** `packages/frontend/src/features/admin-modifiers/ModifierManager.tsx`

---

### Bước 3: Tạo Modifier Group

1. Click nút **"Create Modifier Group"**
2. Điền form:
   ```
   Name: Kích cỡ
   Type: Single Select
   Required: ✓
   Display Order: 1
   ```
3. Click **"Create"**

---

### Bước 4: Thêm Options

1. Tìm group "Kích cỡ" vừa tạo
2. Click **"Add Option"**
3. Thêm từng option:
   ```
   Option 1: Nhỏ - Price: 0
   Option 2: Vừa - Price: 10000
   Option 3: Lớn - Price: 20000
   ```

---

### Bước 5: Lặp lại cho Group "Thịt bò"

```
Name: Thịt bò
Type: Multiple Select
Required: No
Min: 0, Max: 3
Display Order: 2

Options:
- Tái: 15000
- Nạm: 12000
- Bò viên: 10000
```

---

### Bước 6: Attach vào Món Phở

**Có 2 cách:**

#### Cách A: Từ Modifier Manager
1. Vào page: `http://localhost:5173/admin/modifiers/attach`
2. Select món "Phở Bò"
3. Check các modifier groups muốn gắn:
   - ✓ Kích cỡ
   - ✓ Thịt bò
4. Click **"Attach"**

**File:** `packages/frontend/src/features/admin-modifiers/AttachModifiersToItem.tsx`

#### Cách B: Từ Menu Management (nếu có)
1. Vào danh sách menu items
2. Click "Edit" trên món Phở
3. Tab "Modifiers" → Select groups
4. Save

---

## 📱 CÁCH 3: THÊM VÀO MOCK DATA (Testing nhanh)

**File:** `packages/frontend/src/features/guest-menu/utils/mockData.ts`

Thêm modifiers vào mock data:

```typescript
const mockItemsWithModifiers = [
  {
    id: 'pho-bo-1',
    name: 'Phở Bò Đặc Biệt',
    categoryId: 'cat-main',
    price: 65000,
    description: 'Nước dùng hầm xương 12 tiếng',
    status: 'available',
    isChefRecommended: true,
    prepTimeMinutes: 15,
    primaryPhotoUrl: null,
    modifierGroups: [
      {
        id: 'mod-size',
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
        id: 'mod-meat',
        name: 'Thịt bò',
        selectionType: 'multiple',
        isRequired: false,
        minSelections: 0,
        maxSelections: 3,
        displayOrder: 2,
        options: [
          { id: 'meat-tai', name: 'Tái', priceAdjustment: 15000 },
          { id: 'meat-nam', name: 'Nạm', priceAdjustment: 12000 },
          { id: 'meat-vien', name: 'Bò viên', priceAdjustment: 10000 }
        ]
      }
    ]
  }
];
```

---

## 🧪 TEST KẾT QUẢ

### 1. Test qua Guest Menu
```bash
# Start frontend
cd packages/frontend
npm run dev

# Navigate to:
http://localhost:5173/scan?token=YOUR_QR_TOKEN
```

1. Tìm món "Phở Bò"
2. Click **"Customize"**
3. Chọn modifiers:
   - Size: Vừa
   - Thịt: Tái, Nạm
4. Thấy giá tự động tính:
   ```
   Base: 65.000đ
   + Vừa: 10.000đ
   + Tái: 15.000đ
   + Nạm: 12.000đ
   ──────────────
   Total: 102.000đ
   ```
5. Click **"Add to Cart"**
6. Mở cart → Thấy đầy đủ thông tin modifiers

---

## 🛠️ TOOLS HỖ TRỢ

### Postman Collection

Import file này vào Postman để test APIs:

```json
{
  "info": { "name": "Restaurant Modifiers" },
  "item": [
    {
      "name": "Create Modifier Group",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/api/admin/menu/modifier-groups",
        "body": {
          "mode": "raw",
          "raw": "{\"name\":\"Kích cỡ\",\"selectionType\":\"single\",\"isRequired\":true}"
        }
      }
    }
  ]
}
```

### VS Code REST Client

Tạo file `test-modifiers.http`:

```http
### Create Size Group
POST http://localhost:3000/api/admin/menu/modifier-groups
Content-Type: application/json

{
  "name": "Kích cỡ",
  "selectionType": "single",
  "isRequired": true,
  "displayOrder": 1
}

### Add Size Option
POST http://localhost:3000/api/admin/menu/modifier-groups/{{groupId}}/options
Content-Type: application/json

{
  "name": "Vừa",
  "priceAdjustment": 10000
}

### Attach to Item
POST http://localhost:3000/api/admin/menu/items/{{phoBoId}}/modifier-groups
Content-Type: application/json

{
  "modifierGroupIds": ["{{groupId1}}", "{{groupId2}}"]
}
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

### 1. Authentication
- Hiện tại backend dùng placeholder `restaurantId`
- Production cần JWT token thực
- Header: `Authorization: Bearer YOUR_TOKEN`

### 2. IDs phải tồn tại
- Menu item ID phải có trong database
- Modifier group IDs phải valid
- Backend sẽ validate và throw error nếu không tìm thấy

### 3. Validation Rules
- `isRequired: true` → Phải có ít nhất 1 option
- `selectionType: single` → Chỉ chọn được 1 option
- `selectionType: multiple` + `maxSelections: 3` → Tối đa 3 options
- `priceAdjustment` phải >= 0

### 4. Order của Modifier Groups
- `displayOrder` quyết định thứ tự hiển thị
- Group có `displayOrder` nhỏ hơn hiển thị trước

---

## 🎯 CHECKLIST HOÀN THÀNH

- [ ] Backend đang chạy (`npm run start:dev`)
- [ ] Tạo được modifier group "Kích cỡ"
- [ ] Thêm được 3 options: Nhỏ/Vừa/Lớn
- [ ] Tạo được modifier group "Thịt bò"
- [ ] Thêm được options: Tái/Nạm/Bò viên
- [ ] Có ID của món Phở trong database
- [ ] Attach thành công 2 groups vào món Phở
- [ ] Test qua API → Thấy modifiers trong response
- [ ] Test qua UI → Click "Customize" thấy options
- [ ] Add to cart → Thấy giá tính đúng
- [ ] Cart hiển thị đầy đủ modifiers đã chọn

---

## 🆘 TROUBLESHOOTING

### Lỗi: "Menu item not found"
→ Kiểm tra lại ID món Phở có đúng không
→ Query database để lấy đúng ID

### Lỗi: "Modifier group not found"
→ Copy đúng ID từ response sau khi tạo group
→ Hoặc GET `/api/admin/menu/modifier-groups` để lấy danh sách

### Không thấy modifiers trong Guest Menu
→ Kiểm tra attach thành công chưa (response 204)
→ Kiểm tra `status: 'active'` cho cả group và options
→ Clear cache / reload page

### Giá không tính đúng
→ Kiểm tra `priceAdjustment` có đúng không (số nguyên, không có dấu phẩy)
→ Check console log trong `calculateTotalPrice()` function

---

✅ **HOÀN THÀNH!** Món Phở giờ đã có đầy đủ modifiers! 🍜
