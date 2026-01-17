-- Add email verification fields to users table
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "is_verified" BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS "verification_token" VARCHAR(500),
ADD COLUMN IF NOT EXISTS "verification_token_expires" TIMESTAMP WITH TIME ZONE;

-- Create index for verification token lookups
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON "users"("verification_token");

-- Add index for is_verified to speed up queries filtering unverified users
CREATE INDEX IF NOT EXISTS idx_users_is_verified ON "users"("is_verified");
