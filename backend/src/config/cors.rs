use actix_cors::Cors;
use actix_web::http::header;

pub fn cors_config() -> Cors {
    Cors::default()
        .allowed_origin("http://localhost:3000") // Frontend development URL
        .allowed_origin("https://your-production-domain.com") // Production URL
        .allowed_methods(vec!["GET", "POST", "PUT", "DELETE"])
        .allowed_headers(vec![
            header::AUTHORIZATION,
            header::ACCEPT,
            header::CONTENT_TYPE,
        ])
        .supports_credentials()
        .max_age(3600)
} 