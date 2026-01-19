# Hướng Dẫn Sử Dụng & Migration Cơ Sở Dữ Liệu

Thư mục này chứa các script SQL để thiết lập và migrate cơ sở dữ liệu thủ công. Mặc dù ứng dụng backend hỗ trợ `synchronize: true` (tự động đồng bộ schema), các script này cung cấp cách đáng tin cậy để khởi tạo cấu trúc và dữ liệu database một cách trực tiếp.

## Cấu trúc Thư mục
- `migrations/`: Chứa các file SQL riêng lẻ để tạo bảng (ví dụ: `user.sql`, `payment.sql`).
- `seeders/`: (Nếu có) Chứa các script SQL để nạp dữ liệu ban đầu.

## 🛠 Yêu cầu Tiên quyết (Prerequisites)
- **PostgreSQL** đã được cài đặt và đang chạy.
- Một database đã được tạo (ví dụ: `restaurant_db`).
- Công cụ dòng lệnh (`psql`) HOẶC Giao diện quản lý Database (DBeaver, pgAdmin, TablePlus).

---

## 📥 Cách Import Script Migration

### Cách 1: Sử dụng Dòng lệnh (psql)
Bạn có thể chạy các file SQL trực tiếp bằng lệnh `psql`.

**1. Import một file lẻ:**
```bash
psql -U <username> -d <database_name> -f migrations/user.sql
```
*Ví dụ:*
```bash
psql -U postgres -d restaurant_db -f migrations/user.sql
```

**2. Import tất cả các file (Windows PowerShell):**
Nếu bạn muốn chạy tất cả các migration theo thứ tự, bạn có thể chạy lần lượt (đảm bảo tạo các bảng cha trước, ví dụ: Users -> Tables -> Orders):

```powershell
# Thứ tự import gợi ý
psql -U postgres -d restaurant_db -f migrations/user.sql
psql -U postgres -d restaurant_db -f migrations/tables.sql
psql -U postgres -d restaurant_db -f migrations/menu_categories.sql
psql -U postgres -d restaurant_db -f migrations/menu_items.sql
# ... chạy tiếp các script khác ...
```

### Cách 2: Sử dụng công cụ GUI (DBeaver / pgAdmin)
1.  Mở công cụ Database GUI và kết nối vào database của bạn.
2.  Mở trình soạn thảo SQL (SQL Editor).
3.  Mở file `.sql` bạn muốn import (File -> Open File).
4.  Chọn toàn bộ nội dung và thực thi (Run/Execute Script).
5.  Commit thay đổi nếu được yêu cầu.

---

## ⚠️ Lưu ý Quan trọng
- **Thứ tự rất quan trọng**: Luôn tạo các bảng được tham chiếu bởi Khóa Ngoại (Foreign Keys) trước.
    - Thứ tự khuyến nghị: `User` -> `Table` -> `MenuCategory` -> `MenuItem` -> `Order` -> `Payment`.
- **Đồng bộ Backend**: Backend NestJS được cấu hình để tự động đồng bộ schema trong môi trường development. Nếu bạn sử dụng các script này, hãy đảm bảo `DB_SYNC=false` trong file `.env` để tránh xung đột, hoặc chỉ sử dụng các script này cho việc thiết lập ban đầu/migration production.
