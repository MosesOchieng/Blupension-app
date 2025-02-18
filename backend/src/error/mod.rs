use actix_web::{error::ResponseError, HttpResponse};
use derive_more::From;
use std::fmt;

#[derive(Debug, From)]
pub enum Error {
    #[from]
    Database(sqlx::Error),
    #[from]
    Validation(validator::ValidationErrors),
    InvalidCredentials,
    InvalidToken,
    InsufficientFunds,
    NotFound,
    Unauthorized,
    // Remove the PasswordHash variant and handle password hash errors differently
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Error::Database(e) => write!(f, "Database error: {}", e),
            Error::Validation(e) => write!(f, "Validation error: {}", e),
            Error::InvalidCredentials => write!(f, "Invalid credentials"),
            Error::InvalidToken => write!(f, "Invalid token"),
            Error::InsufficientFunds => write!(f, "Insufficient funds"),
            Error::NotFound => write!(f, "Resource not found"),
            Error::Unauthorized => write!(f, "Unauthorized"),
        }
    }
}

impl ResponseError for Error {
    fn error_response(&self) -> HttpResponse {
        match self {
            Error::Database(_) => HttpResponse::InternalServerError().json("Internal server error"),
            Error::Validation(e) => HttpResponse::BadRequest().json(e.to_string()),
            Error::InvalidCredentials => HttpResponse::Unauthorized().json("Invalid credentials"),
            Error::InvalidToken => HttpResponse::Unauthorized().json("Invalid token"),
            Error::InsufficientFunds => HttpResponse::BadRequest().json("Insufficient funds"),
            Error::NotFound => HttpResponse::NotFound().json("Resource not found"),
            Error::Unauthorized => HttpResponse::Unauthorized().json("Unauthorized"),
        }
    }
} 