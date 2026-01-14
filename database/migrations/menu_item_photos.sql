-- Migration: Tạo bảng menu_item_photos

CREATE TABLE IF NOT EXISTS menu_item_photos (
    id uuid PRIMARY KEY,
    menu_item_id uuid NOT NULL,
    url text NOT NULL,
    is_primary boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT NOW(),
    restaurant_id uuid,
    -- Nếu cần, có thể thêm các ràng buộc khóa ngoại ở đây
    -- FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

-- Indexes for performance (optional)
CREATE INDEX IF NOT EXISTS idx_menu_item_photos_menu_item_id ON menu_item_photos(menu_item_id);
