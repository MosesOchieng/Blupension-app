pub async fn create_investment(
    auth_user: AuthUser,
    State(investment_service): State<InvestmentService>,
    Json(payload): Json<CreateInvestmentRequest>,
) -> Result<Json<Investment>, Error> {
    let investment = investment_service
        .create_investment(auth_user.user_id, payload.amount as f64)
        .await?;

    Ok(Json(investment))
}

pub async fn get_investments(
    auth_user: AuthUser,
    State(investment_service): State<InvestmentService>,
) -> Result<Json<Vec<Investment>>, Error> {
    let investments = investment_service
        .get_investments(auth_user.user_id)
        .await?;

    Ok(Json(investments))
}

