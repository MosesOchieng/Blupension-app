use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use thiserror::Error;
use rust_decimal::Decimal;
use actix_web::{HttpResponse, ResponseError};
use jsonwebtoken::errors;

#[derive(Error, Debug)]
pub enum Error {
    #[error("Authentication required")]
    Unauthorized,
    
    #[error("Failed to create token")]
    TokenCreation,
    
    #[error("Database error")]
    Database(#[from] sqlx::Error),
    
    #[error(transparent)]
    Other(#[from] anyhow::Error),
    
    #[error("Invalid amount")]
    InvalidAmount,
    
    #[error("M-Pesa API error: {0}")]
    MPesa(String),
    
    #[error("Insufficient funds")]
    InsufficientFunds,
    
    #[error("Withdrawal limit exceeded")]
    WithdrawalLimitExceeded,

    #[error("Withdrawal amount too small (minimum: {0})")]
    WithdrawalTooSmall(Decimal),

    #[error("Withdrawals too frequent")]
    WithdrawalTooFrequent,

    #[error("Daily withdrawal limit exceeded")]
    DailyWithdrawalLimitExceeded,

    #[error("Monthly withdrawal limit exceeded")]
    MonthlyWithdrawalLimitExceeded,

    #[error("JWT error: {0}")]
    JWT(#[from] errors::Error),
}

impl IntoResponse for Error {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            Error::Unauthorized => (StatusCode::UNAUTHORIZED, "Unauthorized"),
            Error::TokenCreation => (StatusCode::INTERNAL_SERVER_ERROR, "Token creation failed"),
            Error::Database(_) => (StatusCode::INTERNAL_SERVER_ERROR, "Database error"),
            Error::Other(_) => (StatusCode::INTERNAL_SERVER_ERROR, "Internal server error"),
            Error::InvalidAmount => (StatusCode::BAD_REQUEST, "Invalid amount"),
            Error::MPesa(ref e) => (StatusCode::INTERNAL_SERVER_ERROR, e),
            Error::InsufficientFunds => (StatusCode::BAD_REQUEST, "Insufficient funds"),
            Error::WithdrawalLimitExceeded => (StatusCode::BAD_REQUEST, "Withdrawal limit exceeded"),
            Error::WithdrawalTooSmall(min) => (
                StatusCode::BAD_REQUEST,
                format!("Minimum withdrawal amount is {}", min),
            ),
            Error::WithdrawalTooFrequent => (
                StatusCode::BAD_REQUEST,
                "Please wait before making another withdrawal".to_string(),
            ),
            Error::DailyWithdrawalLimitExceeded => (
                StatusCode::BAD_REQUEST,
                "Daily withdrawal limit exceeded".to_string(),
            ),
            Error::MonthlyWithdrawalLimitExceeded => (
                StatusCode::BAD_REQUEST,
                "Monthly withdrawal limit exceeded".to_string(),
            ),
            Error::JWT(_) => (StatusCode::INTERNAL_SERVER_ERROR, "JWT error"),
        };

        let body = Json(json!({
            "error": message
        }));

        (status, body).into_response()
    }
}

impl ResponseError for Error {
    fn error_response(&self) -> HttpResponse {
        match self {
            Error::Unauthorized => HttpResponse::Unauthorized().finish(),
            _ => HttpResponse::InternalServerError().finish(),
        }
    }
}

pub type Result<T> = std::result::Result<T, Error>; 