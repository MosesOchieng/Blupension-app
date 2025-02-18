use axum::{extract::State, Json};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{
    auth::AuthUser,
    error::Error,
    services::{fund_service::FundService, mpesa_service::MPesaService},
};

#[derive(Deserialize)]
pub struct DepositRequest {
    amount: f64,
    phone_number: String,
}

#[derive(Serialize)]
pub struct DepositResponse {
    merchant_request_id: String,
    checkout_request_id: String,
    response_description: String,
    customer_message: String,
}

pub async fn initiate_deposit(
    auth_user: AuthUser,
    State((fund_service, mpesa_service)): State<(FundService, MPesaService)>,
    Json(payload): Json<DepositRequest>,
) -> Result<Json<DepositResponse>, Error> {
    // Validate amount
    if payload.amount <= 0.0 {
        return Err(Error::InvalidAmount);
    }

    // Generate account reference
    let account_ref = format!("PEN{}", auth_user.user_id);

    // Initiate M-Pesa payment
    let stk_response = mpesa_service
        .initiate_payment(&payload.phone_number, payload.amount, &account_ref)
        .await?;

    // Record pending deposit
    fund_service
        .record_pending_deposit(
            auth_user.user_id,
            payload.amount,
            &stk_response.checkout_request_id,
        )
        .await?;

    Ok(Json(DepositResponse {
        merchant_request_id: stk_response.merchant_request_id,
        checkout_request_id: stk_response.checkout_request_id,
        response_description: stk_response.response_description,
        customer_message: stk_response.customer_message,
    }))
}

// M-Pesa callback handler
#[derive(Deserialize)]
pub struct MPesaCallback {
    checkout_request_id: String,
    result_code: i32,
    result_desc: String,
    amount: f64,
    mpesa_receipt_number: Option<String>,
}

pub async fn mpesa_callback(
    State(fund_service): State<FundService>,
    Json(callback): Json<MPesaCallback>,
) -> Result<(), Error> {
    if callback.result_code == 0 {
        // Payment successful
        fund_service
            .complete_deposit(
                &callback.checkout_request_id,
                callback.amount,
                callback.mpesa_receipt_number.unwrap_or_default(),
            )
            .await?;
    } else {
        // Payment failed
        fund_service
            .fail_deposit(&callback.checkout_request_id, &callback.result_desc)
            .await?;
    }

    Ok(())
} 