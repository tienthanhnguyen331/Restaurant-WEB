-- Migration: Tạo bảng tables

CREATE TYPE IF NOT EXISTS tables_status_enum AS ENUM ('active', 'inactive');

CREATE TABLE IF NOT EXISTS tables (
    id uuid PRIMARY KEY,
    capacity integer NOT NULL,
    location varchar(100),
    status tables_status_enum DEFAULT 'active',
    qr_token text,
    createdAt timestamp without time zone DEFAULT NOW(),
    updatedAt timestamp without time zone DEFAULT NOW(),
    deletedAt timestamp without time zone,
    description text,
    table_number integer,
    qr_token_created_at timestamp without time zone
);

-- Indexes for performance (optional)
CREATE INDEX IF NOT EXISTS idx_tables_status ON tables(status);
CREATE INDEX IF NOT EXISTS idx_tables_table_number ON tables(table_number);
