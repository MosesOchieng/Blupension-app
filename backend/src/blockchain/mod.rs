
pub struct BlockchainClient {
    url: String,
    contract_address: String,
}

impl BlockchainClient {
    pub fn new(url: String, contract_address: String) -> Self {
        Self {
            url,
            contract_address,
        }
    }
}
