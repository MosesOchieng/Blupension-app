use crate::error::{Error, Result};
use crate::models::auth::{AuthResponse, UserResponse};
use crate::models::User;
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use chrono::{Duration, Utc};
use jsonwebtoken::{encode, EncodingKey, Header, Validation};
use rand::Rng;
use sqlx::PgPool;
use uuid::Uuid;

pub struct AuthService {
    pool: PgPool,
    jwt_secret: String,
    refresh_token_secret: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TokenPair {
    access_token: String,
    refresh_token: String,
}

impl AuthService {
    pub fn new(pool: PgPool, jwt_secret: String, refresh_token_secret: String) -> Self {
        Self {
            pool,
            jwt_secret,
            refresh_token_secret,
        }
    }

    pub async fn login(&self, email: String, password: String) -> Result<AuthResponse> {
        let user = sqlx::query!(
            "SELECT id, email, password_hash FROM users WHERE email = $1",
            email
        )
        .fetch_optional(&self.pool)
        .await?
        .ok_or(Error::InvalidCredentials)?;

        let parsed_hash =
            PasswordHash::new(&user.password_hash).map_err(|_| Error::InvalidCredentials)?;

        if !Argon2::default()
            .verify_password(password.as_bytes(), &parsed_hash)
            .is_ok()
        {
            return Err(Error::InvalidCredentials);
        }

        let token = self.create_token(user.id)?;

        Ok(AuthResponse {
            token,
            user: UserResponse {
                id: user.id.to_string(),
                email: user.email,
            },
        })
    }

    pub async fn register(&self, email: String, password: String, phone: String) -> Result<String> {
        let salt = rand::thread_rng().gen::<[u8; 32]>();
        let config = Config::default();
        let hash = hash_encoded(password.as_bytes(), &salt, &config)?;

        let user = sqlx::query!(
            "INSERT INTO users (email, password_hash, phone_number) VALUES ($1, $2, $3) RETURNING id",
            email,
            hash,
            phone
        )
        .fetch_one(&self.pool)
        .await?;

        self.generate_jwt_token(user.id)
    }

    fn generate_jwt_token(&self, user_id: Uuid) -> Result<String> {
        let claims = Claims {
            sub: user_id,
            exp: (Utc::now() + Duration::hours(24)).timestamp() as usize,
        };

        encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(self.jwt_secret.as_bytes()),
        )
        .map_err(Error::JWT)
    }

    async fn store_refresh_token(&self, user_id: &Uuid, refresh_token: &str) -> Result<()> {
        sqlx::query!(
            r#"
            INSERT INTO refresh_tokens (user_id, token, expires_at)
            VALUES ($1, $2, NOW() + INTERVAL '30 days')
            "#,
            user_id,
            refresh_token
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn refresh_token(&self, refresh_token: &str) -> Result<TokenPair> {
        let claims = self.verify_refresh_token(refresh_token)?;

        let token_exists = sqlx::query!(
            "SELECT EXISTS(SELECT 1 FROM refresh_tokens WHERE token = $1 AND is_revoked = false)",
            refresh_token
        )
        .fetch_one(&self.pool)
        .await?
        .exists
        .unwrap_or(false);

        if !token_exists {
            return Err(Error::InvalidToken);
        }

        let token_pair = self.generate_token_pair(claims.sub)?;

        // Revoke old refresh token and store new one
        sqlx::query!(
            "UPDATE refresh_tokens SET is_revoked = true WHERE token = $1",
            refresh_token
        )
        .execute(&self.pool)
        .await?;

        self.store_refresh_token(&claims.sub, &token_pair.refresh_token)
            .await?;

        Ok(token_pair)
    }

    pub async fn logout(&self, refresh_token: &str) -> Result<()> {
        sqlx::query!(
            "UPDATE refresh_tokens SET is_revoked = true WHERE token = $1",
            refresh_token
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    fn create_token(&self, user_id: uuid::Uuid) -> Result<String> {
        // Token creation logic here...
        Ok("dummy_token".to_string())
    }
}
