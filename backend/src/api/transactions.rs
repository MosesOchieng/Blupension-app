use actix_web::{web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use validator::Validate;
use uuid::Uuid;
use crate::middleware::auth::Claims;
use crate::services::TransactionService;
use crate::error::Error;
use crate::models::Transaction;
use crate::error::Result;

#[derive(Debug, Deserialize, Validate)]
pub struct CreateDepositRequest {
    #[validate(range(min = 1000))]
    amount: i64,
    #[validate(length(min = 10, max = 15))]
    phone_number: String,
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateWithdrawalRequest {
    #[validate(range(min = 1000))]
    amount: i64,
    #[validate(length(min = 10, max = 15))]
    phone_number: String,
}

#[derive(Debug, Deserialize)]
pub struct TransactionListQuery {
    limit: Option<i64>,
    offset: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct CreateTransactionRequest {
    pub amount: f64,
}

pub async fn create_deposit(
    transaction_service: web::Data<TransactionService>,
    claims: web::ReqData<Claims>,
    req: web::Json<CreateDepositRequest>,
) -> impl Responder {
    match transaction_service.create_deposit(claims.sub, req.amount).await {
        Ok(transaction) => HttpResponse::Ok().json(transaction),
        Err(e) => HttpResponse::InternalServerError().json(e.to_string()),
    }
}

pub async fn create_withdrawal(
    transaction_service: web::Data<TransactionService>,
    claims: web::ReqData<Claims>,
    req: web::Json<CreateWithdrawalRequest>,
) -> impl Responder {
    if let Err(e) = req.validate() {
        return HttpResponse::BadRequest().json(e);
    }

    match transaction_service
        .create_withdrawal(claims.sub, req.amount, req.phone_number.clone())
        .await
    {
        Ok(transaction) => HttpResponse::Ok().json(transaction),
        Err(e) => HttpResponse::BadRequest().json(e.to_string()),
    }
}

pub async fn get_transactions(
    transaction_service: web::Data<TransactionService>,
    claims: web::ReqData<Claims>,
    query: web::Query<TransactionListQuery>,
) -> impl Responder {
    let limit = query.limit.unwrap_or(10);
    let offset = query.offset.unwrap_or(0);

    match transaction_service.get_transactions(claims.sub, limit, offset).await {
        Ok(transactions) => HttpResponse::Ok().json(transactions),
        Err(e) => HttpResponse::InternalServerError().json(e.to_string()),
    }
}

pub async fn get_withdrawal_limits(
    transaction_service: web::Data<TransactionService>,
    claims: web::ReqData<Claims>,
) -> impl Responder {
    match transaction_service.get_withdrawal_limits(claims.sub).await {
        Ok(limits) => HttpResponse::Ok().json(limits),
        Err(e) => HttpResponse::InternalServerError().json(e.to_string()),
    }
}

pub async fn create_transaction(
    service: web::Data<TransactionService>,
    user_id: web::ReqData<Uuid>,
    req: web::Json<CreateTransactionRequest>,
) -> Result<HttpResponse, Error> {
    let transaction = service
        .create_transaction(user_id.into_inner(), req.amount)
        .await?;
    
    Ok(HttpResponse::Ok().json(transaction))
}

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/transactions")
            .wrap(crate::middleware::auth::Auth)
            .route("/deposit", web::post().to(create_deposit))
            .route("/withdraw", web::post().to(create_withdrawal))
            .route("", web::get().to(get_transactions))
            .route("/withdrawal-limits", web::get().to(get_withdrawal_limits)),
    );
}
