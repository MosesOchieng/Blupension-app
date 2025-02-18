pub struct PortfolioService {
    pool: PgPool,
    blockchain_client: BlockchainClient,
}

impl PortfolioService {
    pub async fn get_user_portfolio(&self, user_id: Uuid) -> Result<Portfolio> {
        let investments = sqlx::query_as!(
            Investment,
            r#"
            SELECT id, amount, status, created_at 
            FROM investments 
            WHERE user_id = $1
            ORDER BY created_at DESC
            "#,
            user_id
        )
        .fetch_all(&self.pool)
        .await?;

        let on_chain_balance = self.blockchain_client
            .get_user_balance(user_id)
            .await?;

        Ok(Portfolio {
            investments,
            total_balance: on_chain_balance,
        })
    }
}
