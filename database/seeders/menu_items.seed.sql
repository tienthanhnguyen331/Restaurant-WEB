-- Seed menu_items
INSERT INTO menu_items (id, restaurant_id, category_id, name, price, status, created_at, updated_at)
VALUES
  ('607944e6-7b74-4cd2-8d51-972e67711111', '00000000-0000-0000-0000-000000000000', 'f2415e64-3c10-4328-a4bd-38ccf73bceb5', 'khoai tây chiên', 20000, 'available', NOW(), NOW()),
  ('88d458d4-ece1-4e22-9532-dd11e11ebebb', '00000000-0000-0000-0000-000000000000', '8faf5753-52e1-4ea7-8d50-9634a3a15bbb', 'phở tái', 50000, 'available', NOW(), NOW()),
  ('c5c45578-e427-4860-be40-6df1f9722666', '00000000-0000-0000-0000-000000000000', 'cb66c5f5-9adf-4b6c-9293-ab91218e67cc', 'cola', 10000, 'available', NOW(), NOW()),
  ('da5cc01b-2cdf-4aa8-b296-7cd221241cfd', '00000000-0000-0000-0000-000000000000', 'f2415e64-3c10-4328-a4bd-38ccf73bceb5', 'hamburger', 100000, 'available', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
