-- Migration: Tạo bảng modifier_options

CREATE TABLE IF NOT EXISTS modifier_options (
    id uuid PRIMARY KEY,
    group_id uuid NOT NULL,
    price_adjustment numeric(10,2) DEFAULT 0,
    created_at timestamp without time zone DEFAULT NOW(),
    name varchar(100) NOT NULL,
    status text DEFAULT 'active'
);

-- Indexes for performance (optional)
CREATE INDEX IF NOT EXISTS idx_modifier_options_group_id ON modifier_options(group_id);
CREATE INDEX IF NOT EXISTS idx_modifier_options_status ON modifier_options(status);
