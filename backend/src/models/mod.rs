use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    pub id: Uuid,
    pub email: String,
    #[serde(skip_serializing)]
    pub password_hash: String,
    pub phone_number: Option<String>,
    pub email_verified: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Investment {
    pub id: Uuid,
    pub user_id: Uuid,
    pub amount: i64,
    pub stablecoin_percentage: i32,
    pub growing_assets_percentage: i32,
    pub status: String,
    pub blockchain_tx_hash: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Transaction {
    pub id: Uuid,
    pub user_id: Uuid,
    pub amount: i64,
    pub r#type: String,
    pub status: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RiskProfile {
    pub id: Uuid,
    pub user_id: Uuid,
    pub age: i32,
    pub income: i64,
    pub risk_tolerance: i32,
    pub investment_horizon: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct WithdrawalLimits {
    pub min_amount: i64,
    pub max_daily_amount: i64,
    pub max_monthly_amount: i64,
    pub remaining_daily_limit: i64,
    pub remaining_monthly_limit: i64,
} 