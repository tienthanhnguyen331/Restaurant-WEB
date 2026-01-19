# 🛠 Hướng Dẫn Triển Khai Dự Án Trên Local (Local Deployment)

Tài liệu này hướng dẫn chi tiết từng bước để cài đặt và chạy toàn bộ hệ thống (Backend, Frontend, Database) trên máy tính cá nhân của bạn.

---

## 📋 1. Yêu Cầu Tiên Quyết (Prerequisites)
Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt:

*   **Node.js**: Phiên bản 18 trở lên. ([Tải tại đây](https://nodejs.org/))
*   **PostgreSQL**: Cơ sở dữ liệu chính. ([Tải tại đây](https://www.postgresql.org/download/))
    *   *Lưu ý*: Hãy nhớ mật khẩu user `postgres` khi cài đặt.
*   **Git**: Để quản lý mã nguồn.

---

## 📥 2. Cài Đặt Mã Nguồn & Thư Viện

### Bước 2.1: Clone dự án
Mở Terminal hoặc Command Prompt (CMD) và chạy lệnh:
```bash
git clone <URL_CUA_REPO_NAY>
cd Restaurant-WEB
```

### Bước 2.2: Cài đặt thư viện (Dependencies)
Dự án được chia thành 2 thư mục chính: `backend` và `frontend`. Bạn cần cài đặt thư viện cho cả hai.

**Cài đặt cho Backend:**
```bash
cd packages/backend
npm install
```

**Cài đặt cho Frontend:**
Mở một terminal **mới** (hoặc quay lại root bằng `cd ../..`) và chạy:
```bash
cd packages/frontend
npm install
```

---

## ⚙️ 3. Cấu Hình Biến Môi Trường (.env)

Bạn cần tạo file `.env` từ file mẫu `.env.example` đã có sẵn.

### Bước 3.1: Cấu hình Backend
Tại thư mục `packages/backend`:
1.  Copy file `.env.example` thành `.env`.
    *   Lệnh (Windows): `copy .env.example .env`
    *   Lệnh (Mac/Linux): `cp .env.example .env`
2.  Mở file `.env` vừa tạo và chỉnh sửa các thông số Database cho đúng với máy bạn:
    ```env
    # Thông tin kết nối PostgreSQL local của bạn
    DATABASE_HOST=localhost
    DATABASE_PORT=5432
    DATABASE_USERNAME=postgres      # Thường là 'postgres'
    DATABASE_PASSWORD=mat_khau_cua_ban
    DATABASE_NAME=restaurant_db     # Tên database bạn muốn đặt
    DATABASE_SSL=false
    DB_SYNC=true                    # Quan trọng: Để 'true' lần đầu chạy để tự tạo bảng
    ```

### Bước 3.2: Cấu hình Frontend
Tại thư mục `packages/frontend`:
1.  Copy `.env.example` thành `.env`.
2.  Đảm bảo `VITE_API_URL` trỏ đúng về backend (mặc định là port 3000):
    ```env
    VITE_API_URL=http://localhost:3000
    VITE_BACKEND_URL=http://localhost:3000
    ```

---

## 🗄️ 4. Khởi Tạo Cơ Sở Dữ Liệu (Database)

Trước khi chạy server, bạn cần có database.

1.  **Tạo Database rỗng**:
    *   Mở **pgAdmin** hoặc dùng terminal `psql`.
    *   Tạo một database mới tên là `restaurant_db` (trùng với `DATABASE_NAME` trong file `.env` backend).
    *   *Lệnh SQL*: `CREATE DATABASE restaurant_db;`

2.  **Khởi tạo Bảng & Dữ liệu mẫu (Migration & Seed)**:
    Tại thư mục `packages/backend`, chạy lệnh sau để nạp dữ liệu Admin và Menu mẫu:
    ```bash
    npm run seed
    ```
    *Lưu ý: Lệnh này sẽ tự động kết nối và tạo dữ liệu. Nếu lỗi, hãy kiểm tra lại username/password trong file `.env`.*

---

## 🚀 5. Chạy Ứng Dụng

Bạn cần mở **2 cửa sổ Terminal** riêng biệt để chạy song song Backend và Frontend.

### Terminal 1: Chạy Backend
```bash
cd packages/backend
npm run start:dev
```
*   Khi thấy dòng chữ `Nest application successfully started`, nghĩa là Backend đã chạy tại `http://localhost:3000`.

### Terminal 2: Chạy Frontend
```bash
cd packages/frontend
npm run dev
```
*   Frontend sẽ chạy tại `http://localhost:5173` (hoặc port khác nếu 5173 bận).

---

## ✅ 6. Kiểm Tra & Sử Dụng

Truy cập trình duyệt tại địa chỉ Frontend (thường là **http://localhost:5173**).

**Tài khoản Test mặc định (nếu đã chạy seed):**
*   **Admin**:
    *   Email: `admin@example.com`
    *   Password: `admin123`
*   **Waiter**: `waiter@example.com` / `waiter123`
*   **Kitchen**: `kitchen@example.com` / `kitchen123`

---

## ❓ Xử Lý Lỗi Thường Gặp (Troubleshooting)

1.  **Lỗi kết nối Database (`ECONNREFUSED`...)**:
    *   Kiểm tra xem PostgreSQL có đang chạy không.
    *   Kiểm tra `DATABASE_USERNAME` và `DATABASE_PASSWORD` trong `.env` backend có đúng không.

2.  **Lỗi thiếu bảng (Table not found)**:
    *   Đảm bảo `DB_SYNC=true` trong lần chạy đầu tiên.
    *   Hoặc chạy `npm run migration:run` (nếu có cấu hình migration).

3.  **Lỗi thiếu Module (Cannot find module...)**:
    *   Hãy chắc chắn bạn đã chạy `npm install` trong cả 2 thư mục `packages/backend` và `packages/frontend`.
