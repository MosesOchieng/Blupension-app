use actix_web::{web, HttpResponse};
use uuid::Uuid;
use crate::services::FundService;

pub async fn create_withdrawal(
    fund_service: web::Data<FundService>,
    user_id: web::ReqData<Uuid>,
    req: web::Json<CreateWithdrawalRequest>,
) -> Result<HttpResponse> {
    let withdrawal = fund_service
        .create_withdrawal(
            user_id.into_inner(),
            req.amount,
            &req.phone_number
        )
        .await?;

    Ok(HttpResponse::Ok().json(withdrawal))
}

pub async fn get_withdrawal_history(
    fund_service: web::Data<FundService>,
    user_id: web::ReqData<Uuid>,
) -> Result<HttpResponse> {
    let withdrawals = fund_service
        .get_user_withdrawals(user_id.into_inner())
        .await?;

    Ok(HttpResponse::Ok().json(withdrawals))
}
