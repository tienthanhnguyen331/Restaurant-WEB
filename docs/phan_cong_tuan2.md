# Phân Công Công Việc Tuần 2 (05/01/2026 – 11/01/2026)

## Nguyên tắc phân chia
- Mỗi thành viên phụ trách trọn vẹn một nhóm chức năng (bao gồm backend, frontend, database, tài liệu liên quan)
- Các phần việc được chia tách độc lập, không phụ thuộc code của nhau trong tuần 2
- Mỗi người tự tạo migration/schema, API, UI, seed data, hướng dẫn setup cho phần mình phụ trách

---

## Thành viên 1: Quản lý Đơn hàng (Order & Review)
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
- Hoàn thiện Order module: CRUD, trạng thái, liên kết user/table
- Xây dựng Review module: entity, controller, service
- Websocket cập nhật trạng thái order
- Seed/mock data cho order, review
### Frontend
- Màn hình order, order history, trạng thái đơn hàng
- Màn hình review món ăn, gửi review
- Kết nối API order, review, websocket
### Database
- Viết migration/schema cho bảng order, review
- Seed dữ liệu mẫu order, review
### Documentation
- Viết hướng dẫn setup, sử dụng chức năng order, review (README)
- Cập nhật API docs cho order, review

---

## Thành viên 2: Quản lý Thanh toán (Payment & Báo cáo)
#### Gợi ý cấu trúc file/folder
- Backend: packages/backend/src/modules/payment/, packages/backend/src/modules/report/
- Frontend: packages/frontend/src/features/payment/, packages/frontend/src/features/report/
- Database: database/migrations/payment.sql, database/migrations/report.sql, database/seeders/payment.seed.sql, database/seeders/report.seed.sql
- Tài liệu: docs/payment_report_README.md

##### Sơ đồ cây gợi ý:
```
├── packages/
│   ├── backend/src/modules/payment/
│   ├── backend/src/modules/report/
│   └── frontend/src/features/
│       ├── payment/
│       └── report/
├── database/
│   ├── migrations/payment.sql
│   ├── migrations/report.sql
│   ├── seeders/payment.seed.sql
│   └── seeders/report.seed.sql
├── docs/payment_report_README.md
```
### Backend
- Hoàn thiện Payment module: tích hợp Stripe/MoMo (mock hoặc real)
- Xây dựng Report module: doanh thu, best seller
- Seed/mock data cho payment
### Frontend
- Màn hình thanh toán, hiển thị trạng thái thanh toán
- Dashboard & báo cáo admin (doanh thu, best seller)
- Kết nối API payment, report
### Database
- Viết migration/schema cho bảng payment
- Seed dữ liệu mẫu payment
### Documentation
- Viết hướng dẫn setup, sử dụng chức năng payment, report (README)
- Cập nhật API docs cho payment, report

---

## Thành viên 3: Quản lý Waiter/Kitchen & UI nâng cao
#### Gợi ý cấu trúc file/folder
- Backend: packages/backend/src/modules/waiter/, packages/backend/src/modules/kitchen/, packages/backend/src/modules/table/
- Frontend: packages/frontend/src/features/waiter/, packages/frontend/src/features/kitchen/, packages/frontend/src/features/table/
- Database: database/migrations/waiter.sql, database/migrations/kitchen.sql, database/migrations/table.sql, database/seeders/waiter.seed.sql, database/seeders/kitchen.seed.sql, database/seeders/table.seed.sql
- Tài liệu: docs/waiter_kitchen_README.md

##### Sơ đồ cây gợi ý:
```
├── packages/
│   ├── backend/src/modules/waiter/
│   ├── backend/src/modules/kitchen/
│   ├── backend/src/modules/table/
│   └── frontend/src/features/
│       ├── waiter/
│       ├── kitchen/
│       └── table/
├── database/
│   ├── migrations/waiter.sql
│   ├── migrations/kitchen.sql
│   ├── migrations/table.sql
│   ├── seeders/waiter.seed.sql
│   ├── seeders/kitchen.seed.sql
│   └── seeders/table.seed.sql
├── docs/waiter_kitchen_README.md
```
### Backend
- Xây dựng các API cho waiter/kitchen: nhận order, cập nhật trạng thái, quản lý bàn
- Websocket cho waiter/kitchen notification
- Seed/mock data cho waiter/kitchen, table
### Frontend
- UI waiter/kitchen: nhận order, cập nhật trạng thái, quản lý bàn
- Paging, sort, fuzzy search menu
- Loading/empty/error state cho các màn hình
- i18n (đa ngôn ngữ)
### Database
- Viết migration/schema cho bảng waiter, kitchen, table (nếu cần bổ sung)
- Seed dữ liệu mẫu waiter, kitchen, table
### Documentation
- Viết hướng dẫn setup, sử dụng chức năng waiter/kitchen, UI nâng cao (README)
- Cập nhật API docs cho waiter/kitchen

---

## Công việc chung (cả 3 thành viên tự thực hiện cho phần mình)
- Hoàn thiện folder database: migration, seed, hướng dẫn import
- Viết hướng dẫn triển khai chi tiết (local & internet) cho phần mình
- Bắt đầu chuẩn bị Teamwork Report.pdf (chụp screenshot commit, phân công, teamwork cho phần mình)
- Bắt đầu chuẩn bị Final Project Report.pdf (bản nháp: mô tả hệ thống, thành viên, tiến độ, chức năng, thiết kế DB, UI/UX, hướng dẫn sử dụng & triển khai cho phần mình)
- Bắt đầu chuẩn bị Project Self-assessment Report.pdf (bản nháp: đánh giá tiêu chí, bằng chứng, điểm tổng, Pie chart, phân tích đóng góp cho phần mình)
- Lên kịch bản video demo, phân vai trình bày phần mình

---

