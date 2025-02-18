use crate::error::Result;
use actix_web::{web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use validator::Validate;

use crate::auth::AuthenticatedUser;
use crate::middleware::auth::Claims;
use crate::services::InvestmentService;

#[derive(Debug, Deserialize, Validate)]
pub struct CreateInvestmentRequest {
    #[validate(range(min = 1000))] // Minimum 1000 KES
    pub amount: i64,
    #[validate(range(min = 0, max = 100))]
    pub stablecoin_percentage: i32,
}

#[derive(Debug, Deserialize, Validate)]
pub struct UpdateRiskProfileRequest {
    #[validate(range(min = 18, max = 100))]
    pub age: i32,
    #[validate(range(min = 0))]
    pub income: i64,
    #[validate(range(min = 1, max = 10))]
    pub risk_tolerance: i32,
    #[validate(range(min = 1, max = 30))]
    pub investment_horizon: i32,
}

pub async fn create_investment(
    service: web::Data<InvestmentService>,
    user: AuthenticatedUser,
    req: web::Json<CreateInvestmentRequest>,
) -> impl Responder {
    let investment = service.create_investment(user.sub, req.amount).await?;

    Ok(HttpResponse::Ok().json(investment))
}

pub async fn get_portfolio(
    service: web::Data<InvestmentService>,
    user: AuthenticatedUser,
) -> impl Responder {
    let portfolio = service.get_portfolio(user.sub).await?;
    Ok(HttpResponse::Ok().json(portfolio))
}

pub async fn update_risk_profile(
    service: web::Data<InvestmentService>,
    user: AuthenticatedUser,
    req: web::Json<UpdateRiskProfileRequest>,
) -> impl Responder {
    let profile = service
        .update_risk_profile(
            user.sub,
            req.age,
            req.income,
            req.risk_tolerance,
            req.investment_horizon,
        )
        .await?;

    Ok(HttpResponse::Ok().json(profile))
}

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/investments")
            .route("", web::post().to(create_investment))
            .route("", web::get().to(get_portfolio))
            .route("/risk-profile", web::put().to(update_risk_profile)),
    );
}
