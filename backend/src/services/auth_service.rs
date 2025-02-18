use crate::db::PgPool;
use crate::models::User;
use anyhow::Result;
use argon2::{self, Config};
use jsonwebtoken::{encode, EncodingKey, Header};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: Uuid,
    pub email: String,
    pub exp: usize,
}

pub struct AuthService {
    db: PgPool,
    jwt_secret: String,
}

impl AuthService {
    pub fn new(db: PgPool, jwt_secret: String) -> Self {
        Self { db, jwt_secret }
    }

    pub async fn register(&self, email: String, password: String) -> Result<User> {
        let password_hash = self.hash_password(&password)?;

        let user = sqlx::query_as!(
            User,
            r#"
            INSERT INTO users (email, password_hash)
            VALUES ($1, $2)
            RETURNING *
            "#,
            email,
            password_hash
        )
        .fetch_one(&self.db)
        .await?;

        Ok(user)
    }

    pub async fn login(&self, email: String, password: String) -> Result<String> {
        let user = sqlx::query_as!(
            User,
            "SELECT * FROM users WHERE email = $1",
            email
        )
        .fetch_optional(&self.db)
        .await?
        .ok_or_else(|| anyhow::anyhow!("Invalid credentials"))?;

        if !self.verify_password(&password, &user.password_hash)? {
            return Err(anyhow::anyhow!("Invalid credentials"));
        }

        let token = self.create_token(user.id, user.email)?;
        Ok(token)
    }

    fn hash_password(&self, password: &str) -> Result<String> {
        let config = Config::default();
        let salt = b"randomsalt"; // In production, use a proper random salt
        let hash = argon2::hash_encoded(password.as_bytes(), salt, &config)?;
        Ok(hash)
    }

    fn verify_password(&self, password: &str, hash: &str) -> Result<bool> {
        Ok(argon2::verify_encoded(hash, password.as_bytes())?)
    }

    fn create_token(&self, user_id: Uuid, email: String) -> Result<String> {
        let exp = chrono::Utc::now()
            .checked_add_signed(chrono::Duration::hours(24))
            .unwrap()
            .timestamp() as usize;

        let claims = Claims {
            sub: user_id,
            email,
            exp,
        };

        let token = encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(self.jwt_secret.as_bytes()),
        )?;

        Ok(token)
    }
} 