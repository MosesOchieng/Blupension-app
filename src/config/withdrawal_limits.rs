use rust_decimal::Decimal;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct WithdrawalLimits {
    pub min_amount: Decimal,
    pub max_daily_amount: Decimal,
    pub max_monthly_amount: Decimal,
    pub min_time_between_withdrawals: chrono::Duration,
}

impl Default for WithdrawalLimits {
    fn default() -> Self {
        Self {
            min_amount: Decimal::new(1000, 2),        // 10.00
            max_daily_amount: Decimal::new(5000000, 2), // 50,000.00
            max_monthly_amount: Decimal::new(10000000, 2), // 100,000.00
            min_time_between_withdrawals: chrono::Duration::hours(24),
        }
    }
} 