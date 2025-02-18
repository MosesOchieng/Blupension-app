use axum::{
    routing::{get, post},
    Router,
};
use blupension::api::handlers::{fund, user, investment, deposit, withdrawal};
use std::net::SocketAddr;
use tower_http::cors::CorsLayer;
use crate::services::user_service::UserService;

#[tokio::main]
async fn main() {
    // Initialize tracing
    tracing_subscriber::fmt::init();

    let user_service = UserService::new(pool.clone());

    let app = Router::new()
        // Public routes
        .route("/api/users", post(user::create_user))
        .route("/api/login", post(user::login))
        // Protected routes
        .route(
            "/api/profile",
            get(user::get_profile)
                .put(user::update_profile),
        )
        // Fund routes
        .route("/api/funds", post(fund::create_fund))
        .route("/api/funds/:id", get(fund::get_fund))
        .route("/api/funds/:id/deposit", post(fund::deposit))
        .route("/api/funds/:id/withdraw", post(fund::withdraw))
        // Investment routes
        .route("/api/investment/profile", 
            put(investment::update_risk_profile)
        )
        .route("/api/investment/allocation", 
            get(investment::get_current_allocation)
        )
        .route("/api/investment/recommendation", 
            get(investment::get_recommendation)
        )
        .route("/api/investment/plans", get(investment::get_investment_plans))
        // Deposit routes
        .route("/api/deposit", post(deposit::initiate_deposit))
        .route("/api/deposit/callback", post(deposit::mpesa_callback))
        // Withdrawal routes
        .route("/api/withdrawal", post(withdrawal::initiate_withdrawal))
        .route("/api/withdrawal/history", get(withdrawal::get_withdrawal_history))
        .with_state(user_service)
        .layer(CorsLayer::permissive());

    // Run it
    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    tracing::info!("listening on {}", addr);
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
} 