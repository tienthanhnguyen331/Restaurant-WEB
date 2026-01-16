-- Migration: Add profile fields to users table
-- Purpose: Support advanced profile management (displayName, email verification)

-- Add new columns
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "displayName" VARCHAR(50),
ADD COLUMN IF NOT EXISTS "isEmailVerified" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "emailVerificationToken" VARCHAR(255);

-- Create index for email verification token lookup
CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON "users"("emailVerificationToken");

-- Add comment
COMMENT ON COLUMN "users"."displayName" IS 'Optional display name for the user profile';
COMMENT ON COLUMN "users"."isEmailVerified" IS 'Flag to indicate if email is verified';
COMMENT ON COLUMN "users"."emailVerificationToken" IS 'Token for email verification process';
