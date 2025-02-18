use actix_web::{
    dev::{Service, ServiceRequest, ServiceResponse, Transform},
    error::ErrorTooManyRequests,
    Error,
};
use futures::future::{ready, Ready};
use std::time::{Duration, Instant};
use tokio::sync::RwLock;
use std::collections::HashMap;
use std::sync::Arc;

pub struct RateLimit {
    requests_per_minute: u32,
}

impl RateLimit {
    pub fn new(requests_per_minute: u32) -> Self {
        Self { requests_per_minute }
    }
}

impl<S, B> Transform<S, ServiceRequest> for RateLimit
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Transform = RateLimitMiddleware<S>;
    type InitError = ();
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ready(Ok(RateLimitMiddleware {
            service,
            rate_limit: self.requests_per_minute,
            requests: Arc::new(RwLock::new(HashMap::new())),
        }))
    }
}

pub struct RateLimitMiddleware<S> {
    service: S,
    rate_limit: u32,
    requests: Arc<RwLock<HashMap<String, Vec<Instant>>>>,
}

impl<S, B> Service<ServiceRequest> for RateLimitMiddleware<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = futures::future::BoxFuture<'static, Result<Self::Response, Self::Error>>;

    fn poll_ready(&self, ctx: &mut core::task::Context<'_>) -> std::task::Poll<Result<(), Self::Error>> {
        self.service.poll_ready(ctx)
    }

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let ip = req.peer_addr()
            .map(|addr| addr.ip().to_string())
            .unwrap_or_else(|| "unknown".to_string());
        
        let requests = self.requests.clone();
        let rate_limit = self.rate_limit;
        let fut = self.service.call(req);

        Box::pin(async move {
            let mut requests = requests.write().await;
            let now = Instant::now();
            
            // Remove requests older than 1 minute
            requests.entry(ip.clone())
                .and_modify(|reqs| {
                    reqs.retain(|&time| now.duration_since(time) < Duration::from_secs(60));
                });

            let count = requests.entry(ip.clone())
                .or_insert_with(Vec::new)
                .len();

            if count >= rate_limit as usize {
                return Err(ErrorTooManyRequests("Too many requests".into()));
            }

            requests.entry(ip).and_modify(|reqs| reqs.push(now));
            
            fut.await
        })
    }
} 