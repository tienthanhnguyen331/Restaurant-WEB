# 🚀 Hướng Dẫn Deploy Backend lên Render

## Bước 1: Tạo Database trên Neon

1. Truy cập [neon.tech](https://neon.tech) → Đăng ký/Đăng nhập
2. **Create new project**:
   - Name: `restaurant-db`
   - Region: **Singapore** (gần VN)
3. Sau khi tạo xong, lưu lại **Connection Details**:
   - Host: `ep-xxx.region.aws.neon.tech`
   - Database: `neondb`
   - Username: `neondb_owner`
   - Password: `(chuỗi ngẫu nhiên)`

---

## Bước 2: Push Code lên GitHub

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

---

## Bước 3: Tạo Web Service trên Render

1. Truy cập [render.com](https://render.com) → Đăng ký bằng GitHub
2. **New** → **Web Service**
3. Chọn repo `Restaurant-WEB`
4. Cấu hình:

| Setting | Value |
|---------|-------|
| **Name** | `restaurant-backend` |
| **Region** | Singapore |
| **Root Directory** | `packages/backend` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start:prod` |

---

## Bước 4: Thêm Environment Variables

Vào **Environment** → **Add Environment Variable** và thêm:

### Database (Neon)
| Key | Value |
|-----|-------|
| `DATABASE_HOST` | `ep-xxx.aws.neon.tech` (từ Neon) |
| `DATABASE_PORT` | `5432` |
| `DATABASE_USERNAME` | `neondb_owner` (từ Neon) |
| `DATABASE_PASSWORD` | `(password từ Neon)` |
| `DATABASE_NAME` | `neondb` |
| `DATABASE_SSL` | `true` |
| `DB_SYNC` | `true` ⚠️ Đổi thành `false` sau lần deploy đầu |

### App Config
| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `JWT_SECRET` | `(chuỗi bí mật bất kỳ, ít nhất 32 ký tự)` |
| `JWT_EXPIRES_IN` | `7d` |
| `FRONTEND_URL` | `https://ten-frontend.vercel.app` |

### Email (Gmail SMTP)
| Key | Value |
|-----|-------|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_SECURE` | `false` |
| `SMTP_USER` | `your-email@gmail.com` |
| `SMTP_PASSWORD` | `(App Password từ Google)` |
| `EMAIL_FROM` | `noreply@restaurant.com` |

### Cloudinary (Upload ảnh)
| Key | Value |
|-----|-------|
| `CLOUDINARY_CLOUD_NAME` | `(từ Cloudinary Dashboard)` |
| `CLOUDINARY_API_KEY` | `(từ Cloudinary Dashboard)` |
| `CLOUDINARY_API_SECRET` | `(từ Cloudinary Dashboard)` |

---

## Bước 5: Deploy

1. Click **Create Web Service**
2. Chờ build và deploy (khoảng 3-5 phút)
3. Sau khi xong, bạn sẽ có URL: `https://restaurant-backend.onrender.com`

---

## Bước 6: Test API

Truy cập: `https://restaurant-backend.onrender.com/api`

Nếu thấy response (dù là 404 hoặc JSON), nghĩa là server đã chạy!

---

## ⚠️ Lưu ý quan trọng

1. **Sau lần deploy đầu tiên**: Vào Environment Variables → đổi `DB_SYNC` thành `false` để không bị reset database
2. **Free tier Render**: Server sẽ sleep sau 15 phút không hoạt động, request đầu tiên sẽ chậm (~30s)
3. **Xem logs**: Nếu có lỗi, vào Dashboard → **Logs** để debug

---

## Tiếp theo: Deploy Frontend

Sau khi có URL backend, tiếp tục deploy frontend lên Vercel với biến:
```
VITE_API_URL=https://restaurant-backend.onrender.com
```
