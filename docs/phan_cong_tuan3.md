# Phân Công Công Việc Tuần 3 (15/01/2026 – 21/01/2026)

## Nguyên tắc phân chia
- Mỗi thành viên phụ trách trọn vẹn một nhóm chức năng (bao gồm backend, frontend, database, tài liệu liên quan)
- Các phần việc được chia tách độc lập, không phụ thuộc code của nhau trong tuần 3
- Mỗi người tự tạo migration/schema, API, UI, seed data, hướng dẫn setup cho phần mình phụ trách

---

## Thành viên 1: Thành – Quản lý Đơn hàng & Review
#### Gợi ý cấu trúc file/folder
- Backend: packages/backend/src/modules/order/, packages/backend/src/modules/review/
- Frontend: packages/frontend/src/features/order/, packages/frontend/src/features/review/
- Database: database/migrations/order.sql, database/migrations/review.sql, database/seeders/order.seed.sql, database/seeders/review.seed.sql
- Tài liệu: docs/order_review_README.md

##### Sơ đồ cây gợi ý:
```
├── packages/
│   ├── backend/src/modules/order/
│   ├── backend/src/modules/review/
│   └── frontend/src/features/
│       ├── order/
│       └── review/
├── database/
│   ├── migrations/order.sql
│   ├── migrations/review.sql
│   ├── seeders/order.seed.sql
│   └── seeders/review.seed.sql
├── docs/order_review_README.md
```
### Backend
- Hoàn thiện chức năng "List of past orders linked to user account" (lịch sử đơn hàng của khách)
- Thêm chức năng paging cho mục review ở admin và guest (phân trang cho danh sách đánh giá)
### Frontend
- Màn hình review với phân trang cho admin và guest
- Kết nối API order, review
### Database
- Viết migration/schema cho bảng order, review nếu cần bổ sung
- Seed dữ liệu mẫu order, review
### Documentation

---

## Thành viên 2: Tín – Quản lý Menu & Authentication
#### Gợi ý cấu trúc file/folder
- Backend: packages/backend/src/modules/menu/, packages/backend/src/modules/auth/
- Frontend: packages/frontend/src/features/menu/, packages/frontend/src/features/auth/
- Database: database/migrations/menu.sql, database/migrations/user.sql, database/seeders/menu.seed.sql, database/seeders/user.seed.sql
- Tài liệu: docs/user_auth_README.md

##### Sơ đồ cây gợi ý:
```
├── packages/
│   ├── backend/src/modules/menu/
│   ├── backend/src/modules/auth/
│   └── frontend/src/features/
│       ├── menu/
│       └── auth/
├── database/
│   ├── migrations/menu.sql
│   ├── migrations/user.sql
│   ├── seeders/menu.seed.sql
│   └── seeders/user.seed.sql
├── docs/user_auth_README.md
```
### Backend
- Hoàn thiện chức năng paging, sort, fuzzy search cho menu
- Hoàn thiện các chức năng authentication còn thiếu: đăng ký, xác thực email, đăng nhập, quên mật khẩu, đăng nhập bằng Google, phân quyền
- Hoàn thiện các feature for logged-in user (customer): cập nhật profile, đổi mật khẩu, upload avatar, xem lịch sử đơn hàng
### Frontend
- Màn hình menu với paging, sort, fuzzy search
- Màn hình đăng ký, đăng nhập, xác thực email, quên mật khẩu, đăng nhập Google
- Màn hình quản lý tài khoản khách hàng: cập nhật profile, đổi mật khẩu, upload avatar, xem lịch sử đơn hàng
- Kết nối API menu, auth
### Database
- Viết migration/schema cho bảng menu, user nếu cần bổ sung
- Seed dữ liệu mẫu menu, user nếu cần bổ sung
### Documentation
- Viết hướng dẫn setup, sử dụng chức năng menu, authentication (README)
- Cập nhật API docs cho menu, auth

---

## Thành viên 3: (Bổ sung) – Quản lý Thanh toán, Bill, Admin & Nhân sự
#### Gợi ý cấu trúc file/folder
- Backend: packages/backend/src/modules/payment/, packages/backend/src/modules/bill/, packages/backend/src/modules/admin/, packages/backend/src/modules/waiter/, packages/backend/src/modules/kitchen-staff/
- Frontend: packages/frontend/src/features/payment/, packages/frontend/src/features/bill/, packages/frontend/src/features/admin/, packages/frontend/src/features/waiter/, packages/frontend/src/features/kitchen-staff/
- Database: database/migrations/payment.sql, database/migrations/bill.sql, database/migrations/user.sql, database/seeders/payment.seed.sql, database/seeders/user.seed.sql
- Tài liệu: docs/payment_report_README.md

##### Sơ đồ cây gợi ý:
```
├── packages/
│   ├── backend/src/modules/payment/
│   ├── backend/src/modules/bill/
│   ├── backend/src/modules/admin/
│   ├── backend/src/modules/waiter/
│   ├── backend/src/modules/kitchen-staff/
│   └── frontend/src/features/
│       ├── payment/
│       ├── bill/
│       ├── admin/
│       ├── waiter/
│       └── kitchen-staff/
├── database/
│   ├── migrations/payment.sql
│   ├── migrations/bill.sql
│   ├── migrations/user.sql
│   ├── seeders/payment.seed.sql
│   └── seeders/user.seed.sql
├── docs/payment_report_README.md
```
### Backend
- Hoàn thiện chức năng "Customer requests bill when ready to pay"
- (Nếu cần) Hoàn thiện chức năng "Process payment after meal" (Stripe payment processing after dining)
- Tạo, quản lý tài khoản Admin: Create Admin accounts, Manage Admin accounts, Update admin profile
- Tạo, quản lý tài khoản Waiter, Kitchen Staff: Create Waiter accounts, Create Kitchen Staff accounts
### Frontend
- Màn hình yêu cầu thanh toán/bill cho khách
- Màn hình thanh toán sau dining (nếu cần)
- Màn hình quản lý tài khoản Admin, Waiter, Kitchen Staff (tạo, sửa, xóa, cập nhật profile)
- Kết nối API payment, bill, admin, waiter, kitchen staff
### Database
- Viết migration/schema cho bảng payment, bill, user nếu cần bổ sung
- Seed dữ liệu mẫu payment, user nếu cần bổ sung
### Documentation
- Viết hướng dẫn setup, sử dụng chức năng payment, bill, admin, waiter, kitchen staff (README)
- Cập nhật API docs cho payment, bill, admin, waiter, kitchen staff

---