use stellar_sdk::{
    Client, Network, Keypair,
    types::Transaction,
};
use anyhow::Result;

pub struct StellarService {
    client: Client,
    keypair: Keypair,
}

impl Clone for StellarService {
    fn clone(&self) -> Self {
        Self {
            client: self.client.clone(),
            keypair: self.keypair.clone(),
        }
    }
}

impl StellarService {
    pub fn new(network: &str, secret_key: &str) -> Result<Self> {
        let network = if network == "testnet" {
            Network::TestNet
        } else {
            Network::PubNet
        };
        
        let keypair = Keypair::from_secret_key(secret_key)?;
        let client = Client::new(network)?;
        
        Ok(Self {
            client,
            keypair,
        })
    }

    pub async fn get_balance(&self, account_id: &str) -> Result<f64> {
        let account = self.client.get_account(account_id).await?;
        let balance = account
            .balances
            .iter()
            .find(|b| b.asset_type == "native")
            .map(|b| b.balance.parse::<f64>())
            .transpose()?
            .unwrap_or(0.0);

        Ok(balance)
    }
} 