use anyhow::Result;
use sqlx::postgres::PgPool;

pub async fn init_db(pool: &PgPool) -> Result<()> {
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        
        CREATE TABLE IF NOT EXISTS wallets (
            id UUID PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES users(id),
            address VARCHAR(255) NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS pension_funds (
            id UUID PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES users(id),
            investment_plan VARCHAR(50) NOT NULL,
            balance DECIMAL(20,8) NOT NULL DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS transactions (
            id UUID PRIMARY KEY,
            fund_id UUID NOT NULL REFERENCES pension_funds(id),
            transaction_type VARCHAR(50) NOT NULL,
            amount DECIMAL(20,8) NOT NULL,
            status VARCHAR(50) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            phone_number VARCHAR(20),
            completed_at TIMESTAMP WITH TIME ZONE,
            mpesa_reference VARCHAR(50),
            failure_reason TEXT
        );

        CREATE TABLE IF NOT EXISTS user_risk_profiles (
            id UUID PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES users(id),
            age SMALLINT NOT NULL,
            income DECIMAL(20,2) NOT NULL,
            risk_tolerance VARCHAR(50) NOT NULL,
            investment_horizon SMALLINT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS portfolio_allocations (
            id UUID PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES users(id),
            stablecoin DECIMAL(5,2) NOT NULL,
            growing_assets DECIMAL(5,2) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS portfolio_recommendations (
            id UUID PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES users(id),
            stablecoin DECIMAL(5,2) NOT NULL,
            growing_assets DECIMAL(5,2) NOT NULL,
            status VARCHAR(50) DEFAULT 'PENDING',
            applied_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_transactions_user_type 
        ON transactions(user_id, transaction_type);
        "#,
    )
    .execute(pool)
    .await?;

    Ok(())
}
