use actix_web::{web, HttpResponse};
use serde::{Deserialize, Serialize};
use crate::error::Result;
use crate::services::MpesaService;

#[derive(Debug, Serialize)]
pub struct STKPushRequest {
    pub phone_number: String,
    pub amount: i64,
    pub account_reference: String,
}

#[derive(Debug, Deserialize)]
pub struct STKCallback {
    pub merchant_request_id: String,
    pub checkout_request_id: String,
    pub result_code: i32,
    pub result_desc: String,
}

pub async fn initiate_stk_push(
    mpesa_service: web::Data<MpesaService>,
    req: web::Json<STKPushRequest>,
) -> Result<HttpResponse> {
    let result = mpesa_service
        .initiate_stk_push(
            &req.phone_number,
            req.amount,
            &req.account_reference,
        )
        .await?;

    Ok(HttpResponse::Ok().json(result))
}

pub async fn stk_callback(
    mpesa_service: web::Data<MpesaService>,
    payload: web::Json<STKCallback>,
) -> Result<HttpResponse> {
    mpesa_service
        .process_stk_callback(payload.into_inner())
        .await?;

    Ok(HttpResponse::Ok().finish())
}

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/mpesa")
            .route("/stkpush", web::post().to(initiate_stk_push))
            .route("/callback", web::post().to(stk_callback))
    );
} 