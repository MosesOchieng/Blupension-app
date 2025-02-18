use validator::Validate;
use serde::Deserialize;
use validator::{ValidationError};
use regex::Regex;

#[derive(Deserialize, Validate)]
pub struct RegisterRequest {
    #[validate(email)]
    pub email: String,
    #[validate(length(min = 8))]
    pub password: String,
    #[validate(length(min = 10, max = 13))]
    pub phone_number: String,
}

#[derive(Debug, Deserialize, Validate)]
pub struct PhoneNumber {
    #[validate(regex(path = "PHONE_REGEX"))]
    pub number: String,
}

lazy_static! {
    static ref PHONE_REGEX: Regex = Regex::new(r"^254[0-9]{9}$").unwrap();
}

pub fn validate_phone(phone: &str) -> Result<(), ValidationError> {
    if PHONE_REGEX.is_match(phone) {
        Ok(())
    } else {
        Err(ValidationError::new("invalid_phone_format"))
    }
}

#[derive(Debug, Deserialize, Validate)]
pub struct Amount {
    #[validate(range(min = 1000, max = 1000000))]
    pub amount: i64,
}

pub fn validate_amount(amount: i64) -> Result<(), ValidationError> {
    if amount >= 1000 && amount <= 1000000 {
        Ok(())
    } else {
        Err(ValidationError::new("invalid_amount"))
    }
}
