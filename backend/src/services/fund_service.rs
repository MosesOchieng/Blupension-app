use crate::blockchain::BlockchainClient;
use crate::db::{PgPool, Transaction};
use crate::models::{Investment, WithdrawalLimits};
use anyhow::Result;
use chrono::Utc;
use uuid::Uuid;

pub struct FundService {
    db: PgPool,
    blockchain: BlockchainClient,
}

impl FundService {
    pub fn new(db: PgPool, blockchain: BlockchainClient) -> Self {
        Self { db, blockchain }
    }

    pub async fn invest(
        &self,
        user_id: Uuid,
        amount: u64,
        stablecoin_percentage: u8,
    ) -> Result<Transaction> {
        let tx = self.blockchain.invest(amount, stablecoin_percentage).await?;
        
        let transaction = sqlx::query_as!(
            Transaction,
            r#"
            INSERT INTO transactions (user_id, type, amount, status)
            VALUES ($1, 'deposit', $2, 'pending')
            RETURNING *
            "#,
            user_id,
            amount as i64
        )
        .fetch_one(&self.db)
        .await?;

        Ok(transaction)
    }

    pub async fn get_withdrawal_limits(&self, user_id: Uuid) -> Result<WithdrawalLimits> {
        let investment = self.get_investment(user_id).await?;
        let daily_withdrawals = self.get_daily_withdrawals(user_id).await?;
        let monthly_withdrawals = self.get_monthly_withdrawals(user_id).await?;

        Ok(WithdrawalLimits {
            min_amount: 1000, // 1000 KES minimum
            max_daily_amount: 70000, // 70,000 KES daily limit
            max_monthly_amount: 1000000, // 1,000,000 KES monthly limit
            remaining_daily_limit: 70000 - daily_withdrawals,
            remaining_monthly_limit: 1000000 - monthly_withdrawals,
        })
    }
} 

use sqlx::PgPool;
use uuid::Uuid;
use rust_decimal::Decimal;
use chrono::{DateTime, Utc};

impl FundService {
    pub async fn create_withdrawal(
        &self,
        user_id: Uuid,
        amount: Decimal,
        phone_number: &str,
    ) -> Result<Transaction> {
        let mut tx = self.pool.begin().await?;

        // Check withdrawal limits
        self.check_withdrawal_limits(user_id, amount).await?;

        let transaction = sqlx::query_as!(
            Transaction,
            r#"
            INSERT INTO transactions (user_id, amount, type, status, phone_number)
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
}
