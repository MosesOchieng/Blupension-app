use reqwest::Client;
use serde::{Serialize, Deserialize};
use base64::encode;
use chrono::Utc;

#[derive(Debug, Serialize)]
struct STKPushRequest {
    #[serde(rename = "BusinessShortCode")]
    business_short_code: String,
    #[serde(rename = "Password")]
    password: String,
    #[serde(rename = "Timestamp")]
    timestamp: String,
    #[serde(rename = "TransactionType")]
    transaction_type: String,
    #[serde(rename = "Amount")]
    amount: f64,
    #[serde(rename = "PartyA")]
    party_a: String,
    #[serde(rename = "PartyB")]
    party_b: String,
    #[serde(rename = "PhoneNumber")]
    phone_number: String,
    #[serde(rename = "CallBackURL")]
    callback_url: String,
    #[serde(rename = "AccountReference")]
    account_reference: String,
    #[serde(rename = "TransactionDesc")]
    transaction_desc: String,
}

#[derive(Debug, Deserialize)]
pub struct MpesaResponse {
    #[serde(rename = "MerchantRequestID")]
    pub merchant_request_id: String,
    #[serde(rename = "CheckoutRequestID")]
    pub checkout_request_id: String,
    #[serde(rename = "ResponseCode")]
    pub response_code: String,
    #[serde(rename = "ResponseDescription")]
    pub response_description: String,
}

use reqwest::Client;
use base64::encode;
use chrono::Utc;
use crate::error::Result;

pub struct MpesaService {
    client: Client,
    consumer_key: String,
    consumer_secret: String,
    base_url: String,
    business_short_code: String,
    passkey: String,
    callback_url: String,
}

impl MpesaService {
    pub fn new(
        consumer_key: String,
        consumer_secret: String,
        business_short_code: String,
        passkey: String,
        callback_url: String,
    ) -> Self {
        Self {
            client: Client::new(),
            consumer_key,
            consumer_secret,
            base_url: "https://sandbox.safaricom.co.ke".to_string(),
            business_short_code,
            passkey,
            callback_url,
        }
    }

    async fn get_access_token(&self) -> Result<String> {
        let auth = encode(format!("{}:{}", self.consumer_key, self.consumer_secret));
        
        let response: serde_json::Value = self.client
            .get(format!("{}/oauth/v1/generate?grant_type=client_credentials", self.base_url))
            .header("Authorization", format!("Basic {}", auth))
            .send()
            .await?
            .json()
            .await?;

        Ok(response["access_token"].as_str().unwrap().to_string())
    }

    pub async fn initiate_stk_push(
        &self,
        phone_number: &str,
        amount: Decimal,
        reference: &str,
    ) -> Result<STKPushResponse> {
        let access_token = self.get_access_token().await?;
        let timestamp = Utc::now().format("%Y%m%d%H%M%S").to_string();
        
        let password = encode(format!(
            "{}{}{}",
            self.business_short_code,
            self.passkey,
            timestamp
        ));

        let request = STKPushRequest {
            business_short_code: self.business_short_code.clone(),
            password,
            timestamp,
            transaction_type: "CustomerPayBillOnline".to_string(),
            amount,
            party_a: phone_number.to_string(),
            party_b: self.business_short_code.clone(),
            phone_number: phone_number.to_string(),
            callback_url: format!("{}/mpesa/callback", self.callback_url),
            reference: reference.to_string()
        };

        let response = self.client
            .post(&format!("{}/stkpush/v1/processrequest", self.base_url))
            .bearer_auth(access_token)
            .json(&request)
            .send()
            .await?;

        Ok(response.json().await?)
    }
}