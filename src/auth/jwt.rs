use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: Uuid,
    pub exp: usize,
}

pub fn create_token(user_id: Uuid) -> Result<String, jsonwebtoken::errors::Error> {
    let claims = Claims {
        sub: user_id,
        exp: 10000000000,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(b"secret"),
    )
}
