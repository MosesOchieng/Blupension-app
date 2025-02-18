use actix_web::{
    web::{self, Data, Json},
    HttpResponse,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use validator::Validate;

use crate::error::{Error, Result};
use crate::models::auth::{AuthResponse, LoginRequest};
use crate::services::AuthService;

#[derive(Debug, Deserialize, Validate)]
pub struct RegisterRequest {
    #[validate(email)]
    pub email: String,
    #[validate(length(min = 6))]
    pub password: String,
    pub phone_number: String,
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    token: String,
}

pub async fn register(
    auth_service: Data<AuthService>,
    req: Json<RegisterRequest>,
) -> Result<HttpResponse> {
    match auth_service
        .register(
            req.email.clone(),
            req.password.clone(),
            req.phone_number.clone(),
        )
        .await
    {
        Ok(token) => Ok(HttpResponse::Ok().json(AuthResponse { token })),
        Err(Error::Database(e))
            if e.as_database_error()
                .and_then(|e| e.code())
                .map_or(false, |code| code == "23505") =>
        {
            Ok(HttpResponse::Conflict().json(json!({ "error": "Email already exists" })))
        }
        Err(e) => Err(e),
    }
}

pub async fn login(
    service: web::Data<AuthService>,
    credentials: web::Json<LoginRequest>,
) -> Result<HttpResponse> {
    let token = service
        .login(credentials.email.clone(), credentials.password.clone())
        .await?;
    Ok(HttpResponse::Ok().json(token))
}

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/auth")
            .route("/register", web::post().to(register))
            .route("/login", web::post().to(login)),
    );
}
