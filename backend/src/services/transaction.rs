use crate::error::Result;
use crate::models::{Transaction, WithdrawalLimits};
use sqlx::PgPool;
use uuid::Uuid;

pub struct TransactionService {
    pool: PgPool,
}

impl TransactionService {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn create_deposit(&self, user_id: Uuid, amount: i64) -> Result<Transaction> {
        let transaction = sqlx::query_as!(
            Transaction,
            r#"
            INSERT INTO transactions (user_id, amount, type, status)
            VALUES ($1, $2, 'DEPOSIT', 'PENDING')
            RETURNING *
            "#,
            user_id,
            amount
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(transaction)
    }

    pub async fn create_withdrawal(
        &self,
        user_id: Uuid,
        amount: i64,
        phone_number: String,
    ) -> Result<Transaction> {
        let transaction = sqlx::query_as!(
            Transaction,
            r#"
            INSERT INTO transactions (user_id, amount, type, status)
            VALUES ($1, $2, 'WITHDRAWAL', 'PENDING')
            RETURNING *
            "#,
            user_id,
            amount
        )
        .fetch_one(&self.pool)
        .await?;

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
            SELECT *
            FROM transactions 
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
            "#,
            user_id,
            limit,
            offset
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(transactions)
    }

    pub async fn get_withdrawal_limits(&self, user_id: Uuid) -> Result<WithdrawalLimits> {
        // Implement withdrawal limits logic
        Ok(WithdrawalLimits {
            min_amount: 1000,
            max_daily_amount: 70000,
            max_monthly_amount: 300000,
            remaining_daily_limit: 70000,
            remaining_monthly_limit: 300000,
        })
    }
}
