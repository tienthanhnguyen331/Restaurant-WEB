-- Password: 'password123' (hashed with bcrypt)
INSERT INTO "users" (name, email, password, role, avatar) VALUES
('System Admin', 'admin@restaurant.com', '$2b$10$8tSKu5yIwiLLPHHQDC5Zj.zn0n.Vgk5gPHzrmYW7h.V2f29C7RWkO', 'ADMIN', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'),
('Tin', 'tin@gmail.com', '$2b$10$8tSKu5yIwiLLPHHQDC5Zj.zn0n.Vgk5gPHzrmYW7h.V2f29C7RWkO', 'USER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'),
('Waiter Staff', 'waiter@restaurant.com', '$2b$10$8tSKu5yIwiLLPHHQDC5Zj.zn0n.Vgk5gPHzrmYW7h.V2f29C7RWkO', 'WAITER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Waiter'),
('Kitchen Staff', 'kitchen@restaurant.com', '$2b$10$8tSKu5yIwiLLPHHQDC5Zj.zn0n.Vgk5gPHzrmYW7h.V2f29C7RWkO', 'KITCHEN_STAFF', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kitchen')
ON CONFLICT (email) DO NOTHING;
