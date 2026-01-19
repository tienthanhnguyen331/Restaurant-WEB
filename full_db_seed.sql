-- 1. SEED USERS (Password: 'password123')
INSERT INTO "users" (name, email, password, role, avatar, is_verified) VALUES
('System Admin', 'admin@restaurant.com', '$2b$10$8tSKu5yIwiLLPHHQDC5Zj.zn0n.Vgk5gPHzrmYW7h.V2f29C7RWkO', 'ADMIN', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', true),
('Tin', 'tin@gmail.com', '$2b$10$8tSKu5yIwiLLPHHQDC5Zj.zn0n.Vgk5gPHzrmYW7h.V2f29C7RWkO', 'USER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=John', true),
('Waiter Staff', 'waiter@restaurant.com', '$2b$10$8tSKu5yIwiLLPHHQDC5Zj.zn0n.Vgk5gPHzrmYW7h.V2f29C7RWkO', 'WAITER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Waiter', true),
('Kitchen Staff', 'kitchen@restaurant.com', '$2b$10$8tSKu5yIwiLLPHHQDC5Zj.zn0n.Vgk5gPHzrmYW7h.V2f29C7RWkO', 'KITCHEN_STAFF', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kitchen', true)
ON CONFLICT (email) DO NOTHING;

-- 2. SEED TABLES
INSERT INTO tables (id, capacity, location, status, qr_token, "createdAt", "updatedAt", description, table_number)
VALUES
  ('092344aa-8b6e-42cd-854b-e152b29bda1f', 7, 'Tang 1', 'active', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwOTIzNDRhYS04YjZlLTQyY2QtODU0Yi1lMTUyYjI5YmRhMWYiLCJ0YWJsZU51bWJlciI6MTAsInJlc3RhdXJhbnRJZCI6ImRlZmF1bHQiLCJpYXQiOjE3NjgyODQ4OTgsImV4cCI6NDkyMTg4NDg5OH0.NP-l3P3vfJh-bTauWNO5bkdvPJ5YHtREmRiAJ4sm3iM', NOW(), NOW(), 'Bàn lớn', 10),
  ('aa096844-2bc7-4782-bf01-9b32e6718707', 4, 'Tang 1', 'active', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhYTA5Njg0NC0yYmM3LTQ3ODItYmYwMS05YjMyZTY3MTg3MDciLCJ0YWJsZU51bWJlciI6MSwicmVzdGF1cmFudElkIjoiZGVmYXVsdCIsImlhdCI6MTc2NzQ5NDY3MywiZXhwIjo0OTIxMDk0NjczfQ.Uswwv0ODB9O7FzWMO7JA30XWf7z_Zg5ibJcLhwdi_YA', NOW(), NOW(), 'Gần cửa sổ', 1),
  ('fc291e8a-f592-46af-a7bc-a52b4ab254db', 4, 'Tang 1', 'active', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmYzI5MWU4YS1mNTkyLTQ2YWYtYTdiYy1hNTJiNGFiMjU0ZGIiLCJ0YWJsZU51bWJlciI6MiwicmVzdGF1cmFudElkIjoiZGVmYXVsdCIsImlhdCI6MTc2NzQ5NDc5NCwiZXhwIjo0OTIxMDk0Nzk0fQ.7NkQ6AcCbtMhhDKLiQpDQRPMd3gjUSFvA_mSweZpRvA', NOW(), NOW(), NULL, 2)
ON CONFLICT (id) DO NOTHING;

-- 3. SEED MENU CATEGORIES
INSERT INTO menu_categories (id, restaurant_id, name, status, display_order, created_at, updated_at)
VALUES
  ('f2415e64-3c10-4328-a4bd-38ccf73bceb5', '00000000-0000-0000-0000-000000000000', 'Fast Food', 'active', 1, NOW(), NOW()),
  ('8faf5753-52e1-4ea7-8d50-9634a3a15bbb', '00000000-0000-0000-0000-000000000000', 'Vietnamese', 'active', 2, NOW(), NOW()),
  ('cb66c5f5-9adf-4b6c-9293-ab91218e67cc', '00000000-0000-0000-0000-000000000000', 'Drinks', 'active', 3, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 4. SEED MENU ITEMS
INSERT INTO menu_items (id, restaurant_id, category_id, name, price, status, created_at, updated_at)
VALUES
  ('607944e6-7b74-4cd2-8d51-972e67711111', '00000000-0000-0000-0000-000000000000', 'f2415e64-3c10-4328-a4bd-38ccf73bceb5', 'Khoai tây chiên', 20000, 'available', NOW(), NOW()),
  ('88d458d4-ece1-4e22-9532-dd11e11ebebb', '00000000-0000-0000-0000-000000000000', '8faf5753-52e1-4ea7-8d50-9634a3a15bbb', 'Phở tái', 50000, 'available', NOW(), NOW()),
  ('c5c45578-e427-4860-be40-6df1f9722666', '00000000-0000-0000-0000-000000000000', 'cb66c5f5-9adf-4b6c-9293-ab91218e67cc', 'Coca Cola', 10000, 'available', NOW(), NOW()),
  ('da5cc01b-2cdf-4aa8-b296-7cd221241cfd', '00000000-0000-0000-0000-000000000000', 'f2415e64-3c10-4328-a4bd-38ccf73bceb5', 'Hamburger bò', 100000, 'available', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
