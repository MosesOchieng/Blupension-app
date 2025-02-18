use sqlx::PgPool;
use uuid::Uuid;
use rust_decimal::Decimal;
use chrono::Utc;
use crate::error::Result;
use crate::models::{Investment, Portfolio, InvestmentStatus};

pub struct InvestmentService {
    pool: PgPool,
}

impl InvestmentService {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn update_risk_profile(&self, user_id: Uuid, profile: RiskProfile) -> Result<RiskProfileResponse> {
        sqlx::query!(
            r#"
            INSERT INTO user_risk_profiles (user_id, age, income, risk_tolerance, investment_horizon)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (user_id) DO UPDATE
            SET age = $2, income = $3, risk_tolerance = $4, investment_horizon = $5
            "#,
            user_id,
            profile.age,
            profile.income,
            profile.risk_tolerance,
            profile.investment_horizon
        )
        .execute(&self.pool)
        .await?;

        Ok(RiskProfileResponse {
            profile,
            updated_at: chrono::Utc::now(),
        })
    }

    pub async fn get_investment(&self, user_id: Uuid) -> Result<Option<Investment>> {
        let investment = sqlx::query_as!(
            Investment,
            r#"
            SELECT * FROM investments
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT 1
            "#,
            user_id
        )
        .fetch_optional(&self.pool)
        .await?;

        Ok(investment)
    }

    pub async fn get_portfolio(
        &self,
        user_id: Uuid
    ) -> Result<Portfolio> {
        let investments = sqlx::query_as!(
            Investment,
            r#"
            SELECT 
                id,
                user_id,
                amount,
                investment_type,
                status as "status: InvestmentStatus",
                created_at,
                updated_at
            FROM investments 
            WHERE user_id = $1 
            AND status = 'ACTIVE'
            "#,
            user_id
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(Portfolio {
            investments,
            total_value: investments.iter().map(|i| i.amount).sum(),
            last_updated: Utc::now()
        })
    }

    pub async fn create_investment(
        &self,
        user_id: Uuid,
        amount: Decimal,
        investment_type: String,
    ) -> Result<Investment> {
        let investment = sqlx::query_as!(
            Investment,
            r#"
            INSERT INTO investments (user_id, amount, investment_type, status)
            VALUES ($1, $2, $3, 'PENDING')
            RETURNING *
            "#,
            user_id,
            amount,
            investment_type
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(investment)
    }

    pub async fn get_portfolio_summary(&self, user_id: Uuid) -> Result<PortfolioSummary> {
        let investments = sqlx::query_as!(
            Investment,
            r#"
            SELECT * FROM investments
            WHERE user_id = $1
            ORDER BY created_at DESC
            "#,
            user_id
        )
        .fetch_all(&self.pool)
        .await?;

        let total_amount: i64 = investments.iter().map(|i| i.amount).sum();
        let stablecoin_amount: i64 = investments
            .iter()
            .map(|i| (i.amount * i.stablecoin_percentage as i64) / 100)
            .sum();
        let growing_assets_amount = total_amount - stablecoin_amount;

        Ok(PortfolioSummary {
            total_amount,
            stablecoin_amount,
            growing_assets_amount,
            stablecoin_percentage: if total_amount > 0 {
                (stablecoin_amount * 100) / total_amount
            } else {
                0
            } as i32,
        })
    }
}

#[derive(Debug, serde::Serialize)]
pub struct PortfolioSummary {
    pub total_amount: i64,
    pub stablecoin_amount: i64,
    pub growing_assets_amount: i64,
    pub stablecoin_percentage: i32,
}
