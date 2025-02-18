use ethers::prelude::*;
use std::sync::Arc;

pub struct BlockchainClient {
    provider: Arc<Provider<Http>>,
    contract: Contract<Provider<Http>>,
}

impl BlockchainClient {
    pub fn new(url: String, contract_address: String) -> Self {
        let provider = Provider::<Http>::try_from(url)
            .expect("Could not instantiate HTTP Provider");
        let provider = Arc::new(provider);
        
        let address: Address = contract_address.parse()
            .expect("Invalid contract address");
            
        let contract = Contract::new(address, PENSION_ABI.clone(), provider.clone());
        
        Self { provider, contract }
    }

    pub async fn create_investment(&self, amount: U256) -> Result<H256> {
        let tx = self.contract
            .method("createInvestment", amount)?
            .send()
            .await?;
            
        Ok(tx.tx_hash())
    }
}
