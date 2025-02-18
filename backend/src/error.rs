use actix_web::{error::ResponseError, http::StatusCode, HttpResponse};
use serde_json::json;
use std::fmt;

#[derive(Debug)]
pub enum Error {
    Database(sqlx::Error),
    Unauthorized,
    InvalidCredentials,
    TokenCreation,
    InvalidAmount,
    MPesa(String),
    JWT(jsonwebtoken::errors::Error),
    Other(String),
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Error::Database(e) => write!(f, "Database error: {}", e),
            Error::Unauthorized => write!(f, "Unauthorized"),
            Error::InvalidCredentials => write!(f, "Invalid credentials"),
            Error::TokenCreation => write!(f, "Failed to create token"),
            Error::InvalidAmount => write!(f, "Invalid amount"),
            Error::MPesa(e) => write!(f, "MPesa error: {}", e),
            Error::JWT(e) => write!(f, "JWT error: {}", e),
            Error::Other(e) => write!(f, "Error: {}", e),
        }
    }
}

impl ResponseError for Error {
    fn error_response(&self) -> HttpResponse {
        let (status, message) = match self {
            Error::Unauthorized => (StatusCode::UNAUTHORIZED, "Unauthorized"),
            Error::TokenCreation => (StatusCode::INTERNAL_SERVER_ERROR, "Token creation failed"),
            Error::Database(_) => (StatusCode::INTERNAL_SERVER_ERROR, "Database error"),
            Error::Other(_) => (StatusCode::INTERNAL_SERVER_ERROR, "Internal server error"),
            Error::InvalidAmount => (StatusCode::BAD_REQUEST, "Invalid amount"),
            Error::MPesa(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.as_str()),
            Error::InvalidCredentials => (StatusCode::UNAUTHORIZED, "Invalid credentials"),
            Error::JWT(_) => (StatusCode::INTERNAL_SERVER_ERROR, "JWT error"),
        };

        HttpResponse::build(status).json(json!({
            "error": message
        }))
    }
}

pub type Result<T> = std::result::Result<T, Error>; 