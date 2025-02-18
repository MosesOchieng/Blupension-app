use chrono::{DateTime, Utc};
use uuid::Uuid;
use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Investment {
    pub id: Uuid,
    pub user_id: Uuid,
    pub amount: f64,
    pub status: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Transaction {
    pub id: Uuid,
    pub user_id: Uuid,
    pub amount: f64,
    pub transaction_type: String,
    pub status: String,
    pub created_at: DateTime<Utc>,
}
