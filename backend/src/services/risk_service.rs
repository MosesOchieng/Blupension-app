use sqlx::PgPool;
use uuid::Uuid;
use chrono::Utc;

impl RiskService {
    pub async fn calculate_risk_score(&self, user_id: Uuid) -> Result<RiskScore> {
        let profile = sqlx::query!(
            r#"
            SELECT 
                age,
                income,
                risk_tolerance,
                investment_horizon
            FROM user_risk_profiles
            WHERE user_id = $1
            "#,
            user_id
        )
        .fetch_one(&self.pool)
        .await?;

        let risk_score = (
            profile.risk_tolerance as f64 * 0.4 +
            calculate_age_factor(profile.age) * 0.3 +
            calculate_income_factor(profile.income) * 0.3
        ) * calculate_horizon_multiplier(profile.investment_horizon);

        Ok(RiskScore {
            score: risk_score,
            calculated_at: Utc::now(),
            risk_level: determine_risk_level(risk_score)
        })
    }
}
