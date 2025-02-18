use actix_web::{web, HttpResponse, Scope};
use crate::services::{BPTManager, StellarService};
use crate::auth::AuthenticatedUser;

pub fn bpt_routes() -> Scope {
    web::scope("/bpt")
        .route("/balance", web::get().to(get_balance))
        .route("/tokenize", web::post().to(tokenize_savings))
        .route("/stake", web::post().to(stake_tokens))
        .route("/unstake", web::post().to(unstake_tokens))
        .route("/transfer", web::post().to(transfer_tokens))
        .route("/collateral", web::post().to(create_collateral))
}

async fn get_balance(
    user: AuthenticatedUser,
    bpt_manager: web::Data<BPTManager>,
) -> HttpResponse {
    match bpt_manager.get_user_bpt_balance(user.id).await {
        Ok(balance) => HttpResponse::Ok().json(balance),
        Err(e) => HttpResponse::InternalServerError().json(e.to_string()),
    }
}

// Implement other controller functions... 