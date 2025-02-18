#![cfg_attr(target_family = "wasm", no_std)]

pub mod api;
pub mod contracts;
pub mod db;
pub mod services;
pub mod models;
pub mod auth;
pub mod utils;

#[cfg(not(target_family = "wasm"))]
use {
    anyhow::Result,
    sqlx::postgres::PgPool,
    actix_web::{web, App, HttpServer, http},
    std::env,
};

mod controllers;

use soroban_sdk::{contractimpl, symbol_short, vec, Env, Symbol, Vec};

pub struct Contract;

#[contractimpl]
impl Contract {
    pub fn hello(env: Env, to: Symbol) -> Vec<Symbol> {
        vec![&env, symbol_short!("Hello"), to]
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::Env;

    #[test]
    fn test() {
        let env = Env::default();
        let contract_id = env.register_contract(None, Contract);
        let client = ContractClient::new(&env, &contract_id);

        let words = client.hello(&symbol_short!("Dev"));
        assert_eq!(
            words,
            vec![&env, symbol_short!("Hello"), symbol_short!("Dev"),]
        );
    }
}

#[cfg(not(target_family = "wasm"))]
pub async fn initialize() -> Result<PgPool> {
    // Initialize database connection
    let database_url = std::env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set");
    
    let pool = PgPool::connect(&database_url).await?;
    
    // Initialize database schema
    db::schema::init_db(&pool).await?;
    
    Ok(pool)
}

#[cfg(not(target_family = "wasm"))]
pub async fn run() -> std::io::Result<()> {
    dotenv::dotenv().ok();
    env_logger::init();

    let database_url = std::env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set");
    
    let pool = PgPool::connect(&database_url)
        .await
        .expect("Failed to connect to Postgres");

    let stellar_service = services::stellar::StellarService::new(
        &std::env::var("STELLAR_NETWORK").unwrap_or_else(|_| "testnet".to_string()),
        &std::env::var("STELLAR_SECRET_KEY").expect("STELLAR_SECRET_KEY must be set"),
    )?;

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(pool.clone()))
            .app_data(web::Data::new(stellar_service.clone()))
            .wrap(
                actix_cors::Cors::default()
                    .allowed_headers(vec![
                        http::header::AUTHORIZATION,
                        http::header::ACCEPT,
                        http::header::CONTENT_TYPE,
                    ])
                    .max_age(3600)
            )
            .configure(api::config)
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}

pub async fn start_server() {
    // Server implementation
} 