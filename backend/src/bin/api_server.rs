use actix_web::{web, App, HttpServer};
use sqlx::PgPool;
use dotenv::dotenv;

use blupension::{
    api::{auth, investments, transactions},
    services::{AuthService, InvestmentService, TransactionService},
    configure_cors,
};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv::dotenv().ok();
    env_logger::init();

    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let pool = PgPool::connect(&database_url)
        .await
        .expect("Failed to connect to Postgres");

    let auth_service = web::Data::new(AuthService::new(
        pool.clone(),
        std::env::var("JWT_SECRET").expect("JWT_SECRET must be set"),
    ));

    let investment_service = web::Data::new(InvestmentService::new(pool.clone()));
    let transaction_service = web::Data::new(TransactionService::new(pool));

    HttpServer::new(move || {
        App::new()
            .wrap(configure_cors())
            .app_data(auth_service.clone())
            .app_data(investment_service.clone())
            .app_data(transaction_service.clone())
            .configure(auth::config)
            .configure(investments::config)
            .configure(transactions::config)
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
} 