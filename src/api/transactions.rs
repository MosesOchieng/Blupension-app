use actix_web::{web, HttpResponse};

pub fn transaction_config() -> web::ServiceConfig {
    web::ServiceConfig::new().service(
        web::scope("/transactions"), // Add your transaction routes here
    )
}
