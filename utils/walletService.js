const { ethers } = require("ethers");
require("dotenv").config();

// Create a new wallet
async function createWallet() {
  try {
    // Create a new wallet
    const wallet = ethers.Wallet.createRandom();
    
    // Get the wallet address
    const address = wallet.address;
    
    // Get the private key (encrypted)
    const privateKey = wallet.privateKey;
    
    // Get the mnemonic (for backup)
    const mnemonic = wallet.mnemonic.phrase;

    return {
      address,
      privateKey,
      mnemonic
    };
  } catch (error) {
    console.error("Error creating wallet:", error);
    throw error;
  }
}

// Get wallet balance
async function getWalletBalance(address) {
  try {
    const provider = new ethers.providers.JsonRpcProvider(process.env.ETH_MAINNET_URL);
    const balance = await provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  } catch (error) {
    console.error("Error getting wallet balance:", error);
    throw error;
  }
}

// Get BLU token balance
async function getBluTokenBalance(address) {
  try {
    const provider = new ethers.providers.JsonRpcProvider(process.env.ETH_MAINNET_URL);
    const tokenContract = new ethers.Contract(
      process.env.BLU_TOKEN_ADDRESS,
      ["function balanceOf(address) view returns (uint256)"],
      provider
    );

    const balance = await tokenContract.balanceOf(address);
    return ethers.utils.formatEther(balance);
  } catch (error) {
    console.error("Error getting BLU token balance:", error);
    throw error;
  }
}

module.exports = {
  createWallet,
  getWalletBalance,
  getBluTokenBalance
}; 