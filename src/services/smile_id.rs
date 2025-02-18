#[derive(Clone)]
pub struct SmileIDClient {
    api_key: String,
    partner_id: String,
}

impl SmileIDClient {
    pub fn new(api_key: String, partner_id: String) -> Self {
        Self { api_key, partner_id }
    }
} 