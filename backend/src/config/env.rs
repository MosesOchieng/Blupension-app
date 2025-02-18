use serde::Deserialize;
use config::{Config, ConfigError, Environment, File};

#[derive(Debug, Deserialize)]
pub struct Settings {
    pub database_url: String,
    pub jwt_secret: String,
    pub mpesa_consumer_key: String,
    pub mpesa_consumer_secret: String,
    pub mpesa_passkey: String,
    pub mpesa_shortcode: String,
    pub blockchain_rpc_url: String,
    pub blockchain_contract_address: String,
    pub blockchain_private_key: String,
    pub frontend_url: String,
    pub environment: String,
}

impl Settings {
    pub fn new() -> Result<Self, ConfigError> {
        let env = std::env::var("RUN_ENV").unwrap_or_else(|_| "development".into());

        let config = Config::builder()
            .add_source(File::with_name("config/default"))
            .add_source(File::with_name(&format!("config/{}", env)).required(false))
            .add_source(Environment::with_prefix("APP"))
            .build()?;

        config.try_deserialize()
    }
} 