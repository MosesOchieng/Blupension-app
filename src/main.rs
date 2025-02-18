use actix_web::{web, App, HttpServer};
use actix_cors::Cors;
use sqlx::PgPool;

mod api;
mod blockchain;
mod config;
mod db;
mod error;
mod logging;
mod metrics;
mod services;
mod auth;

use crate::config::Settings;
use crate::logging::setup_logging;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    setup_logging();

    let settings = Settings::load()
        .expect("Failed to load settings");

    let pool = db::init_pool(&settings.database.url)
        .await
        .expect("Failed to initialize database");

    let blockchain_client = blockchain::BlockchainClient::new(
        &settings.blockchain.rpc_url,
        &settings.blockchain.private_key,
    );

    HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin("http://localhost:3000")
            .allowed_methods(vec!["GET", "POST"])
            .allowed_headers(vec![
                http::header::AUTHORIZATION,
                http::header::ACCEPT,
                http::header::CONTENT_TYPE,
            ])
            .max_age(3600);

        App::new()
            .wrap(cors)
            .app_data(web::Data::new(pool.clone()))
            .app_data(web::Data::new(blockchain_client.clone()))
            .configure(api::config)
    })
    .bind(format!("{}:{}", settings.server.host, settings.server.port))?
    .run()
    .await
}
