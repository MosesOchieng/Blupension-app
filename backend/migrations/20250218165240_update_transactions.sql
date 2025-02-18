-- Add transaction enums and columns
DO 54987 BEGIN
    CREATE TYPE transaction_type AS ENUM ('DEPOSIT', 'WITHDRAWAL');
    CREATE TYPE transaction_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED');
EXCEPTION 
    WHEN duplicate_object THEN NULL;
END 54987;

ALTER TABLE transactions 
    ADD COLUMN IF NOT EXISTS type transaction_type,
    ADD COLUMN IF NOT EXISTS status transaction_status,
    ADD COLUMN IF NOT EXISTS mpesa_reference TEXT,
    ADD COLUMN IF NOT EXISTS blockchain_tx_hash TEXT,
    ADD COLUMN IF NOT EXISTS failure_reason TEXT,
    ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;
