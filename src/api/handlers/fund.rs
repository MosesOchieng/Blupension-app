use axum::{extract::Path, Json};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use rust_decimal::Decimal;

#[derive(Deserialize)]
pub struct CreateFundRequest {
    user_id: Uuid,
    investment_plan: InvestmentPlan,
    initial_deposit: Decimal,
}

#[derive(Deserialize)]
pub struct TransactionRequest {
    amount: Decimal,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum InvestmentPlan {
    Conservative,
    Moderate,
    Aggressive,
}

#[derive(Serialize)]
pub struct FundResponse {
    id: Uuid,
    user_id: Uuid,
    investment_plan: InvestmentPlan,
    balance: Decimal,
    created_at: chrono::DateTime<chrono::Utc>,
}

pub async fn create_fund(
    Json(payload): Json<CreateFundRequest>,
) -> Json<FundResponse> {
    // TODO: Implement fund creation logic with service layer
    Json(FundResponse {
        id: Uuid::new_v4(),
        user_id: payload.user_id,
        investment_plan: payload.investment_plan,
        balance: payload.initial_deposit,
        created_at: chrono::Utc::now(),
    })
}

pub async fn get_fund(Path(fund_id): Path<Uuid>) -> Json<FundResponse> {
    // TODO: Implement fund retrieval logic
    Json(FundResponse {
        id: fund_id,
        user_id: Uuid::new_v4(),
        investment_plan: InvestmentPlan::Moderate,
        balance: Decimal::new(1000, 2), // 10.00
        created_at: chrono::Utc::now(),
    })
}

pub async fn deposit(
    Path(fund_id): Path<Uuid>,
    Json(payload): Json<TransactionRequest>,
) -> Json<FundResponse> {
    // TODO: Implement deposit logic
    Json(FundResponse {
        id: fund_id,
        user_id: Uuid::new_v4(),
        investment_plan: InvestmentPlan::Moderate,
        balance: payload.amount,
        created_at: chrono::Utc::now(),
    })
}

pub async fn withdraw(
    Path(fund_id): Path<Uuid>,
    Json(payload): Json<TransactionRequest>,
) -> Json<FundResponse> {
    // TODO: Implement withdrawal logic
    Json(FundResponse {
        id: fund_id,
        user_id: Uuid::new_v4(),
        investment_plan: InvestmentPlan::Moderate,
        balance: payload.amount,
        created_at: chrono::Utc::now(),
    })
} 