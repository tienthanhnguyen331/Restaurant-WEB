# Restaurant Management System (Web Application)

## 📝 Project Overview
A modern, full-featured Restaurant Management System built as a monorepo, supporting seamless table management (QR Code), digital menu, real-time ordering, payment integration (Stripe/MoMo), and advanced reporting. The system is designed for both restaurant staff and customers, providing a smooth dine-in experience and efficient admin operations.

---

## 🚦 Prerequisites
- **Node.js** v18 or higher
- **PostgreSQL** (ensure the service is running)
- **npm** or **yarn** (package manager)

---


## 🚀 Installation & Setup (Step-by-step)

### 1. Clone the repository
```bash
git clone <YOUR_REPO_URL>
cd Restaurant-WEB
```

### 2. Install dependencies
```bash
# Backend
cd packages/backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configure environment variables (.env)
#### Backend:
```bash
cd packages/backend
cp .env.example .env
```
Mở file `.env` vừa copy và điền các biến sau:
- `DATABASE_URL` – Chuỗi kết nối PostgreSQL (ví dụ: `postgres://user:pass@localhost:5432/restaurant`)
- `JWT_SECRET` – Chuỗi bí mật cho xác thực JWT
- `CLOUDINARY_URL` – Đường dẫn Cloudinary cho upload ảnh
- `STRIPE_KEY` – Stripe secret key cho thanh toán

> **Lưu ý:** Nếu chưa có tài khoản Cloudinary/Stripe, bạn có thể để trống hoặc dùng test key để thử nghiệm.

#### Frontend (nếu có .env.example):
```bash
cd ../frontend
cp .env.example .env
# (Điền các biến nếu cần thiết)
```

---

### 4. Database Migration (Tạo bảng)
Đảm bảo PostgreSQL đã chạy và đã tạo database trống tên phù hợp với `DATABASE_URL`.
```bash
cd packages/backend
npm run migration:run
```

### 5. Seed Sample Data (Tạo dữ liệu mẫu)
```bash
npm run seed (nếu đã cài npm install pg bằng npm install pg)
```
> **Bắt buộc:** Nếu không chạy seed, hệ thống sẽ không có tài khoản, menu, bàn mẫu để test.

---

### 6. Start the Application
#### Backend (Development mode):
```bash
cd packages/backend
npm run start:dev
```
#### Frontend:
```bash
cd packages/frontend
npm run dev
```

---

### 7. Access the App
- Frontend: [http://localhost:5173/](http://localhost:5173/)
- Backend API: [http://localhost:3000](http://localhost:3000) (mặc định)

---

---

## ⚙️ Configuration (Environment Variables)
1. **Copy example env files:**
   ```bash
   # Backend
   cd packages/backend
   cp .env.example .env
   # Frontend (if needed)
   cd ../frontend
   cp .env.example .env
   ```
2. **Fill in the required variables in `.env` (backend):**
   - `DATABASE_URL` – PostgreSQL connection string (e.g. `postgres://user:pass@localhost:5432/restaurant`)
   - `JWT_SECRET` – Secret key for authentication
   - `CLOUDINARY_URL` – Cloudinary API URL for image uploads
   - `STRIPE_KEY` – Stripe secret key for payment integration

---

## 🗄️ Database Setup
1. **Run database migrations:**
   ```bash
   cd packages/backend
   npm run migration:run
   ```
2. **Seed sample data (Admin, Menu, Table, etc.):**
   ```bash
   npm run seed
   ```
   > **Note:** You must run the seed command to have test data. Without it, the system will not have any users, menu, or tables for testing.

---

## 🏃 Running the App
1. **Start Backend (Development mode):**
   ```bash
   cd packages/backend
   npm run start:dev
   ```
2. **Start Frontend:**
   ```bash
   cd packages/frontend
   npm run dev
   ```
3. **Access the app locally:**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:4000](http://localhost:4000) (default)

---

## 🌐 Live Demo & Testing Credentials
- **Public Link:** [https://restaurant-web-2t3m.vercel.app/admin](https://restaurant-web-2t3m.vercel.app/admin)

**Sample Accounts:**
- **Admin:**
  - Username: `admin@example.com`
  - Password: `admin123`
- **Waiter:**
  - Username: `waiter@example.com`
  - Password: `waiter123`
- **Kitchen:**
  - Username: `kitchen@example.com`
  - Password: `kitchen123`

---

## 📁 Project Structure
```
Restaurant-WEB/
├── packages/
│   ├── backend/   # NestJS backend (API, business logic, migrations, seeders)
│   └── frontend/  # React + Vite frontend (UI, client logic)
├── database/      # SQL migration & seed scripts
├── docs/          # Technical and user documentation
└── ...            # Project root files (README, configs, etc.)
```

---

## 💡 Notes
- Always ensure PostgreSQL is running before starting the backend.
- For image upload, configure your Cloudinary account and set the `CLOUDINARY_URL`.
- For payment, use your Stripe/MoMo test keys.
- For any issues, check the logs in the backend terminal for detailed error messages.

---

