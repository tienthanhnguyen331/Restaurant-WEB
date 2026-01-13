# Prompt Tích Hợp Waiter/Kitchen - Restaurant-WEB

## Mục Tiêu
Tích hợp hoàn chỉnh các chức năng và UI về Waiter và Kitchen từ project `resstaurant-test` vào project `Restaurant-WEB`, bao gồm backend (NestJS), frontend (React), database migrations, và tài liệu.

---

## I. TỔNG QUAN CÔNG VIỆC

### 1. Backend (NestJS)
- Copy & cấu trúc modules waiter, kitchen
- Đảm bảo tích hợp với Order entities hiện có
- Thêm WebSocket gateways cho real-time notifications
- Thêm các API endpoints cho waiter/kitchen operations

### 2. Frontend (React)
- Copy & cấu trúc features waiter, kitchen
- Thêm routes cho waiter/kitchen dashboards
- Kết nối services với API backends
- Thêm UI components và pages

### 3. Database
- Thêm database migrations cho waiter/kitchen (nếu cần)
- Seed data cho waiter/kitchen users
- Cập nhật order status enums nếu cần

### 4. App Integration
- Import modules vào app.module.ts
- Đăng ký routes trong app.routes.tsx / router config
- Cấu hình authentication & role-based access control
- Cập nhật documentation

---

## II. HƯỚNG DẪN TÍCH HỢP CHI TIẾT

### A. BACKEND INTEGRATION

#### Step 1: Copy Waiter Module
**Source:** `d:\vscode\resstaurant-test\Restaurant-WEB\packages\backend\src\modules\waiter\`
**Target:** `d:\test\Restaurant-WEB\packages\backend\src\modules\waiter\`

**Files to copy:**
- `waiter.module.ts` - Import AuthModule, TypeOrmModule với OrderEntity, User
- `waiter.service.ts` - Business logic cho waiter operations (getPendingOrders, acceptOrder, rejectOrder, sendToKitchen)
- `waiter.controller.ts` - REST endpoints
- `waiter.gateway.ts` - WebSocket gateway cho real-time notifications

**Checklist:**
- [ ] Kiểm tra import paths (OrderEntity, User entities phải tồn tại)
- [ ] Verify entity relationships
- [ ] Kiểm tra order status enums có PENDING, ACCEPTED, PREPARING, READY không
- [ ] Thêm waiter_id, kitchen_id fields vào OrderEntity nếu chưa có

#### Step 2: Copy Kitchen Module
**Source:** `d:\vscode\resstaurant-test\Restaurant-WEB\packages\backend\src\modules\kitchen\`
**Target:** `d:\test\Restaurant-WEB\packages\backend\src\modules\kitchen\`

**Files to copy:**
- `kitchen.module.ts` - Import AuthModule, TypeOrmModule với OrderEntity
- `kitchen.service.ts` - Business logic (getOrders, setPreparing, setReady)
- `kitchen.controller.ts` - REST endpoints
- `kitchen.gateway.ts` - WebSocket gateway

**Checklist:**
- [ ] Kiểm tra import paths
- [ ] Verify order status queries
- [ ] Thêm kitchen_id field tracking

#### Step 3: Update OrderEntity
**File:** `d:\test\Restaurant-WEB\packages\backend\src\modules\order\entities\order.entity.ts`

**Thêm/Verify:**
```typescript
// Thêm nếu chưa có
@Column({ nullable: true })
waiter_id?: string;

@Column({ nullable: true })
kitchen_id?: string;

// Verify OrderStatus enum có các status sau:
enum OrderStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}
```

#### Step 4: Update AppModule
**File:** `d:\test\Restaurant-WEB\packages\backend\src\app.module.ts`

**Thêm:**
```typescript
import { WaiterModule } from './modules/waiter/waiter.module';
import { KitchenModule } from './modules/kitchen/kitchen.module';

@Module({
  imports: [
    // ... existing imports
    WaiterModule,
    KitchenModule,
  ],
  // ...
})
export class AppModule {}
```

#### Step 5: Update/Create Auth Guards
**Files to verify/update:**
- `d:\test\Restaurant-WEB\packages\backend\src\common\guards\`

**Cần có:**
- Role-based access control (RBAC) guards
- Verify RoleGuard hoặc JwtGuard có hỗ trợ 'WAITER' và 'KITCHEN' roles
- Thêm @Roles('WAITER'), @Roles('KITCHEN') decorators nếu cần

---

### B. FRONTEND INTEGRATION

#### Step 1: Copy Waiter Feature
**Source:** `d:\vscode\resstaurant-test\Restaurant-WEB\packages\frontend\src\features\waiter\`
**Target:** `d:\test\Restaurant-WEB\packages\frontend\src\features\waiter\`

**Structure:**
```
waiter/
├── components/
│   └── OrderCard.tsx
├── pages/
│   ├── OrderDetail.tsx
│   └── WaiterDashboard.tsx
├── services/
│   └── waiterApi.ts
├── types.ts
└── waiter.routes.tsx
```

**Checklist:**
- [ ] Copy all files
- [ ] Update API endpoint URLs (verify backend port, domain)
- [ ] Update socket.io connection URL
- [ ] Verify imports của React, hooks, components

#### Step 2: Copy Kitchen Feature
**Source:** `d:\vscode\resstaurant-test\Restaurant-WEB\packages\frontend\src\features\kitchen\`
**Target:** `d:\test\Restaurant-WEB\packages\frontend\src\features\kitchen\`

**Structure:**
```
kitchen/
├── components/
│   └── KitchenOrderCard.tsx
├── pages/
│   └── KitchenDashboard.tsx
├── services/
│   └── kitchenApi.ts
├── types.ts
└── kitchen.routes.tsx
```

**Checklist:**
- [ ] Copy all files
- [ ] Update API endpoint URLs
- [ ] Update socket.io connection URL
- [ ] Verify imports

#### Step 3: Update App Router/Routes
**File:** `d:\test\Restaurant-WEB\packages\frontend\src\App.tsx` hoặc routing config

**Thêm:**
```typescript
// Import routes từ waiter/kitchen features
import { waiterRoutes } from './features/waiter/waiter.routes';
import { kitchenRoutes } from './features/kitchen/kitchen.routes';

// Thêm vào routing configuration:
// routes cho waiter dashboard: /waiter/dashboard
// routes cho kitchen dashboard: /kitchen/dashboard
```

**Hoặc nếu dùng lazy loading:**
```typescript
const WaiterDashboard = lazy(() => 
  import('./features/waiter/pages/WaiterDashboard').then(m => ({ default: m.WaiterDashboard }))
);
const KitchenDashboard = lazy(() => 
  import('./features/kitchen/pages/KitchenDashboard').then(m => ({ default: m.KitchenDashboard }))
);
```

#### Step 4: Update Navigation/Layout
**Files to update:**
- `d:\test\Restaurant-WEB\packages\frontend\src\components\AdminLayout.tsx` hoặc navigation component

**Thêm:**
- Menu items/links cho Waiter Dashboard (nếu user role === WAITER)
- Menu items/links cho Kitchen Dashboard (nếu user role === KITCHEN)
- Logic kiểm tra user role từ auth context/store

#### Step 5: Update Auth Context
**File:** `d:\test\Restaurant-WEB\packages\frontend\src\contexts\CartContext.tsx` hoặc auth context

**Verify:**
- User object có `role` field
- Roles bao gồm: 'ADMIN', 'WAITER', 'KITCHEN', 'CUSTOMER'
- Có hàm check role hoặc permission

---

### C. DATABASE INTEGRATION

#### Step 1: Check Order Table Migrations
**File:** `d:\test\Restaurant-WEB\database\migrations\order.sql`

**Verify columns:**
```sql
-- Nếu chưa có thêm:
ALTER TABLE orders ADD COLUMN waiter_id VARCHAR(255) NULL;
ALTER TABLE orders ADD COLUMN kitchen_id VARCHAR(255) NULL;

-- Verify ORDER_STATUS enum/constraint có các giá trị:
-- PENDING, ACCEPTED, REJECTED, PREPARING, READY, COMPLETED, CANCELLED
```

#### Step 2: Check Waiter/Kitchen in User Table
**File:** `d:\test\Restaurant-WEB\database\migrations\user.sql`

**Verify:**
- User table có `role` column
- Role enum/constraint bao gồm: 'ADMIN', 'CUSTOMER', 'WAITER', 'KITCHEN'
- Có hỗ trợ multiple roles hoặc single role

#### Step 3: Seed Waiter/Kitchen Users (optional)
**Files:**
- `d:\test\Restaurant-WEB\database\seeders\user.seed.sql`

**Thêm sample data:**
```sql
-- Thêm waiter users
INSERT INTO users (id, email, password, name, role, created_at) VALUES
('waiter1', 'waiter1@restaurant.com', 'hashed_password', 'Waiter 1', 'WAITER', NOW()),
('waiter2', 'waiter2@restaurant.com', 'hashed_password', 'Waiter 2', 'WAITER', NOW());

-- Thêm kitchen users
INSERT INTO users (id, email, password, name, role, created_at) VALUES
('kitchen1', 'kitchen1@restaurant.com', 'hashed_password', 'Kitchen 1', 'KITCHEN', NOW()),
('kitchen2', 'kitchen2@restaurant.com', 'hashed_password', 'Kitchen 2', 'KITCHEN', NOW());
```

---

### D. CONFIGURATION & ENVIRONMENT

#### Step 1: Update .env Files
**File:** `d:\test\Restaurant-WEB\packages\backend\.env`

**Verify/Add:**
```
# WebSocket Configuration
WS_NAMESPACE_WAITER=/waiter
WS_NAMESPACE_KITCHEN=/kitchen
WS_CORS_ORIGIN=http://localhost:3000

# JWT Configuration (ensure tokens include role)
JWT_SECRET=your_secret_key
JWT_EXPIRATION=24h

# Database
DATABASE_URL=...
```

#### Step 2: Update Frontend .env
**File:** `d:\test\Restaurant-WEB\packages\frontend\.env`

**Verify/Add:**
```
VITE_API_BASE_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
```

---

### E. TESTING & VERIFICATION

#### Backend Testing
- [ ] Run `npm run start:dev` hoặc `npm start`
- [ ] Test waiter endpoints:
  - GET `/api/waiter/orders/pending` - Get pending orders
  - POST `/api/waiter/orders/:id/accept` - Accept order
  - POST `/api/waiter/orders/:id/reject` - Reject order
  - POST `/api/waiter/orders/:id/send-to-kitchen` - Send to kitchen
- [ ] Test kitchen endpoints:
  - GET `/api/kitchen/orders` - Get kitchen orders
  - POST `/api/kitchen/orders/:id/preparing` - Set preparing
  - POST `/api/kitchen/orders/:id/ready` - Set ready
- [ ] Test WebSocket connections:
  - Connect to `/waiter` namespace
  - Connect to `/kitchen` namespace
  - Emit/receive events

#### Frontend Testing
- [ ] Run `npm run dev`
- [ ] Navigate to `/waiter/dashboard` - Verify waiter interface
- [ ] Navigate to `/kitchen/dashboard` - Verify kitchen interface
- [ ] Test order card interactions
- [ ] Test WebSocket real-time updates
- [ ] Test role-based access control

#### Database Testing
- [ ] Run migrations
- [ ] Verify order status updates
- [ ] Check waiter_id, kitchen_id assignments
- [ ] Verify seed data loaded correctly

---

### F. DOCUMENTATION UPDATE

#### Step 1: Update/Verify README Files
**File:** `d:\test\Restaurant-WEB\docs\waiter_kitchen_README.md`

**Should include:**
- System overview
- Role descriptions (Admin, Waiter, Kitchen, Customer)
- Order lifecycle diagram
- Installation & setup instructions
- API endpoints documentation
- WebSocket events documentation
- Frontend routes & components
- Database schema
- Configuration guide
- Deployment guide

#### Step 2: Create Integration Summary
**File:** `d:\test\Restaurant-WEB\INTEGRATION_SUMMARY.md`

**Include:**
```markdown
# Waiter/Kitchen Integration Summary

## Changes Made
- [ ] Backend: Waiter/Kitchen modules integrated
- [ ] Frontend: Waiter/Kitchen features integrated
- [ ] Database: Migrations applied, seed data created
- [ ] Authentication: Role-based access control configured
- [ ] WebSocket: Real-time notifications configured
- [ ] Documentation: Updated

## Files Modified/Created
- packages/backend/src/modules/waiter/ (NEW)
- packages/backend/src/modules/kitchen/ (NEW)
- packages/frontend/src/features/waiter/ (NEW)
- packages/frontend/src/features/kitchen/ (NEW)
- packages/backend/src/modules/order/entities/order.entity.ts (MODIFIED)
- packages/backend/src/app.module.ts (MODIFIED)
- packages/frontend/src/App.tsx (MODIFIED)
- database/migrations/ (MODIFIED/NEW)
- docs/waiter_kitchen_README.md (VERIFIED/UPDATED)

## Testing Status
- [ ] Backend API tests passed
- [ ] Frontend UI tests passed
- [ ] WebSocket tests passed
- [ ] Database tests passed
- [ ] End-to-end tests passed
```

---

## III. EXECUTION CHECKLIST

### Phase 1: Backend (Days 1-2)
- [ ] Copy waiter module files
- [ ] Copy kitchen module files
- [ ] Update OrderEntity with waiter_id, kitchen_id
- [ ] Verify order status enums
- [ ] Update app.module.ts
- [ ] Verify auth guards/decorators
- [ ] Test backend endpoints
- [ ] Test WebSocket connections

### Phase 2: Frontend (Days 2-3)
- [ ] Copy waiter feature files
- [ ] Copy kitchen feature files
- [ ] Update API endpoint URLs
- [ ] Update socket.io connection URLs
- [ ] Integrate routes into app routing
- [ ] Update navigation/layout with role-based menu
- [ ] Update auth context/store
- [ ] Test frontend pages & components
- [ ] Test WebSocket real-time updates

### Phase 3: Database (Day 1)
- [ ] Verify order table migrations
- [ ] Add waiter_id, kitchen_id columns if needed
- [ ] Verify user role enum includes WAITER, KITCHEN
- [ ] Add seed data for waiter/kitchen users
- [ ] Run migrations
- [ ] Verify data integrity

### Phase 4: Configuration & Deployment (Day 3)
- [ ] Update .env files (backend & frontend)
- [ ] Configure WebSocket namespaces
- [ ] Configure JWT to include roles
- [ ] Test complete end-to-end workflow
- [ ] Update documentation
- [ ] Create integration summary
- [ ] Prepare for deployment

---

## IV. POTENTIAL ISSUES & SOLUTIONS

### Issue 1: OrderEntity fields missing
**Problem:** waiter_id, kitchen_id không tồn tại trong OrderEntity
**Solution:** 
- Thêm các column vào entity
- Tạo migration để add columns vào database
- Update seed data nếu cần

### Issue 2: Order Status enums incomplete
**Problem:** Không có PENDING, ACCEPTED, PREPARING, READY status
**Solution:**
- Update OrderStatus enum
- Verify database constraint/enum
- Update migrations

### Issue 3: WebSocket connection failed
**Problem:** Socket.io connection lỗi tới `/waiter` hoặc `/kitchen` namespace
**Solution:**
- Verify backend WebSocket server đang chạy
- Check CORS configuration
- Verify connection URL
- Check firewall/network settings

### Issue 4: Authentication/Authorization failed
**Problem:** Waiter/Kitchen không thể access endpoints
**Solution:**
- Verify JWT token include role
- Check @UseGuards(RoleGuard) decorators
- Verify @Roles('WAITER'), @Roles('KITCHEN') decorators
- Check user seed data có đúng role không

### Issue 5: API endpoint URL mismatch
**Problem:** Frontend không thể connect tới backend API
**Solution:**
- Verify .env files có correct API_BASE_URL
- Check backend port (default 3001 hoặc 3000)
- Verify CORS configuration
- Check service files có correct endpoint paths

### Issue 6: Component import errors
**Problem:** Import errors từ copied components/services
**Solution:**
- Verify tất cả import paths
- Check missing dependencies
- Verify types/interfaces được exported
- Update package.json nếu cần dependencies mới

---

## V. QUICK REFERENCE

### Key Files to Copy
```
Source: d:\vscode\resstaurant-test\Restaurant-WEB
Target: d:\test\Restaurant-WEB

Backend:
- packages/backend/src/modules/waiter/ → packages/backend/src/modules/waiter/
- packages/backend/src/modules/kitchen/ → packages/backend/src/modules/kitchen/

Frontend:
- packages/frontend/src/features/waiter/ → packages/frontend/src/features/waiter/
- packages/frontend/src/features/kitchen/ → packages/frontend/src/features/kitchen/

Database:
- database/migrations/waiter.sql → database/migrations/waiter.sql
- database/migrations/kitchen.sql → database/migrations/kitchen.sql
- database/seeders/ → database/seeders/

Docs:
- docs/waiter_kitchen_README.md → docs/waiter_kitchen_README.md
```

### Key Commands
```bash
# Backend
cd packages/backend
npm install
npm run start:dev

# Frontend
cd packages/frontend
npm install
npm run dev

# Database
mysql -u root -p < database/migrations/order.sql
mysql -u root -p < database/migrations/user.sql
mysql -u root -p < database/seeders/user.seed.sql
```

### API Endpoints
```
Waiter:
GET    /api/waiter/orders/pending
POST   /api/waiter/orders/:id/accept
POST   /api/waiter/orders/:id/reject
POST   /api/waiter/orders/:id/send-to-kitchen

Kitchen:
GET    /api/kitchen/orders
POST   /api/kitchen/orders/:id/preparing
POST   /api/kitchen/orders/:id/ready
```

### Routes
```
Frontend:
/waiter/dashboard       - Waiter Dashboard
/waiter/orders/:id      - Order Detail
/kitchen/dashboard      - Kitchen Dashboard
```

### WebSocket Events
```
Waiter Namespace (/waiter):
- newOrder: Đơn hàng mới
- orderReady: Đơn hàng sẵn sàng
- orderUpdated: Cập nhật trạng thái

Kitchen Namespace (/kitchen):
- orderToKitchen: Đơn hàng gửi tới bếp
- orderCompleted: Đơn hàng hoàn thành
```

---

## VI. SUCCESS CRITERIA

✅ **Integration Success** khi:
1. Tất cả waiter/kitchen files được copy & integrate thành công
2. Backend API endpoints hoạt động chính xác
3. Frontend routes & components hiển thị đúng
4. WebSocket real-time updates hoạt động
5. Role-based access control hoạt động
6. Database migrations applied successfully
7. Seed data được load đúng
8. End-to-end workflow (order → waiter → kitchen) thành công
9. Tài liệu được cập nhật đầy đủ
10. Không có lỗi trong browser console & backend logs
