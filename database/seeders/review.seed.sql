-- Thêm dữ liệu mẫu cho reviews
-- Giả sử menu_item_id và user_id đã tồn tại trong DB
INSERT INTO reviews (id, user_id, menu_item_id, rating, comment) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
	'00000000-0000-0000-0000-000000000001',
	'607944e6-7b74-4cd2-8d51-972e67711111', 
	5, 
	'Món ăn rất ngon, phục vụ tốt!'),

('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 
	'00000000-0000-0000-0000-000000000002', 
	'88d458d4-ece1-4e22-9532-dd11e11ebebb', 
	4, 
	'Khá ổn, sẽ quay lại lần sau.'),

('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 
	'00000000-0000-0000-0000-000000000003', 
	'c5c45578-e427-4860-be40-6df1f9722666', 
	3, 
	'Bình thường, chưa có gì đặc biệt.');