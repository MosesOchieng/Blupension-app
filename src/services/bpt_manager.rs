use sqlx::PgPool;
use super::stellar::StellarService;

#[derive(Clone)]
pub struct BPTManager {
    pool: PgPool,
    stellar: StellarService,
}

impl BPTManager {
    pub async fn new(pool: PgPool, stellar: StellarService) -> Self {
        Self { pool, stellar }
    }
} 