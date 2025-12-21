const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const axios = require('axios');
const Transaction = require('../models/Transaction');
const EscrowWallet = require('../models/EscrowWallet');
const { bankWarning } = require('../middleware/bankWarning');
const { sendNotification } = require('../services/notification');

// Apply bank warning middleware to all routes
router.use(bankWarning);

// Initiate STK Push
router.post('/stk-push', async (req, res) => {
  try {
    const { amount, phoneNumber, bank } = req.body;
    
    // Generate timestamp and nonce
    const timestamp = new Date().toISOString();
    const nonce = crypto.randomBytes(16).toString('hex');

    // Prepare request data
    const requestData = {
      amount,
      phoneNumber,
      bank,
      timestamp,
      nonce
    };

    // Generate HMAC signature
    const signature = crypto
      .createHmac('sha256', process.env.QUIKK_API_SECRET)
      .update(JSON.stringify(requestData))
      .digest('hex');

    // Make request to Quikk API
    const response = await axios.post(
      `${process.env.QUIKK_API_URL}/stk-push`,
      requestData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.QUIKK_API_KEY}`,
          'X-Signature': signature,
          'Content-Type': 'application/json'
        }
      }
    );

    // Create pending transaction
    const transaction = await Transaction.create({
      userId: req.user._id,
      type: 'DEPOSIT',
      amount,
      currency: 'USD',
      status: 'PENDING',
      paymentMethod: 'MOBILE_MONEY',
      paymentDetails: {
        phoneNumber,
        bank,
        checkoutRequestId: response.data.checkoutRequestId
      }
    });

    res.json({
      success: true,
      data: {
        transaction,
        checkoutRequestId: response.data.checkoutRequestId
      }
    });
  } catch (error) {
    console.error('Error initiating STK Push:', error);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
});

// Handle STK Push callback
router.post('/callback', async (req, res) => {
  try {
    const { checkoutRequestId, resultCode, resultDesc, amount } = req.body;

    // Verify callback signature
    const signature = req.headers['x-signature'];
    const expectedSignature = crypto
      .createHmac('sha256', process.env.QUIKK_API_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Find and update transaction
    const transaction = await Transaction.findOne({
      'paymentDetails.checkoutRequestId': checkoutRequestId
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (resultCode === 0) {
      // Payment successful
      transaction.status = 'COMPLETED';
      transaction.paymentDetails.resultCode = resultCode;
      transaction.paymentDetails.resultDesc = resultDesc;
      await transaction.save();

      // Update escrow wallet
      let wallet = await EscrowWallet.findOne({ userId: transaction.userId });
      if (!wallet) {
        wallet = await EscrowWallet.create({
          userId: transaction.userId,
          balance: amount
        });
      } else {
        wallet.balance += amount;
        wallet.lastUpdated = new Date();
        await wallet.save();
      }

      // Send success notification
      await sendNotification(transaction.userId, 'DEPOSIT_SUCCESS', { amount });
    } else {
      // Payment failed
      transaction.status = 'FAILED';
      transaction.paymentDetails.resultCode = resultCode;
      transaction.paymentDetails.resultDesc = resultDesc;
      await transaction.save();

      // Send failure notification
      await sendNotification(transaction.userId, 'DEPOSIT_FAILED', { reason: resultDesc });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error processing callback:', error);
    res.status(500).json({ error: 'Failed to process callback' });
  }
});

// Get transaction status
router.get('/transaction/:checkoutRequestId', async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      'paymentDetails.checkoutRequestId': req.params.checkoutRequestId
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ success: true, data: transaction });
  } catch (error) {
    console.error('Error fetching transaction status:', error);
    res.status(500).json({ error: 'Failed to fetch transaction status' });
  }
});

module.exports = router; 