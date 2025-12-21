const express = require('express');
const router = express.Router();
const { User, Transaction, EscrowWallet, sequelize } = require('../models');
const auth = require('../middleware/auth');
const { Sequelize, Op } = require('sequelize');

// Get BPT token price
router.get('/price', async (req, res) => {
  try {
    // In a real application, this would fetch from an oracle or price feed
    const bptPrice = 1.00; // Example: 1 BPT = 1 USD
    res.json({ price: bptPrice });
  } catch (error) {
    console.error('Error fetching BPT price:', error);
    res.status(500).json({ error: 'Failed to fetch BPT price' });
  }
});

// Purchase BPT tokens
router.post('/purchase', auth, async (req, res) => {
  const { amount, paymentMethod } = req.body;
  const userId = req.user.id;

  try {
    // Start transaction
    const result = await sequelize.transaction(async (t) => {
      // Create transaction record
      const transaction = await Transaction.create({
        userId,
        type: 'BPT_PURCHASE',
        amount,
        status: 'pending',
        paymentMethod,
        currency: 'USD'
      }, { transaction: t });

      // Get or create user's escrow wallet
      let wallet = await EscrowWallet.findOne({ 
        where: { userId },
        transaction: t 
      });

      if (!wallet) {
        wallet = await EscrowWallet.create({
          userId,
          address: `0x${userId}${Date.now()}`, // Generate a proper address in production
          balance: 0,
          bluBalance: 0
        }, { transaction: t });
      }

      // Update BPT balance (will be confirmed after payment)
      await wallet.update({
        bluBalance: Sequelize.literal(`blu_balance + ${amount}`)
      }, { transaction: t });

      return { transaction, wallet };
    });

    res.json({
      message: 'BPT purchase initiated',
      transactionId: result.transaction.id,
      amount,
      status: 'pending'
    });

  } catch (error) {
    console.error('Error purchasing BPT:', error);
    res.status(500).json({ error: 'Failed to process BPT purchase' });
  }
});

// Get user's BPT balance and transactions
router.get('/balance', auth, async (req, res) => {
  try {
    const wallet = await EscrowWallet.findOne({
      where: { userId: req.user.id }
    });

    const transactions = await Transaction.findAll({
      where: {
        userId: req.user.id,
        type: 'BPT_PURCHASE'
      },
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    res.json({
      balance: wallet ? wallet.bluBalance : 0,
      transactions
    });
  } catch (error) {
    console.error('Error fetching BPT balance:', error);
    res.status(500).json({ error: 'Failed to fetch BPT balance' });
  }
});

module.exports = router; 