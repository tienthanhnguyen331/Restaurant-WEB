import { Routes, Route } from 'react-router-dom';
import { WaiterDashboard } from './pages/WaiterDashboard';
import { OrderDetail } from './pages/OrderDetail';

export const WaiterRoutes = () => {
  return (
    <Routes>
      <Route index element={<WaiterDashboard />} />
      <Route path="orders/:id" element={<OrderDetail />} />
    </Routes>
  );
};
