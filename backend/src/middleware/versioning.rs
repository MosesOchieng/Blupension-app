use actix_web::{
    dev::{Service, ServiceRequest, ServiceResponse, Transform},
    Error, HttpResponse,
};
use futures::future::{ok, Ready};
use semver::Version;

pub struct ApiVersioning {
    min_version: Version,
}

impl ApiVersioning {
    pub fn new(min_version: &str) -> Self {
        Self {
            min_version: Version::parse(min_version).unwrap(),
        }
    }
}

impl<S, B> Transform<S, ServiceRequest> for ApiVersioning
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type InitError = ();
    type Transform = ApiVersioningMiddleware<S>;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ok(ApiVersioningMiddleware {
            service,
            min_version: self.min_version.clone(),
        })
    }
}

pub struct ApiVersioningMiddleware<S> {
    service: S,
    min_version: Version,
}

impl<S, B> Service<ServiceRequest> for ApiVersioningMiddleware<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = S::Future;

    fn poll_ready(&self, cx: &mut std::task::Context<'_>) -> std::task::Poll<Result<(), Self::Error>> {
        self.service.poll_ready(cx)
    }

    fn call(&self, req: ServiceRequest) -> Self::Future {
        if let Some(version) = req.headers().get("X-API-Version") {
            if let Ok(version) = version.to_str() {
                if let Ok(version) = Version::parse(version) {
                    if version >= self.min_version {
                        return self.service.call(req);
                    }
                }
            }
        }

        Box::pin(async move {
            Ok(req.into_response(
                HttpResponse::BadRequest()
                    .json(json!({
                        "error": "Invalid or missing API version",
                        "min_version": self.min_version.to_string()
                    }))
                    .into_body(),
            ))
        })
    }
} 