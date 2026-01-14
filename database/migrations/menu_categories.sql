-- Migration: Tạo bảng menu_categories

CREATE TABLE IF NOT EXISTS menu_categories (
    id uuid PRIMARY KEY,
    restaurant_id uuid NOT NULL,
    display_order integer DEFAULT 0,
    is_deleted boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT NOW(),
    updated_at timestamp without time zone DEFAULT NOW(),
    name varchar(50) NOT NULL,
    description text,
    status text DEFAULT 'active',
    deleted_at timestamp without time zone
);

-- Indexes for performance (optional)
CREATE INDEX IF NOT EXISTS idx_menu_categories_restaurant_id ON menu_categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_categories_status ON menu_categories(status);
