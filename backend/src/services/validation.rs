use validator::{Validate, ValidationError};
use rust_decimal::Decimal;

#[derive(Validate)]
pub struct InvestmentValidation {
    #[validate(range(min = "100", max = "1000000"))]
    pub amount: Decimal,
    
    #[validate(custom = "validate_investment_frequency")]
    pub user_id: Uuid,
}

fn validate_investment_frequency(user_id: &Uuid) -> Result<(), ValidationError> {
    // Check if user has made an investment in the last 24 hours
    // Implement rate limiting logic here
    Ok(())
}
