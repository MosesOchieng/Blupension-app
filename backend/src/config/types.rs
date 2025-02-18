use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct Settings {
    pub database: String,
    pub server: ServerSettings,
    pub jwt: JwtSettings,
    pub blockchain: BlockchainSettings,
}

#[derive(Debug, Deserialize)]
pub struct ServerSettings {
    pub host: String,
    pub port: u16,
}

#[derive(Debug, Deserialize)]
pub struct JwtSettings {
    pub secret: String,
    pub expiration: i64,
}
