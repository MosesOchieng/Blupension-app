use actix_web::{
    dev::{Service, ServiceRequest, ServiceResponse, Transform},
    Error, HttpResponse,
};
use futures::future::{ok, Ready};
use std::task::{Context, Poll};
use std::time::Duration;

pub struct Cache {
    max_age: Duration,
}

impl Cache {
    pub fn new(max_age: Duration) -> Self {
        Self { max_age }
    }
}

impl<S, B> Transform<S, ServiceRequest> for Cache
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type InitError = ();
    type Transform = CacheMiddleware<S>;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ok(CacheMiddleware {
            service,
            max_age: self.max_age,
        })
    }
}

pub struct CacheMiddleware<S> {
    service: S,
    max_age: Duration,
}

impl<S, B> Service<ServiceRequest> for CacheMiddleware<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = S::Future;

    fn poll_ready(&self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.service.poll_ready(cx)
    }

    fn call(&self, req: ServiceRequest) -> Self::Future {
        if req.method() == "GET" {
            let fut = self.service.call(req);
            let max_age = self.max_age;
            
            Box::pin(async move {
                let mut res = fut.await?;
                
                res.headers_mut().insert(
                    header::CACHE_CONTROL,
                    HeaderValue::from_str(&format!("public, max-age={}", max_age.as_secs()))
                        .unwrap(),
                );
                
                Ok(res)
            })
        } else {
            self.service.call(req)
        }
    }
} 