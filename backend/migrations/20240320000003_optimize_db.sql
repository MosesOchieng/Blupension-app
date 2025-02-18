-- Add composite indices for common queries
CREATE INDEX idx_transactions_user_type ON transactions(user_id, type);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, created_at DESC);
CREATE INDEX idx_investments_user_status_date ON investments(user_id, status, created_at DESC);

-- Add check constraints
ALTER TABLE investments 
    ADD CONSTRAINT check_stablecoin_percentage 
    CHECK (stablecoin_percentage BETWEEN 0 AND 100),
    ADD CONSTRAINT check_growing_assets_percentage 
    CHECK (growing_assets_percentage BETWEEN 0 AND 100),
    ADD CONSTRAINT check_percentages_sum 
    CHECK (stablecoin_percentage + growing_assets_percentage = 100);

ALTER TABLE risk_profiles
    ADD CONSTRAINT check_risk_tolerance
    CHECK (risk_tolerance BETWEEN 1 AND 10),
    ADD CONSTRAINT check_investment_horizon
    CHECK (investment_horizon BETWEEN 1 AND 30);

-- Add partial indices for active records
CREATE INDEX idx_active_investments ON investments(user_id) 
WHERE status = 'ACTIVE';

CREATE INDEX idx_pending_transactions ON transactions(user_id) 
WHERE status = 'PENDING'; 