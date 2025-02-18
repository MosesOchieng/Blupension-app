use anyhow::Result;
use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use chrono::Utc;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::env;

#[derive(Debug)]
pub struct MPesaService {
    client: Client,
    consumer_key: String,
    consumer_secret: String,
    business_shortcode: String,
    passkey: String,
    callback_url: String,
}

#[derive(Serialize)]
struct STKPushRequest {
    BusinessShortCode: String,
    Password: String,
    Timestamp: String,
    TransactionType: String,
    Amount: String,
    PartyA: String,
    PartyB: String,
    PhoneNumber: String,
    CallBackURL: String,
    AccountReference: String,
    TransactionDesc: String,
}

#[derive(Deserialize)]
pub struct STKPushResponse {
    pub merchant_request_id: String,
    pub checkout_request_id: String,
    pub response_code: String,
    pub response_description: String,
    pub customer_message: String,
}

impl MPesaService {
    pub fn new() -> Result<Self> {
        Ok(Self {
            client: Client::new(),
            consumer_key: env::var("MPESA_CONSUMER_KEY")?,
            consumer_secret: env::var("MPESA_CONSUMER_SECRET")?,
            business_shortcode: env::var("MPESA_BUSINESS_SHORTCODE")?,
            passkey: env::var("MPESA_PASSKEY")?,
            callback_url: env::var("MPESA_CALLBACK_URL")?,
        })
    }

    pub async fn initiate_payment(
        &self,
        phone_number: &str,
        amount: f64,
        account_reference: &str,
    ) -> Result<STKPushResponse> {
        let timestamp = Utc::now().format("%Y%m%d%H%M%S").to_string();
        let password = BASE64.encode(format!(
            "{}{}{}",
            self.business_shortcode, self.passkey, timestamp
        ));

        let request = STKPushRequest {
            BusinessShortCode: self.business_shortcode.clone(),
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline".to_string(),
            Amount: amount.to_string(),
            PartyA: phone_number.to_string(),
            PartyB: self.business_shortcode.clone(),
            PhoneNumber: phone_number.to_string(),
            CallBackURL: self.callback_url.clone(),
            AccountReference: account_reference.to_string(),
            TransactionDesc: "Pension Fund Deposit".to_string(),
        };

        let access_token = self.get_access_token().await?;

        let response = self
            .client
            .post("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest")
            .bearer_auth(access_token)
            .json(&request)
            .send()
            .await?
            .json::<STKPushResponse>()
            .await?;

        Ok(response)
    }

    async fn get_access_token(&self) -> Result<String> {
        let auth = BASE64.encode(format!(
            "{}:{}",
            self.consumer_key, self.consumer_secret
        ));

        let response: serde_json::Value = self
            .client
            .get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials")
            .header("Authorization", format!("Basic {}", auth))
            .send()
            .await?
            .json()
            .await?;

        Ok(response["access_token"]
            .as_str()
            .unwrap_or_default()
            .to_string())
    }
} 