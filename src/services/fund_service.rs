use anyhow::Result;
use rust_decimal::Decimal;
use sqlx::PgPool;
use uuid::Uuid;
use crate::api::handlers::fund::InvestmentPlan;
use chrono::{DateTime, Utc};
use crate::config::withdrawal_limits::WithdrawalLimits;
use crate::services::notification_service::NotificationService;

pub struct FundService {
    pool: PgPool,
}

impl FundService {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn create_fund(
        &self,
        user_id: Uuid,
        investment_plan: InvestmentPlan,
        initial_deposit: Decimal,
    ) -> Result<Uuid> {
        let fund_id = Uuid::new_v4();
        
        sqlx::query!(
            r#"
            INSERT INTO pension_funds (id, user_id, investment_plan, balance)
            VALUES ($1, $2, $3, $4)
            "#,
            fund_id,
            user_id,
            investment_plan as InvestmentPlan,
            initial_deposit,
        )
        .execute(&self.pool)
        .await?;

        // Create initial deposit transaction
        sqlx::query!(
            r#"
            INSERT INTO transactions (id, fund_id, transaction_type, amount, status)
            VALUES ($1, $2, $3, $4, $5)
            "#,
            Uuid::new_v4(),
            fund_id,
            "DEPOSIT",
            initial_deposit,
            "COMPLETED",
        )
        .execute(&self.pool)
        .await?;

        Ok(fund_id)
    }

    pub async fn get_fund(&self, fund_id: Uuid) -> Result<Option<PensionFund>> {
        let fund = sqlx::query_as!(
            PensionFund,
            r#"
            SELECT * FROM pension_funds WHERE id = $1
            "#,
            fund_id
        )
        .fetch_optional(&self.pool)
        .await?;

        Ok(fund)
    }

    pub async fn process_transaction(
        &self,
        fund_id: Uuid,
        amount: Decimal,
        transaction_type: TransactionType,
    ) -> Result<()> {
        let mut tx = self.pool.begin().await?;

        // Update fund balance
        let modifier = match transaction_type {
            TransactionType::Deposit => Decimal::ONE,
            TransactionType::Withdrawal => -Decimal::ONE,
        };

        sqlx::query!(
            r#"
            UPDATE pension_funds
            SET balance = balance + $1
            WHERE id = $2
            "#,
            amount * modifier,
            fund_id,
        )
        .execute(&mut tx)
        .await?;

        // Record transaction
        sqlx::query!(
            r#"
            INSERT INTO transactions (id, fund_id, transaction_type, amount, status)
            VALUES ($1, $2, $3, $4, $5)
            "#,
            Uuid::new_v4(),
            fund_id,
            transaction_type.to_string(),
            amount,
            "COMPLETED",
        )
        .execute(&mut tx)
        .await?;

        tx.commit().await?;
        Ok(())
    }

    pub async fn get_user_balance(&self, user_id: Uuid) -> Result<f64> {
        let balance = sqlx::query!(
            r#"
            SELECT balance FROM pension_funds
            WHERE user_id = $1
            "#,
            user_id
        )
        .fetch_one(&self.pool)
        .await?
        .balance;

        Ok(balance)
    }

    pub async fn validate_withdrawal(
        &self,
        user_id: Uuid,
        amount: Decimal,
    ) -> Result<()> {
        let limits = WithdrawalLimits::default();

        // Check minimum amount
        if amount < limits.min_amount {
            return Err(Error::WithdrawalTooSmall(limits.min_amount));
        }

        // Check last withdrawal time
        let last_withdrawal = sqlx::query!(
            r#"
            SELECT created_at 
            FROM transactions 
            WHERE user_id = $1 
            AND transaction_type = 'WITHDRAWAL'
            ORDER BY created_at DESC
            LIMIT 1
            "#,
            user_id
        )
        .fetch_optional(&self.pool)
        .await?;

        if let Some(last) = last_withdrawal {
            let time_since_last = Utc::now() - last.created_at;
            if time_since_last < limits.min_time_between_withdrawals {
                return Err(Error::WithdrawalTooFrequent);
            }
        }

        // Check daily limit
        let daily_total = self.get_withdrawal_total_for_period(
            user_id,
            Utc::now() - chrono::Duration::days(1),
        ).await?;

        if daily_total + amount > limits.max_daily_amount {
            return Err(Error::DailyWithdrawalLimitExceeded);
        }

        // Check monthly limit
        let monthly_total = self.get_withdrawal_total_for_period(
            user_id,
            Utc::now() - chrono::Duration::days(30),
        ).await?;

        if monthly_total + amount > limits.max_monthly_amount {
            return Err(Error::MonthlyWithdrawalLimitExceeded);
        }

        Ok(())
    }

    async fn get_withdrawal_total_for_period(
        &self,
        user_id: Uuid,
        since: DateTime<Utc>,
    ) -> Result<Decimal> {
        let total = sqlx::query!(
            r#"
            SELECT COALESCE(SUM(amount), 0) as total
            FROM transactions
            WHERE user_id = $1
            AND transaction_type = 'WITHDRAWAL'
            AND created_at > $2
            "#,
            user_id,
            since
        )
        .fetch_one(&self.pool)
        .await?
        .total
        .unwrap_or_default();

        Ok(total)
    }

    pub async fn process_withdrawal(
        &self,
        user_id: Uuid,
        amount: Decimal,
        phone_number: &str,
    ) -> Result<Transaction> {
        // Validate withdrawal
        self.validate_withdrawal(user_id, amount).await?;

        let mut tx = self.pool.begin().await?;
        let notification_service = NotificationService::new()?;

        // Create withdrawal transaction
        let transaction_id = Uuid::new_v4();
        sqlx::query!(
            r#"
            INSERT INTO transactions (
                id, user_id, transaction_type, amount, status, phone_number
            )
            VALUES ($1, $2, 'WITHDRAWAL', $3, 'PENDING', $4)
            "#,
            transaction_id,
            user_id,
            amount,
            phone_number,
        )
        .execute(&mut tx)
        .await?;

        // Update fund balance
        sqlx::query!(
            r#"
            UPDATE pension_funds
            SET balance = balance - $1
            WHERE user_id = $2
            "#,
            amount,
            user_id,
        )
        .execute(&mut tx)
        .await?;

        // Send notification
        notification_service
            .send_withdrawal_initiated(phone_number, amount.to_f64().unwrap())
            .await?;

        tx.commit().await?;

        Ok(Transaction {
            id: transaction_id,
            status: "PENDING".to_string(),
        })
    }

    pub async fn complete_withdrawal(
        &self,
        transaction_id: Uuid,
        mpesa_reference: &str,
    ) -> Result<()> {
        let mut tx = self.pool.begin().await?;

        // Get transaction details
        let transaction = sqlx::query!(
            r#"
            SELECT amount, phone_number
            FROM transactions
            WHERE id = $1
            "#,
            transaction_id
        )
        .fetch_one(&self.pool)
        .await?;

        // Update transaction status
        sqlx::query!(
            r#"
            UPDATE transactions
            SET status = 'COMPLETED',
                completed_at = CURRENT_TIMESTAMP,
                mpesa_reference = $1
            WHERE id = $2
            "#,
            mpesa_reference,
            transaction_id,
        )
        .execute(&mut tx)
        .await?;

        // Send completion notification
        let notification_service = NotificationService::new()?;
        notification_service
            .send_withdrawal_completed(
                &transaction.phone_number,
                transaction.amount.to_f64().unwrap(),
            )
            .await?;

        tx.commit().await?;
        Ok(())
    }

    pub async fn fail_withdrawal(
        &self,
        transaction_id: Uuid,
        reason: &str,
    ) -> Result<()> {
        let mut tx = self.pool.begin().await?;

        // Get transaction details
        let transaction = sqlx::query!(
            r#"
            SELECT amount, phone_number, user_id
            FROM transactions
            WHERE id = $1
            "#,
            transaction_id
        )
        .fetch_one(&self.pool)
        .await?;

        // Refund the amount
        sqlx::query!(
            r#"
            UPDATE pension_funds
            SET balance = balance + $1
            WHERE user_id = $2
            "#,
            transaction.amount,
            transaction.user_id,
        )
        .execute(&mut tx)
        .await?;

        // Update transaction status
        sqlx::query!(
            r#"
            UPDATE transactions
            SET status = 'FAILED',
                failure_reason = $1
            WHERE id = $2
            "#,
            reason,
            transaction_id,
        )
        .execute(&mut tx)
        .await?;

        // Send failure notification
        let notification_service = NotificationService::new()?;
        notification_service
            .send_withdrawal_failed(&transaction.phone_number, reason)
            .await?;

        tx.commit().await?;
        Ok(())
    }

    pub async fn get_user_withdrawals(
        &self,
        user_id: Uuid,
    ) -> Result<Vec<WithdrawalRecord>> {
        let withdrawals = sqlx::query_as!(
            WithdrawalRecord,
            r#"
            SELECT 
                id as transaction_id,
                amount,
                status,
                created_at,
                completed_at
            FROM transactions
            WHERE user_id = $1 AND transaction_type = 'WITHDRAWAL'
            ORDER BY created_at DESC
            "#,
            user_id
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(withdrawals)
    }
}

#[derive(sqlx::Type)]
#[sqlx(type_name = "transaction_type")]
pub enum TransactionType {
    Deposit,
    Withdrawal,
}

impl ToString for TransactionType {
    fn to_string(&self) -> String {
        match self {
            TransactionType::Deposit => "DEPOSIT",
            TransactionType::Withdrawal => "WITHDRAWAL",
        }
        .to_string()
    }
}

pub struct PensionFund {
    pub id: Uuid,
    pub user_id: Uuid,
    pub investment_plan: InvestmentPlan,
    pub balance: Decimal,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

pub struct Transaction {
    pub id: Uuid,
    pub status: String,
}

pub struct WithdrawalRecord {
    pub transaction_id: Uuid,
    pub amount: f64,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
} 