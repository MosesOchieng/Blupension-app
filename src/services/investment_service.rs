use anyhow::Result;
use sqlx::PgPool;
use uuid::Uuid;
use crate::error::{Result, Error};

use crate::ai::investment_strategy::{
    AssetAllocation, PortfolioRebalancer, RiskProfile, RiskTolerance,
};

pub struct InvestmentService {
    pool: PgPool,
    rebalancer: PortfolioRebalancer,
}

impl InvestmentService {
    pub fn new(pool: PgPool) -> Result<Self> {
        Ok(Self {
            pool,
            rebalancer: PortfolioRebalancer::new(0.05)?, // 5% threshold
        })
    }

    pub async fn get_investment_recommendation(
        &self,
        user_id: Uuid,
    ) -> Result<AssetAllocation> {
        // Fetch user's risk profile from database
        let risk_profile = self.get_user_risk_profile(user_id).await?;
        
        // Get current allocation
        let current_allocation = self.get_current_allocation(user_id).await?;
        
        // Check if rebalancing is needed
        if let Some(new_allocation) = self
            .rebalancer
            .check_and_rebalance(user_id, ¤t_allocation, &risk_profile)
            .await?
        {
            // Record the rebalancing recommendation
            self.record_rebalancing_recommendation(user_id, &new_allocation)
                .await?;
            Ok(new_allocation)
        } else {
            Ok(current_allocation)
        }
    }

    pub async fn get_user_risk_profile(&self, user_id: Uuid) -> Result<RiskProfile> {
        let profile = sqlx::query_as!(
            RiskProfile,
            r#"
            SELECT age, income, risk_tolerance, investment_horizon
            FROM user_risk_profiles
            WHERE user_id = $1
            "#,
            user_id
        )
        .fetch_one(&self.pool)
        .await
        .map_err(Error::Database)?;

        Ok(profile)
    }

    async fn get_current_allocation(&self, user_id: Uuid) -> Result<AssetAllocation> {
        // Fetch current allocation from database
        let allocation = sqlx::query!(
            r#"
            SELECT stocks, bonds, real_estate, crypto
            FROM portfolio_allocations
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT 1
            "#,
            user_id
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(AssetAllocation {
            stocks: allocation.stocks,
            bonds: allocation.bonds,
            real_estate: allocation.real_estate,
            crypto: allocation.crypto,
        })
    }

    async fn record_rebalancing_recommendation(
        &self,
        user_id: Uuid,
        allocation: &AssetAllocation,
    ) -> Result<()> {
        sqlx::query!(
            r#"
            INSERT INTO portfolio_recommendations
            (user_id, stocks, bonds, real_estate, crypto)
            VALUES ($1, $2, $3, $4, $5)
            "#,
            user_id,
            allocation.stocks,
            allocation.bonds,
            allocation.real_estate,
            allocation.crypto,
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }
}