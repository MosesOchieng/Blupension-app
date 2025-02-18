use actix_web::http::header;
use actix_web::middleware::DefaultHeaders;

pub fn security_headers() -> DefaultHeaders {
    DefaultHeaders::new()
        .add((header::X_XSS_PROTECTION, "1; mode=block"))
        .add((header::X_FRAME_OPTIONS, "DENY"))
        .add((header::X_CONTENT_TYPE_OPTIONS, "nosniff"))
        .add((
            header::STRICT_TRANSPORT_SECURITY,
            "max-age=31536000; includeSubDomains",
        ))
        .add((
            header::CONTENT_SECURITY_POLICY,
            "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
        ))
} 