use actix_web::web;
use super::handlers;

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api")
            .service(
                web::scope("/v1")
                    .service(
                        web::scope("/auth")
                            .route("/register", web::post().to(handlers::auth::register))
                            .route("/login", web::post().to(handlers::auth::login))
                            .route("/verify", web::post().to(handlers::auth::verify_email))
                    )
                    .service(
                        web::scope("/user")
                            .route("/profile", web::get().to(handlers::user::get_profile))
                            .route("/profile", web::patch().to(handlers::user::update_profile))
                            .route("/kyc", web::post().to(handlers::user::submit_kyc))
                    )
                    .service(
                        web::scope("/bpt")
                            .route("/balance", web::get().to(handlers::bpt::get_balance))
                            .route("/tokenize", web::post().to(handlers::bpt::tokenize_savings))
                            .route("/stake", web::post().to(handlers::bpt::stake_tokens))
                    )
                    .service(
                        web::scope("/payments")
                            .route("/mpesa/stkpush", web::post().to(handlers::payments::mpesa_stkpush))
                            .route("/mpesa/callback", web::post().to(handlers::payments::mpesa_callback))
                    )
            )
    );
} 