# Hướng dẫn setup & sử dụng chức năng Payment (Tuần 2: MoMo Integration)

## 1. Chuẩn bị Database

### Migration bảng payment:
- File: `database/migrations/payment.sql`
- Chạy lệnh (PostgreSQL):
  ```sh
  psql -U <user> -d <db> -f database/migrations/payment.sql
  ```

### Seed dữ liệu mẫu:
- File: `database/seeders/payment.seed.sql`
- Chạy lệnh:
  ```sh
  psql -U <user> -d <db> -f database/seeders/payment.seed.sql
  ```

> Lưu ý: Backend hiện đang lưu payment in-memory (xem `PaymentRepository`), chưa ghi xuống Postgres. Migration/seed mang tính chuẩn bị; để dùng DB thật cần triển khai repository kết nối Postgres.

---

## 2. Cấu hình Backend (NestJS + MoMo)

### 2.1 Chuẩn bị biến môi trường
Cập nhật `packages/backend/.env` với các giá trị MoMo (lưu ý backend đang set global prefix `api`):

```env
# MoMo payment config
MOMO_PARTNER_CODE=MOMO
MOMO_ACCESS_KEY=F8BBA842ECF85
MOMO_SECRET_KEY=K951B6PE1waDMi640xX08PD3vg6EkVlz
MOMO_REDIRECT_URL=http://localhost:3000/api/payment/momo/redirect   # fallback khi không dùng ngrok
MOMO_IPN_URL=http://localhost:3000/api/payment/momo/ipn             # fallback khi không dùng ngrok
MOMO_REQUEST_TYPE=captureWallet
MOMO_ORDER_INFO=pay with MoMo
MOMO_AUTO_CAPTURE=true
MOMO_LANG=vi

# NGROK (chỉ dùng khi chạy local, xem phần 2.2)
NGROK_BASE_URL=
```

### 2.2 Setup NGROK (bắt buộc cho local testing)

**Tại sao cần NGROK?**
- MoMo IPN callback cần HTTPS public URL
- Localhost không thể nhận callback từ MoMo
- NGROK tạo tunnel từ public HTTPS → localhost

**Cài đặt NGROK:**

1.Lên google đăng kí tài khoản ngrok
2. Copy dòng có dạng : ngrok config add-authtoken.....

3. Mở terminal trên máy và chạy dòng vừa copy

4. Chạy NGROK tunnel (backend chạy trên port 3000):
   ```sh
   Đảm bảo backend chạy ở : http://localhost:3000
   Mở terminal MỚI (để backend vẫn chạy), gõ:
    ngrok http 3000
   ```

5. Sẽ nhận URL như: `https://xxxx-xxxx-xxxx.ngrok-free.app`

6. **Cập nhật `.env` backend:**
   ```env
   NGROK_BASE_URL=https://xxxx-xxxx-xxxx.ngrok-free.app
   ```
   → Lúc này `momo.config.ts` sẽ tự sinh (đã bao gồm prefix `api`):
   - `MOMO_REDIRECT_URL = https://xxxx-xxxx-xxxx.ngrok-free.app/api/payment/momo/redirect`
   - `MOMO_IPN_URL = https://xxxx-xxxx-xxxx.ngrok-free.app/api/payment/momo/ipn`
7. **LƯU Ý**
    ```sh
    nếu tắt lệnh ngrok http 3000 thì khi chạy lại sẽ bị reset link, phải gán lại cho file .env
    ```
### 2.3 Chạy Backend
```sh
cd packages/backend
npm install
npm run start:dev
```

Kiểm tra API:
```sh
curl http://localhost:3000/api/payment
```

---

## 3. Cấu hình Frontend (React)

### 3.1 Chuẩn bị biến môi trường
Cập nhật `packages/frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

### 3.2 Chạy Frontend
```sh
cd packages/frontend
npm install
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

---

## 4. API Endpoints MoMo

### 4.1 Tạo Payment MoMo
**Endpoint:** `POST /api/payment/momo/create`

**Request:**
```json
{
  "orderId": "order-123",
  "amount": 100000
}
```

**Response:**
```json
{
  "paymentId": "pay-abc123",
  "orderId": "order-123",
  "requestId": "order-123",
  "momo": {
    "payUrl": "https://test-payment.momo.vn/v2/gateway/api/create?...",
    "deeplink": "momo://...",
    "qrCodeUrl": "data:image/svg+xml;base64,...",
    "resultCode": 0,
    "message": "Success",
    "orderId": "order-123",
    "requestId": "order-123",
    "signature": "..."
  }
}
```
**Có thể dùng payUrl để thực hiện thanh toán trên web desktop**

### 4.2 Nhận IPN Callback từ MoMo
**Endpoint:** `POST /api/payment/momo/ipn`

MoMo sẽ POST callback tới `MOMO_IPN_URL` khi user hoàn thành thanh toán:

**Payload:**
```json
{
  "partnerCode": "MOMO",
  "orderId": "order-123",
  "requestId": "order-123",
  "amount": 100000,
  "orderInfo": "pay with MoMo",
  "resultCode": 0,
  "message": "Success",
  "transId": 123456789,
  "signature": "..."
}
```

**Backend sẽ:**
1. Verify chữ ký HMAC SHA256
2. Cập nhật Payment status: pending → success/failed
3. Cập nhật Order status: pending → completed/cancelled

### 4.3 Query Trạng thái Payment
**Endpoint:** `POST /api/payment/momo/query`

**Request:**
```json
{
  "orderId": "order-123",
  "requestId": "order-123"
}
```

**Response:**
```json
{
  "resultCode": 0,
  "message": "Success",
  "orderId": "order-123",
  "requestId": "order-123",
  "transId": 123456789,
  "amount": 100000,
  "signature": "..."
}
```

---

## 5. Kiểm thử MoMo Flow (Step-by-step)

### 5.1 Chuẩn bị môi trường
1. Chắc NGROK đang chạy:
   ```sh
   ngrok http 3000
   # Lưu URL: https://xxxx-xxxx-xxxx.ngrok-free.app
   ```

2. Cập nhật `.env` backend với `NGROK_BASE_URL` (prefix tự sinh sẽ là `/api/payment/...`)

3. Restart backend:
   ```sh
   cd packages/backend
   npm run start:dev
   ```

4. Chắc frontend đang chạy:
   ```sh
   cd packages/frontend
   npm run dev
   ```

### 5.2 Test Flow
1. Mở frontend: `http://localhost:5173`
2. Tạo order hoặc thêm item vào cart
3. Nhấn button "MoMo" ở PaymentPage
4. Sẽ redirect sang MoMo test portal
5. Chọn phương thức thanh toán (ATM, Wallet, v.v.)
6. Xác nhận → callback về backend
7. Backend update Payment + Order status
8. Frontend nhận status → hiển thị PaymentStatus

### 5.3 Kiểm tra logs
**Backend logs:**
```
[Nest] ... MomoService: Creating payment...
[Nest] ... PaymentService: handleMomoIpn - signature verified
[Nest] ... OrderService: updateStatus - order completed
```

**Database:**
```sql
SELECT * FROM payment WHERE order_id = 'order-123';
SELECT * FROM orders WHERE id = 'order-123';
```
→ Kiểm tra `status` có thay đổi không

---

## 6. Luồng Thanh toán MoMo Chi tiết

```
Frontend (React)
   ↓
   POST /api/payment/momo/create
   {orderId, amount}
   ↓
Backend (NestJS)
   ↓
   MomoService.createPayment()
   ├─ Ký HMAC SHA256
   ├─ POST tới MoMo API
   └─ Nhận payUrl
   ↓
   Return payUrl → Frontend
   ↓
Frontend
   ↓
   Redirect tới payUrl
   ↓
MoMo Portal
   ↓
   User chọn phương thức + xác nhận
   ↓
   POST callback tới MOMO_IPN_URL
   (NGROK tunnel, giá trị thực tế: https://<ngrok>/api/payment/momo/ipn)
   ↓
Backend
   ↓
   PaymentService.handleMomoIpn()
   ├─ Verify signature
   ├─ Update Payment status
   └─ OrderService.updateStatus()
   ↓
Database
   ↓
   Payment: pending → success/failed
   Order: pending → completed/cancelled
```

---

## 7. Cấu trúc File

```
packages/backend/src/modules/payment/
├── momo.service.ts           (ký, verify, call API)
├── payment.service.ts         (create, IPN handler, query, Order sync)
├── payment.controller.ts      (endpoint create/ipn/query)
├── payment.module.ts          (DI setup)
├── config/
│   └── momo.config.ts         (env reader, NGROK support)
├── dto/
│   ├── create-momo-payment.dto.ts
│   ├── momo-ipn.dto.ts
│   └── momo-query.dto.ts
├── strategies/
│   ├── stripe.strategy.ts     (legacy)
│   └── momo.strategy.ts       (legacy)
└── ...

packages/frontend/src/features/payment/
├── services/
│   ├── paymentApi.ts          (generic payment API)
│   └── momoApi.ts             (MoMo specific)
├── hooks/
│   └── usePayment.ts          (pay, payWithMomo)
├── PaymentPage.tsx            (UI + button MoMo)
└── ...
```

---

## 8. Ghi chú & Troubleshooting

### Endpoint hủy thanh toán
- Frontend có hàm `cancelPayment` gọi `POST /api/payment/momo/cancel`, nhưng backend chưa triển khai endpoint này. Nếu cần hủy giao dịch, bổ sung controller hoặc bỏ lời gọi này trên frontend.

### NGROK URL thay đổi
- NGROK free tier tạo URL mới mỗi lần chạy lại
- **Giải pháp:** Upgrade NGROK (paid) để có URL cố định, hoặc
- Update `.env` mỗi lần restart NGROK

### Callback không nhận được
1. Kiểm tra NGROK đang chạy: `ngrok http 3000`
2. Kiểm tra backend port 3000 online
3. Kiểm tra `NGROK_BASE_URL` đúng trong `.env`
4. Test redirect URL: `curl https://xxxx.ngrok-free.app/api/payment/momo/ipn` (phải có response từ backend)

### Signature verification fail
1. Kiểm tra `MOMO_SECRET_KEY` đúng
2. Kiểm tra order của payload match với DB
3. Kiểm tra MomoService.verifyIpnSignature() logic

### Order không update
1. Kiểm tra `OrderModule` imported trong `PaymentModule`
2. Kiểm tra `OrderService` injected đúng
3. Kiểm tra order ID tồn tại trong DB

---

## 9. Production Deployment

**Trước khi deploy lên production:**

1. **Đổi credentials MoMo:**
   - Production Partner Code, Access Key, Secret Key từ MoMo
   - Không dùng test credentials

2. **Cấu hình HTTPS:**
   - Domain phải có SSL
   - `MOMO_REDIRECT_URL` = `https://yourdomain.com/api/payment/momo/redirect`
   - `MOMO_IPN_URL` = `https://yourdomain.com/api/payment/momo/ipn`

3. **Xóa NGROK:**
   - Không cần NGROK ở production
   - `NGROK_BASE_URL` = `` (empty)

4. **Enable HTTPS:**
   - Frontend dùng https://yourdomain.com
   - Backend dùng https://yourdomain.com

---


