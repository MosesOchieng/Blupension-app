use anyhow::Result;
use reqwest::Client;
use serde::Serialize;
use std::env;

pub struct NotificationService {
    client: Client,
    api_key: String,
    sender_id: String,
}

#[derive(Debug, Serialize)]
struct SMSPayload {
    phone_number: String,
    message: String,
    sender_id: String,
}

impl NotificationService {
    pub fn new() -> Result<Self> {
        Ok(Self {
            client: Client::new(),
            api_key: env::var("SMS_API_KEY")?,
            sender_id: env::var("SMS_SENDER_ID")?,
        })
    }

    pub async fn send_withdrawal_initiated(&self, phone_number: &str, amount: f64) -> Result<()> {
        let message = format!(
            "Your withdrawal request for KES {} has been initiated. You will receive M-Pesa payment shortly.",
            amount
        );
        self.send_sms(phone_number, &message).await
    }

    pub async fn send_withdrawal_completed(&self, phone_number: &str, amount: f64) -> Result<()> {
        let message = format!(
            "Your withdrawal of KES {} has been completed. Thank you for using our service.",
            amount
        );
        self.send_sms(phone_number, &message).await
    }

    pub async fn send_withdrawal_failed(&self, phone_number: &str, reason: &str) -> Result<()> {
        let message = format!(
            "Your withdrawal request could not be processed. Reason: {}",
            reason
        );
        self.send_sms(phone_number, &message).await
    }

    async fn send_sms(&self, phone_number: &str, message: &str) -> Result<()> {
        let payload = SMSPayload {
            phone_number: phone_number.to_string(),
            message: message.to_string(),
            sender_id: self.sender_id.clone(),
        };

        self.client
            .post("https://api.africastalking.com/version1/messaging")
            .header("apiKey", &self.api_key)
            .header("Content-Type", "application/json")
            .json(&payload)
            .send()
            .await?;

        Ok(())
    }
} 