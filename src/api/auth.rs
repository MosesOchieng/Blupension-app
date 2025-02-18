use crate::error::Error;
use crate::models::auth::{AuthResponse, LoginRequest};
use crate::services::auth::AuthService;
use actix_web::web;
use actix_web::{
    web::{self, Data, Json},
    HttpResponse,
};

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/auth")
            .route("/bypass-auth", web::get().to(bypass_auth))
            .route("/register", web::post().to(register))
            .route("/login", web::post().to(login)),
    );
}

// Temporary bypass authentication endpoint
pub async fn bypass_auth() -> Result<Json<AuthResponse>, Error> {
    // Create a temporary token that will work for all requests
    let temp_token = "temporary_bypass_token".to_string();

    Ok(Json(AuthResponse {
        token: temp_token,
        // Add any other required fields
    }))
}

pub async fn login(
    service: Data<AuthService>,
    credentials: Json<LoginRequest>,
) -> Result<Json<AuthResponse>, Error> {
    let token = service.login(credentials.into_inner()).await?;
    Ok(Json(AuthResponse { token }))
}
