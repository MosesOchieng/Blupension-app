use sqlx::PgPool;
use uuid::Uuid;
use rust_decimal::Decimal;
use chrono::Utc;

pub struct PortfolioService {
    pool: PgPool,
}

impl PortfolioService {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
    pub async fn get_portfolio_value(&self, user_id: Uuid) -> Result<PortfolioValue> {
        let investments = sqlx::query!(
            r#"
            SELECT 
                COALESCE(SUM(amount), 0) as total_investments,
                COUNT(*) as investment_count
            FROM investments 
            WHERE user_id = $1 
            AND status = 'ACTIVE'
            "#,
            user_id
        )
        .fetch_one(&self.pool)
        .await?;

        let withdrawals = sqlx::query!(
            r#"
            SELECT COALESCE(SUM(amount), 0) as total_withdrawals
            FROM transactions
            WHERE user_id = $1 
            AND transaction_type = 'WITHDRAWAL'
            AND status = 'COMPLETED'
            "#,
            user_id
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(PortfolioValue {
            total_value: investments.total_investments - withdrawals.total_withdrawals,
            investment_count: investments.investment_count as i32,
            last_updated: Utc::now()
        })
    }
