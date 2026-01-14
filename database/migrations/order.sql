-- database/migrations/order.sql

-- Đảm bảo tất cả giá trị status đều hợp lệ trước khi chuyển sang ENUM
UPDATE orders
SET status = 'PENDING'
WHERE status NOT IN ('PENDING', 'ACCEPTED', 'REJECTED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED');

-- Nếu cột status đang là text/varchar, chuyển sang ENUM order_status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE order_status AS ENUM (
            'PENDING', 'ACCEPTED', 'REJECTED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED'
        );
    END IF;
    BEGIN
        ALTER TABLE orders ALTER COLUMN status TYPE order_status USING status::order_status;
    EXCEPTION WHEN others THEN
        -- Nếu đã là ENUM đúng thì bỏ qua lỗi
        NULL;
    END;
END $$;

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id INT NOT NULL,
    status order_status NOT NULL DEFAULT 'PENDING',
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index để tối ưu truy vấn
CREATE INDEX IF NOT EXISTS idx_orders_table_id ON orders(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);