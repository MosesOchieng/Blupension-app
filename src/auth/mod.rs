use axum::{
    async_trait,
    extract::{FromRequestParts, TypedHeader},
    http::request::Parts,
    RequestPartsExt,
};
use axum_extra::headers::{authorization::Bearer, Authorization};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use time::{Duration, OffsetDateTime};
use uuid::Uuid;

use crate::error::Error;

const JWT_SECRET: &[u8] = b"your-secret-key"; // In production, use environment variables
const TOKEN_DURATION_HOURS: i64 = 24;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: Uuid, // User ID
    pub exp: i64,  // Expiration time
    pub iat: i64,  // Issued at
}

impl Claims {
    pub fn new(user_id: Uuid) -> Self {
        let now = OffsetDateTime::now_utc();
        let exp = now + Duration::hours(TOKEN_DURATION_HOURS);

        Self {
            sub: user_id,
            exp: exp.unix_timestamp(),
            iat: now.unix_timestamp(),
        }
    }
}

#[derive(Debug, Clone)]
pub struct AuthUser {
    pub user_id: Uuid,
}

#[async_trait]
impl<S> FromRequestParts<S> for AuthUser
where
    S: Send + Sync,
{
    type Rejection = Error;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        let TypedHeader(Authorization(bearer)) = parts
            .extract::<TypedHeader<Authorization<Bearer>>>()
            .await
            .map_err(|_| Error::Unauthorized)?;

        let token_data = decode::<Claims>(
            bearer.token(),
            &DecodingKey::from_secret(JWT_SECRET),
            &Validation::default(),
        )
        .map_err(|_| Error::Unauthorized)?;

        Ok(AuthUser {
            user_id: token_data.claims.sub,
        })
    }
}

pub fn create_token(user_id: Uuid) -> Result<String, Error> {
    let claims = Claims::new(user_id);
    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(JWT_SECRET),
    )
    .map_err(|_| Error::TokenCreation)
}

mod jwt;
mod middleware;

pub use jwt::*;
pub use middleware::*; 