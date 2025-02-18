use config::{Config, ConfigError, File, Environment};
use serde::Deserialize;

#[derive(Debug, Clone, Deserialize)]
pub struct Settings {
    pub database: String,
    pub server_addr: String,
}

impl Settings {
    pub fn new() -> Result<Self, ConfigError> {
        let builder = Config::builder()
            .add_source(File::with_name("config/default"))
            .add_source(Environment::with_prefix("app"));
            
        builder.build()?.try_deserialize()
    }
}