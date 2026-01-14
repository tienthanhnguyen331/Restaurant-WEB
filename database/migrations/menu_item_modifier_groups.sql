-- Migration: Tạo bảng menu_item_modifier_groups

CREATE TABLE IF NOT EXISTS menu_item_modifier_groups (
    menu_item_id uuid NOT NULL,
    modifier_group_id uuid NOT NULL,
    PRIMARY KEY (menu_item_id, modifier_group_id)
);

-- Indexes for performance (optional)
CREATE INDEX IF NOT EXISTS idx_menu_item_modifier_groups_menu_item_id ON menu_item_modifier_groups(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_menu_item_modifier_groups_modifier_group_id ON menu_item_modifier_groups(modifier_group_id);
