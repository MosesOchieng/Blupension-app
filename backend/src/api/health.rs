use actix_web::{web, HttpResponse};
use sqlx::PgPool;

#[derive(serde::Serialize)]
struct HealthResponse {
    status: String,
    database: String,
    version: String,
}

pub async fn health_check(db: web::Data<PgPool>) -> HttpResponse {
    let db_status = match sqlx::query("SELECT 1").fetch_one(db.get_ref()).await {
        Ok(_) => "healthy",
        Err(_) => "unhealthy",
    };

    HttpResponse::Ok().json(HealthResponse {
        status: "ok".to_string(),
        database: db_status.to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/health")
            .route("", web::get().to(health_check))
    );
} 