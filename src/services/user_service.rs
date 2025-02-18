use anyhow::Result;
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use sqlx::PgPool;
use uuid::Uuid;

pub struct UserService {
    pool: PgPool,
}

#[derive(Debug)]
pub struct User {
    pub id: Uuid,
    pub username: String,
    pub email: String,
    pub wallet_address: String,
    pub password_hash: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

impl UserService {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn create_user(
        &self,
        username: String,
        email: String,
        wallet_address: String,
        password: String,
    ) -> Result<Uuid> {
        // Hash password
        let salt = SaltString::generate(&mut OsRng);
        let argon2 = Argon2::default();
        let password_hash = argon2
            .hash_password(password.as_bytes(), &salt)?
            .to_string();

        let user_id = Uuid::new_v4();

        sqlx::query!(
            r#"
            INSERT INTO users (id, username, email, wallet_address, password_hash)
            VALUES ($1, $2, $3, $4, $5)
            "#,
            user_id,
            username,
            email,
            wallet_address,
            password_hash,
        )
        .execute(&self.pool)
        .await?;

        Ok(user_id)
    }

    pub async fn get_user(&self, user_id: Uuid) -> Result<Option<User>> {
        let user = sqlx::query_as!(
            User,
            r#"
            SELECT * FROM users WHERE id = $1
            "#,
            user_id
        )
        .fetch_optional(&self.pool)
        .await?;

        Ok(user)
    }

    pub async fn verify_password(&self, email: &str, password: &str) -> Result<Option<User>> {
        let user = sqlx::query_as!(
            User,
            r#"
            SELECT * FROM users WHERE email = $1
            "#,
            email
        )
        .fetch_optional(&self.pool)
        .await?;

        if let Some(user) = user {
            let parsed_hash = PasswordHash::new(&user.password_hash)?;
            if Argon2::default()
                .verify_password(password.as_bytes(), &parsed_hash)
                .is_ok()
            {
                return Ok(Some(user));
            }
        }

        Ok(None)
    }

    pub async fn update_wallet_address(
        &self,
        user_id: Uuid,
        wallet_address: String,
    ) -> Result<()> {
        sqlx::query!(
            r#"
            UPDATE users
            SET wallet_address = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            "#,
            wallet_address,
            user_id,
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }
} 