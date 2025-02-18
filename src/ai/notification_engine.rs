use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct SmartNotification {
    pub priority: NotificationPriority,
    pub trigger: NotificationTrigger,
    pub message: String,
    pub suggested_actions: Vec<Action>,
    pub expiry: DateTime<Utc>,
}

impl NotificationEngine {
    pub async fn generate_smart_notifications(
        &self,
        user_profile: &UserProfile,
        portfolio: &Portfolio,
        market_conditions: &MarketConditions,
    ) -> Result<Vec<SmartNotification>> {
        let mut notifications = Vec::new();

        // Check for rebalancing opportunities
        if let Some(rebalancing) = self.check_rebalancing_needs(portfolio, market_conditions).await? {
            notifications.push(rebalancing);
        }

        // Monitor risk levels
        if let Some(risk_alert) = self.monitor_risk_levels(portfolio, market_conditions).await? {
            notifications.push(risk_alert);
        }

        // Check for market opportunities
        let opportunities = self.identify_market_opportunities(
            portfolio,
            market_conditions,
            user_profile,
        ).await?;
        notifications.extend(opportunities);

        // Generate educational content
        if let Some(education) = self.generate_educational_notification(user_profile).await? {
            notifications.push(education);
        }

        Ok(notifications)
    }
} 