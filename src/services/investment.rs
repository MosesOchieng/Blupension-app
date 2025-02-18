use uuid::Uuid;
use sqlx::PgPool;
use rust_decimal::Decimal;
use crate::models::investment::{Investment, Portfolio};
use crate::error::Result;

pub struct InvestmentService {
    pool: PgPool,
}

impl InvestmentService {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn create_investment(&self, user_id: Uuid, amount: Decimal) -> Result<Investment> {
        let investment = sqlx::query_as!(
            Investment,
            r#"
            INSERT INTO investments (user_id, amount, status)
            VALUES ($1, $2, 'PENDING')
            RETURNING id, user_id, amount, status, created_at, updated_at
            "#,
            user_id,
            amount
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(investment)
    }

    pub async fn get_portfolio(&self, user_id: Uuid) -> Result<Portfolio> {
        let investments = sqlx::query_as!(
            Investment,
            r#"
            SELECT * FROM investments 
            WHERE user_id = $1
            "#,
            user_id
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(Portfolio {
            investments,
            total_invested: investments.iter().map(|i| i.amount).sum(),
        })
    }
} 