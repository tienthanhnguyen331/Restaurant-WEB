import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import React from 'react';

// Admin
import { AdminPage } from './features/admin-dashboard/AdminPage';
//import { ProfilePage } from './features/admin-dashboard/ProfilePage';
import AdminLayout from './components/AdminLayout';
import { CategoryPage } from './features/admin-menu/CategoryPage';
import { PhotoPage } from './features/admin-menu/PhotoPage';
import { MenuItemsPage } from './features/admin-menu/MenuItemsPage';
import ModifierManager from './features/admin-modifiers/ModifierManager';
import AttachModifiersToItem from './features/admin-modifiers/AttachModifiersToItem';
import { OrderHistoryPage } from './features/order/OrderHistoryPage';
import { AdminReviewsPage } from './features/review/AdminReviewsPage';
import { ReportPage } from './features/report/ReportPage';
import { AdminProfilePage } from './features/admin-profile/AdminProfilePage';
import AccountManagementPage from './modules/admin/pages/AccountManagementPage';
// Waiter & Kitchen
import { WaiterRoutes } from './features/waiter/waiter.routes';
import { KitchenRoutes } from './features/kitchen/kitchen.routes';

// Auth
import { LoginScreen } from './features/auth/LoginScreen';
import { RegisterScreen } from './features/auth/RegisterScreen';
import { ForgotPasswordScreen } from './features/auth/ForgotPasswordScreen';
import { ResetPasswordScreen } from './features/auth/ResetPasswordScreen';

// Customer / Guest
import { ScanPage } from './features/customer-view/ScanPage';
import GuestMenuPage from './features/guest-menu/GuestMenuPage';
import PaymentPage from './features/payment/PaymentPage';

//import tạm để test
import { ReviewPage } from './features/review/ReviewPage';
import { GuestOrderStatus } from './features/guest-menu/components/GuestOrderStatus'; // Import component mới
/* =======================
   PROTECTED ROUTE
======================= */
import { getAccessTokenByRole } from './features/auth/hooks/useAuth';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = getAccessTokenByRole();
  const location = useLocation();

  if (!token) {
    // Xóa tất cả token các role khi không xác định được role hiện tại (bảo vệ route)
    ['USER','ADMIN','KITCHEN','WAITER'].forEach(r => localStorage.removeItem(`access_token_${r}`));
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

/* =======================
   APP
======================= */
function App() {
  return (
    <Routes>
      {/* ===== PUBLIC ROUTES ===== */}
      <Route path="/reviews" element={<ReviewPage />} />
      <Route path="/login" element={<LoginScreen onLoginSuccess={() => { /* handle login success, e.g. redirect or set state */ }} />} />
      <Route path="/register" element={<RegisterScreen />} />
      <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
      <Route path="/reset-password" element={<ResetPasswordScreen />} />
      <Route path="/menu" element={<ScanPage />} />
      <Route path="/guest-menu" element={<GuestMenuPage />} />
      <Route path="/guest/order-status" element={<GuestOrderStatus />} /> {/* Route test mới */}
      <Route path="/payment" element={<PaymentPage />} />

      {/* ===== WAITER ROUTES (PROTECTED) ===== */}
      <Route path="/waiter/*" element={<ProtectedRoute><WaiterRoutes /></ProtectedRoute>} />

      {/* ===== KITCHEN ROUTES (PROTECTED) ===== */}
      <Route path="/kitchen/*" element={<ProtectedRoute><KitchenRoutes /></ProtectedRoute>} />

      {/* ===== ADMIN ROUTES (PROTECTED) ===== */}
      <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        {/* Dashboard */}
        <Route
          index
          element={
            <div className="p-8">
              <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">
                  Manage your restaurant tables
                </p>
              </header>
              <AdminPage />
            </div>
          }
        />

        {/* Categories */}
        <Route
          path="categories"
          element={
            <div className="p-8">
              <CategoryPage />
            </div>
          }
        />

        {/* Photos */}
        <Route
          path="photos"
          element={
            <div className="p-8">
              <PhotoPage />
            </div>
          }
        />

        {/* Account Management */}
        <Route
          path="accounts"
          element={
            <div className="p-8">
              <AccountManagementPage />
            </div>
          }
        />
        <Route path="photos/:itemId" element={<PhotoPage />} />

        {/* Menu Items */}
        <Route
          path="items"
          element={
            <div className="p-8">
              <MenuItemsPage />
            </div>
          }
        />

        {/* Modifiers */}
        <Route
          path="modifiers"
          element={
            <div className="p-8">
              <ModifierManager />
            </div>
          }
        />
        <Route
          path="modifiers/attach"
          element={
            <div className="p-8">
              <AttachModifiersToItem />
            </div>
          }
        />

        {/* Orders */}
        <Route
          path="orders"
          element={
            <div className="p-8">
              <OrderHistoryPage />
            </div>
          }
        />

        {/* Reviews */}
        <Route
          path="reviews"
          element={
            <div className="p-8">
              <AdminReviewsPage />
            </div>
          }
        />

        {/* Reports */}
        <Route
          path="reports"
          element={
            <div className="p-8">
              <ReportPage />
            </div>
          }
        />

        {/* Profile */}
        <Route
          path="profile"
          element={
            <AdminProfilePage />
          }
        />
      </Route>

      {/* ===== DEFAULT ===== */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<h2 className="text-red-500 p-8">404 - Not Found</h2>} />
    </Routes>
  );
}

export default App;
