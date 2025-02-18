use ethers::{
    prelude::*,
    providers::{Http, Provider},
    signers::LocalWallet,
};

#[derive(Clone)]
pub struct BlockchainClient {
    provider: Provider<Http>,
    wallet: LocalWallet,
}

impl BlockchainClient {
    pub fn new(rpc_url: &str, private_key: &str) -> Self {
        let provider = Provider::<Http>::try_from(rpc_url)
            .expect("could not instantiate HTTP Provider");
        let wallet = private_key.parse::<LocalWallet>()
            .expect("could not parse private key");
            
        Self { provider, wallet }
    }
} 