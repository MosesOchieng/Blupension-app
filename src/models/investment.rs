use uuid::Uuid;
use rust_decimal::Decimal;
use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize)]
pub struct Investment {
    pub id: Uuid,
    pub user_id: Uuid,
    pub amount: Decimal,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct Portfolio {
    pub investments: Vec<Investment>,
    pub total_invested: Decimal,
} 