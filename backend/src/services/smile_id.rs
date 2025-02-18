use serde::{Deserialize, Serialize};
use reqwest::Client;
use anyhow::Result;

#[derive(Debug, Serialize, Deserialize)]
pub struct KYCData {
    pub id_type: String,
    pub id_number: String,
    pub first_name: String,
    pub last_name: String,
    pub dob: String,
    pub country: String,
    pub selfie_image: String,
    pub id_image: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Headers {
    #[serde(rename = "Content-Type")]
    content_type: String,
    authorization: String,
}

impl Headers {
    pub fn new(token: &str) -> Self {
        Self {
            content_type: "application/json".to_string(),
            authorization: format!("Bearer {}", token),
        }
    }
}
pub struct KYCResult {
    pub is_verified: bool,
    pub confidence_score: f64,
    pub verification_id: String,
    pub actions: Vec<String>,
}

pub struct SmileIDClient {
    client: Client,
    api_key: String,
    partner_id: String,
    base_url: String,
}

impl SmileIDClient {
    pub fn new(api_key: String, partner_id: String) -> Self {
        Self {
            client: Client::new(),
            api_key,
            partner_id,
            base_url: "https://api.smileidentity.com/v1".to_string(),
        }
    }

    pub async fn verify_identity(&self, kyc_data: &KYCData) -> Result<KYCResult> {
        let response = self.client
            .post(&format!("{}/kyc", self.base_url))
            .header("Authorization", &self.api_key)
            .json(&serde_json::json!({
                "partner_id": self.partner_id,
                "id_type": kyc_data.id_type,
                "id_number": kyc_data.id_number,
                "first_name": kyc_data.first_name,
                "last_name": kyc_data.last_name,
                "dob": kyc_data.dob,
                "country": kyc_data.country,
                "selfie_image": kyc_data.selfie_image,
                "id_image": kyc_data.id_image,
            }))
            .send()
            .await?;

        let result = response.json::<KYCResult>().await?;
        Ok(result)
    }
}

println!("Received KYC data: {:?}", kyc_data);

// Add a mock verification that always succeeds
pub async fn mock_verify_identity(&self) -> Result<KYCResult> {
    Ok(KYCResult {
        is_verified: true,
        confidence_score: 1.0,
        verification_id: uuid::Uuid::new_v4().to_string(),
        actions: vec![]
    })
}
