use axum::{
    extract::{Path, State},
    Json,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{
    auth::{create_token, AuthUser},
    error::Error,
    services::user_service::UserService,
};

#[derive(Deserialize)]
pub struct CreateUserRequest {
    username: String,
    email: String,
    wallet_address: String,
}

#[derive(Serialize)]
pub struct UserResponse {
    id: Uuid,
    username: String,
    email: String,
    wallet_address: String,
}

#[derive(Deserialize)]
pub struct LoginRequest {
    email: String,
    password: String,
}

#[derive(Serialize)]
pub struct LoginResponse {
    token: String,
    user_id: Uuid,
}

pub async fn create_user(
    Json(payload): Json<CreateUserRequest>,
) -> Json<UserResponse> {
    // TODO: Implement user creation logic
    Json(UserResponse {
        id: Uuid::new_v4(),
        username: payload.username,
        email: payload.email,
        wallet_address: payload.wallet_address,
    })
}

pub async fn get_user(
    Path(user_id): Path<Uuid>,
) -> Json<UserResponse> {
    // TODO: Implement user retrieval logic
    Json(UserResponse {
        id: user_id,
        username: "test_user".to_string(),
        email: "test@example.com".to_string(),
        wallet_address: "STELLAR_ADDRESS".to_string(),
    })
}

pub async fn login(
    State(user_service): State<UserService>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<LoginResponse>, Error> {
    let user = user_service
        .verify_password(&payload.email, &payload.password)
        .await?
        .ok_or(Error::Unauthorized)?;

    let token = create_token(user.id)?;

    Ok(Json(LoginResponse {
        token,
        user_id: user.id,
    }))
}

// Example of a protected route
pub async fn get_profile(
    auth_user: AuthUser,
    State(user_service): State<UserService>,
) -> Result<Json<UserResponse>, Error> {
    let user = user_service
        .get_user(auth_user.user_id)
        .await?
        .ok_or(Error::Unauthorized)?;

    Ok(Json(UserResponse::from(user)))
} 