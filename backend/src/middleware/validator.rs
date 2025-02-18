use actix_web::{
    dev::{Service, ServiceRequest, ServiceResponse, Transform},
    error::ErrorBadRequest,
    Error,
};
use futures::future::{ready, Ready};
use validator::Validate;

pub struct RequestValidator;

impl<S, B> Transform<S, ServiceRequest> for RequestValidator
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Transform = RequestValidatorMiddleware<S>;
    type InitError = ();
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ready(Ok(RequestValidatorMiddleware { service }))
    }
}

pub struct RequestValidatorMiddleware<S> {
    service: S,
}

impl<S, B> Service<ServiceRequest> for RequestValidatorMiddleware<S>
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
        let fut = self.service.call(req);

        Box::pin(async move {
            let res = fut.await?;
            
            if let Some(data) = res.request().app_data::<actix_web::web::Json<impl Validate>>() {
                if let Err(errors) = data.validate() {
                    return Err(ErrorBadRequest(errors));
                }
            }
            
            Ok(res)
        })
    }
} 