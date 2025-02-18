
use sqlx::FromRow;
use uuid::Uuid;

#[derive(FromRow)]
pub struct User {
    pub id: Uuid,
    pub email: String,
    pub password_hash: String,
    pub phone_number: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(FromRow)]
pub struct Investment {
    pub id: Uuid,
    pub user_id: Uuid,
    pub amount: rust_decimal::Decimal,
    pub status: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
}
