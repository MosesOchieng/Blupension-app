-- Add missing columns and tables

-- Add status column to investments
ALTER TABLE investments 
ADD COLUMN status TEXT NOT NULL DEFAULT 'PENDING'
CHECK (status IN ('PENDING', 'ACTIVE', 'CLOSED'));

-- Create refresh_tokens table if not exists
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    token TEXT NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT false,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create risk_profiles table if not exists
CREATE TABLE IF NOT EXISTS risk_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) UNIQUE,
    age INTEGER NOT NULL,
    income BIGINT NOT NULL,
    risk_tolerance INTEGER NOT NULL,
    investment_horizon INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add transaction_status enum if not exists
DO $$ BEGIN
    CREATE TYPE transaction_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update transactions table
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS status transaction_status NOT NULL DEFAULT 'PENDING'; 