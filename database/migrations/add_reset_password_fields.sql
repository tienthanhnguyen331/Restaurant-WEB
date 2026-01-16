-- Add reset password fields to users table
-- Migration for Forgot Password feature

ALTER TABLE users ADD COLUMN reset_password_token VARCHAR(255) NULL DEFAULT NULL;
ALTER TABLE users ADD COLUMN reset_password_token_expires TIMESTAMP NULL DEFAULT NULL;

-- Create indexes for faster lookups
CREATE INDEX idx_users_reset_password_token ON users(reset_password_token);
