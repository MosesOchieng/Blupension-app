use chrono::{DateTime, Utc};
use rust_decimal::Decimal;

pub struct WithdrawalLimits {
    pub min_amount: Decimal,
    pub max_daily_amount: Decimal,
    pub max_monthly_amount: Decimal,
    pub cooldown_hours: i32,
}

impl WithdrawalService {
    pub async fn check_withdrawal_limits(&self, user_id: Uuid, amount: Decimal) -> Result<()> {
        let limits = self.get_user_limits(user_id).await?;
        
        if amount < limits.min_amount {
            return Err(Error::WithdrawalTooSmall(limits.min_amount));
        }

        let daily_total = self.get_withdrawal_total_for_period(
            user_id,
            Utc::now() - Duration::days(1)
        ).await?;

        if daily_total + amount > limits.max_daily_amount {
            return Err(Error::DailyWithdrawalLimitExceeded);
        }

        Ok(())
    }
}
