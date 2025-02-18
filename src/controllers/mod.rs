use actix_web::web;

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api")
            .service(web::scope("/auth"))
            .service(web::scope("/users"))
            .service(web::scope("/wallet"))
    );
} 