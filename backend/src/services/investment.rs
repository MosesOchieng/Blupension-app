use crate::error::Result;
use crate::models::{Investment, Portfolio, RiskProfile};
use rust_decimal::Decimal;
use sqlx::{PgPool, Postgres, Transaction};
use uuid::Uuid;

#[derive(Debug)]
pub struct Portfolio {
    pub investments: Vec<Investment>,
    pub total_value: Decimal,
}

pub struct InvestmentService {
    pool: PgPool,
}

impl InvestmentService {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn create_investment(&self, user_id: Uuid, amount: i64) -> Result<Investment> {
        // Implementation here
        todo!()
    }

    pub async fn get_portfolio(&self, user_id: Uuid) -> Result<Vec<Investment>> {
        let investments = sqlx::query_as!(
            Investment,
            r#"
            SELECT 
                id,
                user_id,
                amount,
                stablecoin_percentage,
                growing_assets_percentage,
                status,
                blockchain_tx_hash,
                created_at,
                updated_at
            FROM investments 
            WHERE user_id = $1 AND status = 'ACTIVE'
            "#,
            user_id
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(investments)
    }

    pub async fn update_risk_profile(
        &self,
        user_id: Uuid,
        age: i32,
        income: i64,
        risk_tolerance: i32,
        investment_horizon: i32,
    ) -> Result<RiskProfile> {
        let profile = sqlx::query_as!(
            RiskProfile,
            r#"
            INSERT INTO risk_profiles (user_id, age, income, risk_tolerance, investment_horizon)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (user_id) 
            DO UPDATE SET 
                age = EXCLUDED.age,
                income = EXCLUDED.income,
                risk_tolerance = EXCLUDED.risk_tolerance,
                investment_horizon = EXCLUDED.investment_horizon,
                updated_at = NOW()
            RETURNING *
            "#,
            user_id,
            age,
            income,
            risk_tolerance,
            investment_horizon
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(profile)
    }

    pub async fn create_investment_with_transaction(
        &self,
        user_id: Uuid,
        amount: i64,
        mut tx: Transaction<'_, Postgres>,
    ) -> Result<(Investment, Transaction<'_, Postgres>)> {
        // Check user balance
        let balance = sqlx::query!(
            r#"
            SELECT COALESCE(SUM(amount), 0) as balance
            FROM transactions
            WHERE user_id = $1 AND status = 'COMPLETED'
            "#,
            user_id
        )
        .fetch_one(&mut tx)
        .await?
        .balance
        .unwrap_or(0);

        if balance < amount {
            return Err(Error::InsufficientFunds);
        }

        // Create investment
        let investment = sqlx::query_as!(
            Investment,
            r#"
            INSERT INTO investments (
                user_id,
                amount,
                stablecoin_percentage,
                growing_assets_percentage,
                status
            )
            VALUES ($1, $2, 50, 50, 'PENDING')
            RETURNING *
            "#,
            user_id,
            amount
        )
        .fetch_one(&mut tx)
        .await?;

        // Create transaction record
        sqlx::query!(
            r#"
            INSERT INTO transactions (
                user_id,
                amount,
                type,
                status,
                reference_id
            )
            VALUES ($1, $2, 'INVESTMENT', 'PENDING', $3)
            "#,
            user_id,
            amount,
            investment.id
        )
        .execute(&mut tx)
        .await?;

        Ok((investment, tx))
    }
}
