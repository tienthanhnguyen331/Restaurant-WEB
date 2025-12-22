import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminPage } from './features/admin-dashboard/AdminPage';
import { ScanPage } from './features/customer-view/ScanPage';
import ModifierManager from './features/admin-modifiers/ModifierManager';
import AttachModifiersToItem from './features/admin-modifiers/AttachModifiersToItem';
import GuestMenuPage from './features/guest-menu/GuestMenuPage';
import AdminLayout from './components/AdminLayout';

function App() {
  return (
    <Routes>
      {/* Admin Routes with Sidebar */}
      <Route path="/admin" element={
        <AdminLayout>
          <div className="p-8">
            <header className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Manage your restaurant tables</p>
            </header>
            <AdminPage />
          </div>
        </AdminLayout>
      } />
      
      <Route path="/admin/modifiers" element={
        <AdminLayout>
          <div className="p-8">
            <header className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                Modifier Management
              </h1>
              <p className="text-gray-600 mt-1">Create and manage modifier groups & options</p>
            </header>
            <ModifierManager />
          </div>
        </AdminLayout>
      } />

      <Route path="/admin/modifiers/attach" element={
        <AdminLayout>
          <div className="p-8">
            <header className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                Gắn Modifiers vào Món
              </h1>
              <p className="text-gray-600 mt-1">Chọn modifier groups và gắn vào món theo Item ID</p>
            </header>
            <AttachModifiersToItem />
          </div>
        </AdminLayout>
      } />
      
      {/* Placeholder routes for future features */}
      <Route path="/admin/categories" element={
        <AdminLayout>
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Categories Management
            </h1>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <p className="text-yellow-800">
                🚧 Coming soon - Categories CRUD (Person 1)
              </p>
            </div>
          </div>
        </AdminLayout>
      } />
      
      <Route path="/admin/items" element={
        <AdminLayout>
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Menu Items Management
            </h1>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <p className="text-yellow-800">
                🚧 Coming soon - Menu Items CRUD (Person 2)
              </p>
            </div>
          </div>
        </AdminLayout>
      } />
      
      <Route path="/admin/photos" element={
        <AdminLayout>
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Photo Management
            </h1>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <p className="text-yellow-800">
                🚧 Coming soon - Photos Upload & Management (Person 1)
              </p>
            </div>
          </div>
        </AdminLayout>
      } />
      
      {/* Tuyến đường cho Khách hàng quét QR (Người 2) - Không có header admin */}
      <Route path="/menu" element={<ScanPage />} />
      
      {/* Guest Menu (Public) */}
      <Route path="/guest-menu" element={<GuestMenuPage />} />

      {/* Chuyển hướng mặc định về trang Admin Dashboard */}
      <Route path="/" element={<Navigate to="/admin" replace />} />
      
      {/* Tuyến đường 404 cơ bản */}
      <Route path="*" element={<h2 className="text-red-500 p-8">404 - Not Found</h2>} />
    </Routes>
  );
}

export default App;