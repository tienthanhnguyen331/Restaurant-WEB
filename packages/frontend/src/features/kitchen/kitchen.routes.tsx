import { Routes, Route } from 'react-router-dom';
import { KitchenDashboard } from './pages/KitchenDashboard';

export const KitchenRoutes = () => {
  return (
    <Routes>
      <Route index element={<KitchenDashboard />} />
    </Routes>
  );
};
