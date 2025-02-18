use sqlx::PgPool;
use uuid::Uuid;
use rust_decimal::Decimal;
use chrono::{DateTime, Utc};
use serde::{Serialize, Deserialize};
use crate::error::Result;
use crate::models::{Investment, Portfolio};

#[derive(Debug, Serialize, Deserialize)]
pub struct RiskProfile {
    pub age: i32,
    pub income: i32,
    pub risk_tolerance: i32,
    pub investment_horizon: i32,
}

#[derive(Debug, Serialize)]
pub struct RiskProfileResponse {
    pub profile: RiskProfile,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum InvestmentType {
    STABLECOIN,
    GROWING_ASSETS,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum InvestmentStatus {
    PENDING,
    ACTIVE,
    COMPLETED,
    FAILED,
}

#[derive(Debug, Serialize)]
pub struct PortfolioSummary {
    pub total_amount: Decimal,
    pub stablecoin_amount: Decimal,
    pub growing_assets_amount: Decimal,
    pub stablecoin_percentage: i32,
}

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
            INSERT INTO user_risk_profiles (
                user_id, 
                age, 
                income, 
                risk_tolerance, 
                investment_horizon,
                updated_at
            )
            VALUES ($1, $2, $3, $4, $5, NOW())
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
            profile.age,
            profile.income,
            profile.risk_tolerance,
            profile.investment_horizon
        )
        .execute(&self.pool)
        .await?;

        Ok(RiskProfileResponse {
            profile,
            updated_at: Utc::now(),
        })
    }

    pub async fn get_investment(&self, user_id: Uuid) -> Result<Option<Investment>> {
        let investment = sqlx::query_as!(
            Investment,
            r#"
            SELECT 
                id,
                user_id,
                amount,
                investment_type as "investment_type: String",
                status as "status: String",
                created_at,
                updated_at
            FROM investments
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

    pub async fn get_portfolio(&self, user_id: Uuid) -> Result<Portfolio> {
        let investments = sqlx::query_as!(
            Investment,
            r#"
            SELECT 
                id,
                user_id,
                amount,
                investment_type as "investment_type: String",
                status as "status: String",
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

        let total_value = investments.iter()
            .fold(Decimal::new(0, 0), |acc, inv| acc + inv.amount);

        Ok(Portfolio {
            investments,
            total_value,
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
            INSERT INTO investments (
                user_id, 
                amount, 
                investment_type, 
                status,
                created_at,
                updated_at
            )
            VALUES ($1, $2, $3, 'PENDING', NOW(), NOW())
            RETURNING 
                id,
                user_id,
                amount,
                investment_type as "investment_type: String",
                status as "status: String",
                created_at,
                updated_at
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
        let summary = sqlx::query!(
            r#"
            WITH portfolio_stats AS (
                SELECT 
                    COALESCE(SUM(amount), 0) as total_amount,
                    COALESCE(SUM(CASE 
                        WHEN investment_type = 'STABLECOIN' THEN amount 
                        ELSE 0 
                    END), 0) as stablecoin_amount
                FROM investments
                WHERE user_id = $1 
                AND status = 'ACTIVE'
            )
            SELECT 
                total_amount,
                stablecoin_amount,
                (total_amount - stablecoin_amount) as growing_assets_amount,
                CASE 
                    WHEN total_amount > 0 THEN 
                        (stablecoin_amount * 100 / total_amount)::integer
                    ELSE 0
                END as stablecoin_percentage
            FROM portfolio_stats
            "#,
            user_id
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(PortfolioSummary {
            total_amount: Decimal::new(summary.total_amount.unwrap_or(0), 0),
            stablecoin_amount: Decimal::new(summary.stablecoin_amount.unwrap_or(0), 0),
            growing_assets_amount: Decimal::new(summary.growing_assets_amount.unwrap_or(0), 0),
            stablecoin_percentage: summary.stablecoin_percentage.unwrap_or(0) as i32,
        })
    }
}