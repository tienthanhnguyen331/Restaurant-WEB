-- Seed menu_categories
INSERT INTO menu_categories (id, restaurant_id, name, status, display_order, created_at, updated_at)
VALUES
  ('f2415e64-3c10-4328-a4bd-38ccf73bceb5', '00000000-0000-0000-0000-000000000000', 'Fast Food', 'active', 1, NOW(), NOW()),
  ('8faf5753-52e1-4ea7-8d50-9634a3a15bbb', '00000000-0000-0000-0000-000000000000', 'Vietnamese', 'active', 2, NOW(), NOW()),
  ('cb66c5f5-9adf-4b6c-9293-ab91218e67cc', '00000000-0000-0000-0000-000000000000', 'Drinks', 'active', 3, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
