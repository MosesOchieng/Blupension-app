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

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let pool = PgPool::connect(&std::env::var("DATABASE_URL").expect("DATABASE_URL must be set"))
        .await
        .expect("Failed to connect to Postgres");

    HttpServer::new(move || {
        App::new()
            .wrap(
                Cors::default()
                    .allow_any_origin()
                    .allow_any_method()
                    .allow_any_header()
            )
            .app_data(web::Data::new(pool.clone()))
            .service(
                web::scope("/api")
                    .service(web::resource("/auth/register").route(web::post().to(api::auth::register)))
                    .service(web::resource("/auth/login").route(web::post().to(api::auth::login)))
            )
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}