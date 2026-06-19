-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- This MIGRATES the existing users table to support WhatsApp OTP auth.

-- 1. Make email optional (OTP signup has no email yet)
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- 2. Add is_verified flag
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- 3. Ensure phone is unique (so one number = one account)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'users_phone_unique'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_phone_unique UNIQUE (phone);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_phone ON users (phone);

-- 4. OTP codes table
CREATE TABLE IF NOT EXISTS otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT NOT NULL,
    otp TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_otp_phone_expires ON otp_codes (phone, expires_at DESC);

ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'otp_codes' AND policyname = 'otp_service_access'
    ) THEN
        CREATE POLICY otp_service_access ON otp_codes FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;
