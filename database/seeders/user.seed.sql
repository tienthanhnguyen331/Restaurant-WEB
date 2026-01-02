-- Password: 'password123' (hashed with bcrypt)
INSERT INTO "users" (name, email, password, role, avatar) VALUES
('System Admin', 'admin@restaurant.com', '$2b$10$qm/duaKdrPTnTzriATDAIu0CHaqNUt7fJ.X0HuJyMhzXz9.QGCXue', 'ADMIN', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'),
('Tin', 'tin@gmail.com', '$2b$10$qm/duaKdrPTnTzriATDAIu0CHaqNUt7fJ.X0HuJyMhzXz9.QGCXue', 'USER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=John')
