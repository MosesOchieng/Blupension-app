use actix_web::{web, HttpResponse};

pub fn investment_config() -> web::ServiceConfig {
    web::ServiceConfig::new()
        .service(
            web::scope("/investments")
                // Add your investment routes here
        )
} 