# Phân Công Công Việc Tuần 1 (28/12/2025 – 04/01/2026)

## Nguyên tắc phân chia
- Mỗi thành viên phụ trách trọn vẹn một nhóm chức năng (bao gồm backend, frontend, database, tài liệu liên quan)
- Các phần việc được chia tách độc lập, không phụ thuộc code của nhau trong tuần 1
- Mỗi người tự tạo migration/schema, API, UI, seed data, hướng dẫn setup cho phần mình phụ trách

---

## Thành viên 1- Tín: Quản lý Người dùng (User/Auth)
#### Gợi ý cấu trúc file/folder
- Backend: packages/backend/src/modules/user/, packages/backend/src/modules/auth/
- Frontend: packages/frontend/src/features/user/, packages/frontend/src/features/auth/
- Database: database/migrations/user.sql, database/seeders/user.seed.sql
- Tài liệu: docs/user_auth_README.md

##### Sơ đồ cây gợi ý:
```
├── packages/
│   ├── backend/src/modules/user/
│   ├── backend/src/modules/auth/
│   └── frontend/src/features/
│       ├── user/
│       └── auth/
├── database/
│   ├── migrations/user.sql
│   └── seeders/user.seed.sql
├── docs/user_auth_README.md
```
### Backend
- Thiết kế bảng user (migration/schema)
- Xây dựng User module: entity, controller, service
- Xây dựng Auth module: đăng ký, đăng nhập, JWT, Google OAuth
- Seed/mock data cho user
### Frontend
- Màn hình đăng ký, đăng nhập, profile
- Kết nối API auth & user
### Database
- Viết migration/schema cho bảng user
- Seed dữ liệu mẫu user
### Documentation
- Viết hướng dẫn setup, sử dụng chức năng user/auth (README)
- Hướng dẫn cấu hình biến môi trường liên quan auth

---

## Thành viên 2- Thành: Quản lý Đơn hàng (Order)
#### Gợi ý cấu trúc file/folder
- Backend: packages/backend/src/modules/order/
- Frontend: packages/frontend/src/features/order/
- Database: database/migrations/order.sql, database/seeders/order.seed.sql
- Tài liệu: docs/order_README.md

##### Sơ đồ cây gợi ý:
```
├── packages/
│   ├── backend/src/modules/order/
│   └── frontend/src/features/order/
├── database/
│   ├── migrations/order.sql
│   └── seeders/order.seed.sql
├── docs/order_README.md
```
### Backend
- Thiết kế bảng order (migration/schema)
- Xây dựng Order module: entity, controller, service (CRUD, trạng thái, liên kết user/table)
- Seed/mock data cho order
### Frontend
- Màn hình order history, tạo đơn hàng
- Kết nối API order
### Database
- Viết migration/schema cho bảng order
- Seed dữ liệu mẫu order
### Documentation
- Viết hướng dẫn setup, sử dụng chức năng order (README)

---

## Thành viên 3- Tùng: Quản lý Thanh toán (Payment)
#### Gợi ý cấu trúc file/folder
- Backend: packages/backend/src/modules/payment/
- Frontend: packages/frontend/src/features/payment/
- Database: database/migrations/payment.sql, database/seeders/payment.seed.sql
- Tài liệu: docs/payment_README.md

##### Sơ đồ cây gợi ý:
```
├── packages/
│   ├── backend/src/modules/payment/
│   └── frontend/src/features/payment/
├── database/
│   ├── migrations/payment.sql
│   └── seeders/payment.seed.sql
├── docs/payment_README.md
```
### Backend
- Thiết kế bảng payment (migration/schema)
- Xây dựng Payment module: entity, controller, service (tích hợp Stripe/MoMo - mock API tuần 1)
- Seed/mock data cho payment
### Frontend
- Màn hình thanh toán, hiển thị trạng thái thanh toán
- Kết nối API payment
### Database
- Viết migration/schema cho bảng payment
- Seed dữ liệu mẫu payment
### Documentation
- Viết hướng dẫn setup, sử dụng chức năng payment (README)

---

## Công việc chung (cả 3 thành viên tự thực hiện cho phần mình)
- Tách rõ folder: frontend, backend, database (nếu chưa rõ)
- Tạo folder database chứa migration, seed, hướng dẫn import
- Viết hướng dẫn triển khai (deployment) cơ bản cho phần mình (local)
- Đảm bảo có file hướng dẫn cài đặt, chạy thử, cấu hình biến môi trường cho phần mình

---

