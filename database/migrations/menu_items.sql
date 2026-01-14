-- Migration: Tạo bảng menu_items

CREATE TABLE IF NOT EXISTS menu_items (
    id uuid PRIMARY KEY,
    price numeric(10,2) NOT NULL,
    popularity integer DEFAULT 0,
    restaurant_id uuid NOT NULL,
    category_id uuid NOT NULL,
    prep_time_minutes integer,
    is_chef_recommended boolean DEFAULT false,
    is_deleted boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT NOW(),
    updated_at timestamp without time zone DEFAULT NOW(),
    name varchar(80) NOT NULL,
    description text,
    status text DEFAULT 'available'
);

-- Indexes for performance (optional)
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_status ON menu_items(status);
