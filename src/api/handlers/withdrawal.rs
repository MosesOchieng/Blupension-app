use axum::{extract::State, Json};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{
    auth::AuthUser,
    error::Error,
    services::fund_service::FundService,
};

#[derive(Deserialize)]
pub struct WithdrawalRequest {
    amount: f64,
    phone_number: String,
}

#[derive(Serialize)]
pub struct WithdrawalResponse {
    transaction_id: Uuid,
    status: String,
    message: String,
}

pub async fn initiate_withdrawal(
    auth_user: AuthUser,
    State(fund_service): State<FundService>,
    Json(payload): Json<WithdrawalRequest>,
) -> Result<Json<WithdrawalResponse>, Error> {
    // Validate amount
    if payload.amount <= 0.0 {
        return Err(Error::InvalidAmount);
    }

    // Check if user has sufficient balance
    let balance = fund_service.get_user_balance(auth_user.user_id).await?;
    if balance < payload.amount {
        return Err(Error::InsufficientFunds);
    }

    // Process withdrawal
    let transaction = fund_service
        .process_withdrawal(
            auth_user.user_id,
            payload.amount,
            &payload.phone_number,
        )
        .await?;

    Ok(Json(WithdrawalResponse {
        transaction_id: transaction.id,
        status: transaction.status,
        message: "Withdrawal request processed successfully".to_string(),
    }))
}

#[derive(Serialize)]
pub struct WithdrawalHistoryResponse {
    withdrawals: Vec<WithdrawalRecord>,
}

#[derive(Serialize)]
pub struct WithdrawalRecord {
    transaction_id: Uuid,
    amount: f64,
    status: String,
    created_at: chrono::DateTime<chrono::Utc>,
    completed_at: Option<chrono::DateTime<chrono::Utc>>,
}

pub async fn get_withdrawal_history(
    auth_user: AuthUser,
    State(fund_service): State<FundService>,
) -> Result<Json<WithdrawalHistoryResponse>, Error> {
    let withdrawals = fund_service
        .get_user_withdrawals(auth_user.user_id)
        .await?;

    Ok(Json(WithdrawalHistoryResponse { withdrawals }))
} 