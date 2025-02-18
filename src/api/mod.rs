use actix_web::web;

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api")
            .service(auth::auth_config())
            .service(investments::investment_config())
            .service(transactions::transaction_config())
    );
}

pub mod auth;
pub mod investments;
pub mod transactions; 