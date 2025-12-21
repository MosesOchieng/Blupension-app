const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');
const BluTokenABI = require('../contracts/artifacts/contracts/BluToken.sol/BluToken.json').abi;

// Initialize provider and contract only if environment variables are set
let contract;
if (process.env.ETH_MAINNET_URL && process.env.BLU_TOKEN_ADDRESS) {
  const provider = new ethers.providers.JsonRpcProvider(process.env.ETH_MAINNET_URL);
  contract = new ethers.Contract(process.env.BLU_TOKEN_ADDRESS, BluTokenABI, provider);
}

// Get token balance
router.get('/balance/:address', async (req, res) => {
  try {
    if (!contract) {
      return res.status(503).json({
        success: false,
        message: 'Ethereum service is not configured'
      });
    }
    
    const { address } = req.params;
    const balance = await contract.balanceOf(address);
    res.json({
      success: true,
      balance: ethers.utils.formatEther(balance)
    });
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching token balance'
    });
  }
});

// Get staking info
router.get('/staking/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const stakedBalance = await contract.stakedBalance(address);
    const stakingTimestamp = await contract.stakingTimestamp(address);
    const rewards = await contract.calculateRewards(address, Math.floor(Date.now() / 1000) - stakingTimestamp);

    res.json({
      success: true,
      data: {
        stakedBalance: ethers.utils.formatEther(stakedBalance),
        stakingTimestamp: new Date(stakingTimestamp * 1000).toISOString(),
        rewards: ethers.utils.formatEther(rewards)
      }
    });
  } catch (error) {
    console.error('Error fetching staking info:', error);
    res.status(500).json({ error: 'Failed to fetch staking info' });
  }
});

// Get voting power
router.get('/voting-power/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const votingPower = await contract.votingPower(address);
    const canVote = await contract.canVote(address);

    res.json({
      success: true,
      data: {
        votingPower: ethers.utils.formatEther(votingPower),
        canVote
      }
    });
  } catch (error) {
    console.error('Error fetching voting power:', error);
    res.status(500).json({ error: 'Failed to fetch voting power' });
  }
});

// Get token info
router.get('/info', async (req, res) => {
  try {
    const [name, symbol, totalSupply, decimals] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.totalSupply(),
      contract.decimals()
    ]);

    res.json({
      success: true,
      data: {
        name,
        symbol,
        totalSupply: ethers.utils.formatEther(totalSupply),
        decimals
      }
    });
  } catch (error) {
    console.error('Error fetching token info:', error);
    res.status(500).json({ error: 'Failed to fetch token info' });
  }
});

module.exports = router; 