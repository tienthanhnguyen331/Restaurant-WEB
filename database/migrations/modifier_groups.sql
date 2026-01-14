-- Migration: Tạo bảng modifier_groups

CREATE TABLE IF NOT EXISTS modifier_groups (
    id uuid PRIMARY KEY,
    restaurant_id uuid NOT NULL,
    is_required boolean DEFAULT false,
    min_selections integer,
    max_selections integer,
    display_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT NOW(),
    updated_at timestamp without time zone DEFAULT NOW(),
    name varchar(100) NOT NULL,
    selection_type text DEFAULT 'single',
    status text DEFAULT 'active'
);

-- Indexes for performance (optional)
CREATE INDEX IF NOT EXISTS idx_modifier_groups_restaurant_id ON modifier_groups(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_modifier_groups_status ON modifier_groups(status);
