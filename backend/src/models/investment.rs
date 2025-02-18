use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize)]
pub struct Investment {
    pub id: Uuid,
    pub user_id: Uuid,
    pub amount: Decimal,
    pub investment_type: String,
    pub status: InvestmentStatus,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>
}

#[derive(Debug, Serialize, Deserialize)]
pub enum InvestmentStatus {
    Active,
    Pending,
    Completed,
    Failed
}
