-- Add indices for foreign keys and frequently queried columns
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);

CREATE INDEX idx_investments_user_id ON investments(user_id);
CREATE INDEX idx_investments_status ON investments(status);
CREATE INDEX idx_investments_created_at ON investments(created_at);

-- Add composite indices for common query patterns
CREATE INDEX idx_transactions_user_status ON transactions(user_id, status);
CREATE INDEX idx_investments_user_status ON investments(user_id, status); 