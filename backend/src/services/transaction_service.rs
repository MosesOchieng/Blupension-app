use crate::blockchain::BlockchainClient;
use crate::db::PgPool;
use crate::models::{Transaction, WithdrawalLimits};
use anyhow::Result;
use chrono::{Duration, Utc};
use uuid::Uuid;

pub struct TransactionService {
    db: PgPool,
    blockchain: BlockchainClient,
}

impl TransactionService {
    pub fn new(db: PgPool, blockchain: BlockchainClient) -> Self {
        Self { db, blockchain }
    }

    pub async fn create_deposit(
        &self,
        user_id: Uuid,
        amount: i64,
        phone_number: String,
    ) -> Result<Transaction> {
        let mut tx = self.db.begin().await?;

        let transaction = sqlx::query_as!(
            Transaction,
            r#"
            INSERT INTO transactions (
                user_id,
                type,
                amount,
                status,
                phone_number
            )
            VALUES ($1, 'deposit', $2, 'pending', $3)
            RETURNING *
            "#,
            user_id,
            amount,
            phone_number
        )
        .fetch_one(&mut tx)
        .await?;

        // Here you would integrate with M-Pesa API
        // For now, we'll just simulate it
        
        tx.commit().await?;
        Ok(transaction)
    }
    pub async fn create_withdrawal(
        &self,
        user_id: Uuid,
        amount: Decimal,
        phone_number: String,
    ) -> Result<Transaction> {
        let mut tx = self.pool.begin().await?;

        let transaction = sqlx::query_as!(
            Transaction,
            r#"
            INSERT INTO transactions (
                user_id, 
                amount, 
                type, 
                status, 
                phone_number
            )
            VALUES ($1, $2, 'WITHDRAWAL', 'PENDING', $3)
            RETURNING *
            "#,
            user_id,
            amount,
            phone_number
        )
        .fetch_one(&mut tx)
        .await?;

        tx.commit().await?;
        Ok(transaction)
    }
    pub async fn get_transactions(
        &self,
        user_id: Uuid,
        limit: i64,
        offset: i64,
    ) -> Result<Vec<Transaction>> {
        let transactions = sqlx::query_as!(
            Transaction,
            r#"
            SELECT * FROM transactions
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
            "#,
            user_id,
            limit,
            offset
        )
        .fetch_all(&self.db)
        .await?;

        Ok(transactions)
    }

    pub async fn get_withdrawal_limits(&self, user_id: Uuid) -> Result<WithdrawalLimits> {
        let today = Utc::now().date_naive();
        let month_start = today.and_hms_opt(0, 0, 0).unwrap();

        let daily_withdrawals = sqlx::query_scalar!(
            r#"
            SELECT COALESCE(SUM(amount), 0) FROM transactions
            WHERE user_id = $1
            AND type = 'withdrawal'
            AND created_at >= $2
            AND status != 'failed'
            "#,
            user_id,
            today
        )
        .fetch_one(&self.db)
        .await?;

        let monthly_withdrawals = sqlx::query_scalar!(
            r#"
            SELECT COALESCE(SUM(amount), 0) FROM transactions
            WHERE user_id = $1
            AND type = 'withdrawal'
            AND created_at >= $2
            AND status != 'failed'
            "#,
            user_id,
            month_start
        )
        .fetch_one(&self.db)
        .await?;

        Ok(WithdrawalLimits {
            min_amount: 1000,
            max_daily_amount: 70_000,
            max_monthly_amount: 1_000_000,
            remaining_daily_limit: 70_000 - daily_withdrawals,
            remaining_monthly_limit: 1_000_000 - monthly_withdrawals,
        })
    }

    pub async fn update_transaction_status(
        &self,
        transaction_id: Uuid,
        status: &str,
        mpesa_reference: Option<String>,
    ) -> Result<Transaction> {
        let transaction = sqlx::query_as!(
            Transaction,
            r#"
            UPDATE transactions
            SET status = $2,
                mpesa_reference = $3,
                completed_at = CASE WHEN $2 = 'completed' THEN NOW() ELSE completed_at END
            WHERE id = $1
            RETURNING *
            "#,
            transaction_id,
            status,
            mpesa_reference
        )
        .fetch_one(&self.db)
        .await?;

        Ok(transaction)
    }
} 

impl TransactionService {
    pub async fn create_transaction(
        &self,
        user_id: Uuid,
        amount: Decimal,
    ) -> Result<Transaction> {
        let transaction = sqlx::query_as!(
            Transaction,
            r#"
            INSERT INTO transactions (user_id, amount, type, status)
            VALUES ($1, $2, 'DEPOSIT', 'PENDING')
            RETURNING id, user_id, amount, type as "transaction_type: TransactionType", status as "status: TransactionStatus", created_at
            "#,
            user_id,
            amount
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(transaction)
    }
}
