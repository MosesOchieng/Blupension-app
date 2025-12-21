const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');
const auth = require('../middleware/auth');
const { User, ConnectedAccount } = require('../models');
const EscrowWallet = require('../models/EscrowWallet');

// Get connected accounts
router.get('/connected-accounts', auth, async (req, res) => {
  try {
    const accounts = await ConnectedAccount.findAll({
      where: { userId: req.user.id }
    });
    res.json(accounts);
  } catch (error) {
    console.error('Error fetching connected accounts:', error);
    res.status(500).json({ error: 'Failed to fetch connected accounts' });
  }
});

// Get all wallet balances
router.get('/balances', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's connected accounts
    const connectedAccounts = await ConnectedAccount.findAll({
      where: { userId }
    });

    // Get user's escrow wallet
    const escrowWallet = await EscrowWallet.findOne({
      where: { userId }
    });

    // Initialize wallet data
    const walletData = {
      metamask: { balance: 0, connected: false },
      bank: { balance: 0, connected: false },
      mobileMoney: { balance: 0, connected: false }
    };

    // Process connected accounts
    for (const account of connectedAccounts) {
      switch (account.type) {
        case 'metamask':
          if (account.address) {
            const provider = new ethers.providers.JsonRpcProvider(process.env.ETH_MAINNET_URL);
            const balance = await provider.getBalance(account.address);
            walletData.metamask = {
              balance: parseFloat(ethers.utils.formatEther(balance)),
              connected: true
            };
          }
          break;

        case 'bank':
          walletData.bank = {
            balance: account.balance || 0,
            connected: true
          };
          break;

        case 'mobile_money':
          walletData.mobileMoney = {
            balance: escrowWallet ? escrowWallet.balance : 0,
            connected: true
          };
          break;
      }
    }

    res.json(walletData);
  } catch (error) {
    console.error('Error fetching wallet balances:', error);
    res.status(500).json({ error: 'Failed to fetch wallet balances' });
  }
});

// Connect MetaMask account
router.post('/connect/metamask', auth, async (req, res) => {
  try {
    const { address } = req.body;
    const userId = req.user.id;

    // Verify the address is valid
    if (!ethers.utils.isAddress(address)) {
      return res.status(400).json({ error: 'Invalid Ethereum address' });
    }

    // Create or update connected account
    await ConnectedAccount.upsert({
      userId,
      type: 'metamask',
      address,
      connected: true,
      lastUpdated: new Date()
    });

    res.json({ message: 'MetaMask account connected successfully' });
  } catch (error) {
    console.error('Error connecting MetaMask account:', error);
    res.status(500).json({ error: 'Failed to connect MetaMask account' });
  }
});

// Connect bank account
router.post('/connect/bank', auth, async (req, res) => {
  try {
    const { accountNumber, bankName } = req.body;
    const userId = req.user.id;

    // Create or update connected account
    await ConnectedAccount.upsert({
      userId,
      type: 'bank',
      accountNumber,
      bankName,
      connected: true,
      lastUpdated: new Date()
    });

    res.json({ message: 'Bank account connected successfully' });
  } catch (error) {
    console.error('Error connecting bank account:', error);
    res.status(500).json({ error: 'Failed to connect bank account' });
  }
});

// Connect mobile money account
router.post('/connect/mobile-money', auth, async (req, res) => {
  try {
    const { phoneNumber, provider } = req.body;
    const userId = req.user.id;

    // Create or update connected account
    await ConnectedAccount.upsert({
      userId,
      type: 'mobile_money',
      phoneNumber,
      provider,
      connected: true,
      lastUpdated: new Date()
    });

    // Create or update escrow wallet
    await EscrowWallet.upsert({
      userId,
      balance: 0,
      lastUpdated: new Date()
    });

    res.json({ message: 'Mobile money account connected successfully' });
  } catch (error) {
    console.error('Error connecting mobile money account:', error);
    res.status(500).json({ error: 'Failed to connect mobile money account' });
  }
});

// Disconnect account
router.post('/disconnect/:type', auth, async (req, res) => {
  try {
    const { type } = req.params;
    const userId = req.user.id;

    await ConnectedAccount.update(
      { connected: false },
      { where: { userId, type } }
    );

    res.json({ message: 'Account disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting account:', error);
    res.status(500).json({ error: 'Failed to disconnect account' });
  }
});

module.exports = router; 