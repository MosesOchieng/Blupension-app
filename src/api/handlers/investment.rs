use axum::{
    extract::{Path, State},
    Json,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{
    ai::investment_strategy::{AssetAllocation, RiskProfile, RiskTolerance},
    auth::AuthUser,
    error::Error,
    services::investment_service::InvestmentService,
};

#[derive(Deserialize)]
pub struct UpdateRiskProfileRequest {
    age: u8,
    income: f64,
    risk_tolerance: RiskTolerance,
    investment_horizon: u8,
}

#[derive(Serialize)]
pub struct RiskProfileResponse {
    user_id: Uuid,
    age: u8,
    income: f64,
    risk_tolerance: RiskTolerance,
    investment_horizon: u8,
    created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Serialize)]
pub struct AllocationResponse {
    stablecoin: f64,      // Percentage in stablecoins
    growing_assets: f64,   // Percentage in growing assets
    last_updated: chrono::DateTime<chrono::Utc>,
}

pub async fn update_risk_profile(
    auth_user: AuthUser,
    State(investment_service): State<InvestmentService>,
    Json(payload): Json<UpdateRiskProfileRequest>,
) -> Result<Json<RiskProfileResponse>, Error> {
    let profile = RiskProfile {
        age: payload.age,
        income: payload.income,
        risk_tolerance: payload.risk_tolerance,
        investment_horizon: payload.investment_horizon,
    };

    let response = investment_service
        .update_risk_profile(auth_user.user_id, profile)
        .await?;

    Ok(Json(response))
}

pub async fn get_current_allocation(
    auth_user: AuthUser,
    State(investment_service): State<InvestmentService>,
) -> Result<Json<AllocationResponse>, Error> {
    let allocation = investment_service
        .get_current_allocation(auth_user.user_id)
        .await?;

    Ok(Json(AllocationResponse {
        stablecoin: allocation.stablecoin,
        growing_assets: allocation.growing_assets,
        last_updated: chrono::Utc::now(),
    }))
}

pub async fn get_recommendation(
    auth_user: AuthUser,
    State(investment_service): State<InvestmentService>,
) -> Result<Json<AllocationResponse>, Error> {
    let recommendation = investment_service
        .get_investment_recommendation(auth_user.user_id)
        .await?;

    Ok(Json(AllocationResponse {
        stablecoin: recommendation.stablecoin,
        growing_assets: recommendation.growing_assets,
        last_updated: chrono::Utc::now(),
    }))
}

// Add a new endpoint to explain the investment plans
#[derive(Serialize)]
pub struct InvestmentPlanInfo {
    plan_type: RiskTolerance,
    stablecoin_percentage: f64,
    growing_assets_percentage: f64,
    description: String,
}

pub async fn get_investment_plans() -> Json<Vec<InvestmentPlanInfo>> {
    Json(vec![
        InvestmentPlanInfo {
            plan_type: RiskTolerance::Conservative,
            stablecoin_percentage: 80.0,
            growing_assets_percentage: 20.0,
            description: "Conservative plan: 80% in stablecoins (USDC) for stability, 20% in growing assets (Bitcoin) for growth potential".to_string(),
        },
        InvestmentPlanInfo {
            plan_type: RiskTolerance::Moderate,
            stablecoin_percentage: 50.0,
            growing_assets_percentage: 50.0,
            description: "Moderate plan: Balanced 50-50 split between stablecoins and growing assets for moderate risk and return".to_string(),
        },
        InvestmentPlanInfo {
            plan_type: RiskTolerance::Aggressive,
            stablecoin_percentage: 20.0,
            growing_assets_percentage: 80.0,
            description: "Aggressive plan: 20% in stablecoins, 80% in growing assets for maximum growth potential with higher risk".to_string(),
        },
    ])
} 