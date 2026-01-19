# 🚀 Hướng Dẫn Deploy Frontend lên Vercel

Backend URL của bạn: `https://restaurant-backend-xgx8.onrender.com`

---

## Bước 1: Chuẩn bị trên Vercel

1. Truy cập [vercel.com](https://vercel.com) → Đăng nhập bằng GitHub.
2. Tại màn hình Dashboard, bấm **Add New...** → **Project**.
3. Chọn Repository `Restaurant-WEB` và bấm **Import**.

## Bước 2: Cấu hình Project (QUAN TRỌNG)

Tại màn hình cấu hình ("Configure Project"), bạn cần chỉnh các mục sau:

### 1. Framework Preset
*   Chọn: **Vite** (Vercel thường tự nhận diện, nhưng hãy kiểm tra cho chắc).

### 2. Root Directory (Bắt buộc)
*   Bấm **Edit** ở mục Root Directory.
*   Chọn thư mục: `packages/frontend`.
*   *(Vì đây là monorepo, frontend nằm trong thư mục con này)*.

### 3. Environment Variables (Biến môi trường)
Bấm mở rộng mục **Environment Variables** và thêm các biến sau (Copy paste y chang nhé):

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://restaurant-backend-xgx8.onrender.com` |
| `VITE_BACKEND_URL` | `https://restaurant-backend-xgx8.onrender.com` |
| `VITE_WS_URL` | `https://restaurant-backend-xgx8.onrender.com` |
| `VITE_SOCKET_URL` | `https://restaurant-backend-xgx8.onrender.com` |

*(Note: Nếu sau này bạn mua tên miền riêng cho backend, nhớ vào đây update lại)*.

---

## Bước 3: Deploy

1. Bấm nút **Deploy**.
2. Chờ Vercel build (khoảng 1-2 phút).
3. Sau khi xong, màn hình sẽ bắn pháo hoa 🎉 và bạn nhận được link Frontend (ví dụ: `https://restaurant-web-xyz.vercel.app`).

---

## Bước 4: Update Backend (Để login hoạt động)

Sau khi có link Frontend từ Vercel (ví dụ: `https://frontend-cua-ban.vercel.app`), bạn cần quay lại Render để cấu hình CORS cho Backend:

1. Vào Render Dashboard → Chọn `restaurant-backend`.
2. Vào tab **Environment**.
3. Tìm biến `FRONTEND_URL` và sửa App Value thành link Vercel của bạn.
   *   Ví dụ: `https://frontend-cua-ban.vercel.app` (không có dấu `/` ở cuối).
4. Kéo xuống dưới bấm **Save Changes**.

🚀 **Hoàn tất! Hệ thống của bạn đã Live.**
