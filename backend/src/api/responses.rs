use serde::Serialize;
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Serialize)]
pub struct PortfolioResponse {
    pub total_value: i64,
    pub total_investments: i32,
    pub investments: Vec<InvestmentResponse>,
    pub risk_profile: Option<RiskProfileResponse>,
}

#[derive(Serialize)]
pub struct InvestmentResponse {
    pub id: Uuid,
    pub amount: i64,
    pub stablecoin_percentage: i32,
    pub growing_assets_percentage: i32,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub returns: Option<f64>,
}

#[derive(Serialize)]
pub struct RiskProfileResponse {
    pub age: i32,
    pub income: i64,
    pub risk_tolerance: i32,
    pub investment_horizon: i32,
    pub recommended_allocation: AllocationRecommendation,
}

#[derive(Serialize)]
pub struct AllocationRecommendation {
    pub stablecoin_percentage: i32,
    pub growing_assets_percentage: i32,
    pub explanation: String,
}

#[derive(Serialize)]
pub struct TransactionHistoryResponse {
    pub transactions: Vec<TransactionResponse>,
    pub total_count: i64,
    pub page: i32,
    pub per_page: i32,
}

#[derive(Serialize)]
pub struct TransactionResponse {
    pub id: Uuid,
    pub amount: i64,
    pub r#type: String,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub details: Option<TransactionDetails>,
}

#[derive(Serialize)]
pub struct TransactionDetails {
    pub phone_number: Option<String>,
    pub mpesa_receipt: Option<String>,
    pub blockchain_tx: Option<String>,
} 