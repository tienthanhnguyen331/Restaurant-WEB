-- Seed dữ liệu mẫu cho bảng order_items
-- Lưu ý: Chạy sau khi đã có dữ liệu trong bảng orders và menu_items

-- Thêm chi tiết đơn hàng mẫu (order_items) tương ứng
INSERT INTO order_items (order_id, menu_item_id, quantity, price, notes, created_at) VALUES
-- Order 2: COMPLETED
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', '607944e6-7b74-4cd2-8d51-972e67711111', 2, 50000, NULL, '2025-12-16 10:00:00'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', '88d458d4-ece1-4e22-9532-dd11e11ebebb', 1, 50000, NULL, '2025-12-16 10:00:00'),
-- Order 12: COMPLETED
('12eebc99-9c0b-4ef8-bb6d-6bb9bd380a99', 'c5c45578-e427-4860-be40-6df1f9722666', 3, 10000, NULL, '2025-12-23 17:00:00'),
('12eebc99-9c0b-4ef8-bb6d-6bb9bd380a99', '607944e6-7b74-4cd2-8d51-972e67711111', 1, 20000, NULL, '2025-12-23 17:00:00'),
-- Order 19: COMPLETED
('19eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'da5cc01b-2cdf-4aa8-b296-7cd221241cfd', 1, 100000, NULL, '2025-12-30 14:00:00'),
('19eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', '88d458d4-ece1-4e22-9532-dd11e11ebebb', 2, 40000, NULL, '2025-12-30 14:00:00'),
-- Order 26: COMPLETED
('26eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', '607944e6-7b74-4cd2-8d51-972e67711111', 2, 20000, NULL, '2026-01-06 11:00:00'),
('26eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'c5c45578-e427-4860-be40-6df1f9722666', 1, 10000, NULL, '2026-01-06 11:00:00'),
-- Order 33: COMPLETED
('33eebc99-9c0b-4ef8-bb6d-6bb9bd380a30', '88d458d4-ece1-4e22-9532-dd11e11ebebb', 1, 50000, NULL, '2026-01-13 18:00:00'),
('33eebc99-9c0b-4ef8-bb6d-6bb9bd380a30', 'da5cc01b-2cdf-4aa8-b296-7cd221241cfd', 1, 100000, NULL, '2026-01-13 18:00:00'),
-- Order mới: 47 order rải đều, ví dụ cho 2 order COMPLETED khác
('a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a99', '607944e6-7b74-4cd2-8d51-972e67711111', 1, 30000, NULL, '2025-12-24 10:00:00'),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a99', '88d458d4-ece1-4e22-9532-dd11e11ebebb', 2, 40000, NULL, '2025-12-25 11:00:00')
;
