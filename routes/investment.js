const express = require('express');
const router = express.Router();
const InvestmentPlan = require('../models/InvestmentPlan');
const Investment = require('../models/Investment');
const Transaction = require('../models/Transaction');
const EscrowWallet = require('../models/EscrowWallet');
const { Op } = require('sequelize');
const auth = require('../middleware/auth');
const { Sequelize } = require('sequelize');
const User = require('../models/User');

// Get all active investment plans
router.get('/plans', async (req, res) => {
  try {
    const plans = await InvestmentPlan.findAll({
      where: { isActive: true },
      order: [['minAmount', 'ASC']]
    });
    res.json(plans);
  } catch (error) {
    console.error('Error fetching investment plans:', error);
    res.status(500).json({ error: 'Failed to fetch investment plans' });
  }
});

// Get plan details
router.get('/plans/:id', async (req, res) => {
  try {
    const plan = await InvestmentPlan.findByPk(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: 'Investment plan not found' });
    }
    res.json(plan);
  } catch (error) {
    console.error('Error fetching plan details:', error);
    res.status(500).json({ error: 'Failed to fetch plan details' });
  }
});

// Get user's escrow wallet balance
router.get('/wallet/balance', auth, async (req, res) => {
  try {
    const wallet = await EscrowWallet.findOne({ where: { userId: req.user.id } });
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    res.json({ success: true, data: wallet });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    res.status(500).json({ error: 'Failed to fetch wallet balance' });
  }
});

// Convert currency
router.post('/convert', auth, async (req, res) => {
  try {
    const { fromCurrency, toCurrency, amount } = req.body;
    
    // TODO: Implement actual currency conversion logic
    // For now, using a mock conversion rate
    const mockRate = 1.5;
    const convertedAmount = amount * mockRate;
    
    // Create transaction record
    const transaction = await Transaction.create({
      userId: req.user.id, // Assuming user info is added by auth middleware
      type: 'conversion',
      amount: amount,
      currency: fromCurrency,
      status: 'completed',
      reference: `CONV-${Date.now()}`,
      description: `Converted ${amount} ${fromCurrency} to ${convertedAmount} ${toCurrency}`,
      fromCurrency,
      toCurrency,
      exchangeRate: mockRate
    });
    
    res.json({
      success: true,
      transaction,
      convertedAmount,
      rate: mockRate
    });
  } catch (error) {
    console.error('Error converting currency:', error);
    res.status(500).json({ error: 'Failed to convert currency' });
  }
});

// Get user's investments
router.get('/my-investments', auth, async (req, res) => {
  try {
    const investments = await Investment.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: InvestmentPlan,
          attributes: ['name', 'description', 'minAmount', 'maxAmount', 'expectedReturn']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(investments);
  } catch (error) {
    console.error('Error fetching user investments:', error);
    res.status(500).json({ error: 'Failed to fetch investments' });
  }
});

// Get investment details
router.get('/investments/:id', auth, async (req, res) => {
  try {
    const investment = await Investment.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: [{
        model: InvestmentPlan,
        attributes: ['name', 'description', 'interestRate', 'duration']
      }]
    });
    
    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }
    
    res.json(investment);
  } catch (error) {
    console.error('Error fetching investment details:', error);
    res.status(500).json({ error: 'Failed to fetch investment details' });
  }
});

// Helper function to calculate asset distribution based on risk level
function calculateAssetDistribution(amount, riskLevel) {
  const distributions = {
    LOW: {
      BLU: 0.6,
      stableCoins: 0.3,
      cryptocurrencies: 0.1
    },
    MODERATE: {
      BLU: 0.4,
      stableCoins: 0.3,
      cryptocurrencies: 0.3
    },
    HIGH: {
      BLU: 0.2,
      stableCoins: 0.2,
      cryptocurrencies: 0.6
    }
  };

  const distribution = distributions[riskLevel];
  return {
    BLU: amount * distribution.BLU,
    stableCoins: {
      USDT: amount * distribution.stableCoins * 0.4,
      USDC: amount * distribution.stableCoins * 0.3,
      DAI: amount * distribution.stableCoins * 0.3
    },
    cryptocurrencies: {
      BTC: amount * distribution.cryptocurrencies * 0.4,
      ETH: amount * distribution.cryptocurrencies * 0.4,
      BNB: amount * distribution.cryptocurrencies * 0.2
    }
  };
}

// Helper function to distribute assets across different cryptocurrencies
async function distributeAssets(walletId, distribution) {
  const wallet = await EscrowWallet.findOne({ where: { id: walletId } });
  if (!wallet) {
    throw new Error('Wallet not found');
  }
  
  // Update BLU balance
  wallet.bluBalance += distribution.BLU;

  // Update stable coins
  for (const [coin, amount] of Object.entries(distribution.stableCoins)) {
    wallet.stableCoins = {
      ...wallet.stableCoins,
      [coin]: (wallet.stableCoins[coin] || 0) + amount
    };
  }

  // Update cryptocurrencies
  for (const [coin, amount] of Object.entries(distribution.cryptocurrencies)) {
    wallet.cryptocurrencies = {
      ...wallet.cryptocurrencies,
      [coin]: (wallet.cryptocurrencies[coin] || 0) + amount
    };
  }

  wallet.lastUpdated = new Date();
  await wallet.save();
  return wallet;
}

// Helper function to calculate expected returns based on plan
function calculateExpectedReturns(amount, plan) {
  const { interestRate, duration } = plan;
  const dailyRate = interestRate / 365;
  const totalDays = duration * 365;
  return amount * (1 + (dailyRate * totalDays));
}

// Create new investment
router.post('/create', auth, async (req, res) => {
  const { planId, amount } = req.body;
  const userId = req.user.id;

  try {
    // Start transaction
    const result = await req.sequelize.transaction(async (t) => {
      // Get investment plan
      const plan = await InvestmentPlan.findByPk(planId, { transaction: t });
      if (!plan) {
        throw new Error('Investment plan not found');
      }

      // Validate amount
      if (amount < plan.minAmount || amount > plan.maxAmount) {
        throw new Error('Invalid investment amount');
      }

      // Check user's BPT balance
      const wallet = await EscrowWallet.findOne({
        where: { userId },
        transaction: t
      });

      if (!wallet || wallet.bluBalance < amount) {
        throw new Error('Insufficient BPT balance');
      }

      // Calculate expected return
      const expectedReturn = amount * (1 + (plan.interestRate / 100));

      // Create investment
      const investment = await Investment.create({
        userId,
        planId,
        amount,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + (plan.durationDays * 24 * 60 * 60 * 1000)),
        expectedReturn,
        interestRate: plan.interestRate,
        bluAmount: amount,
        currency: 'USD'
      }, { transaction: t });

      // Update wallet balance
      await wallet.update({
        bluBalance: Sequelize.literal(`blu_balance - ${amount}`)
      }, { transaction: t });

      // Create transaction record
      await Transaction.create({
        userId,
        investmentId: investment.id,
        type: 'INVESTMENT',
        amount,
        status: 'completed',
        currency: 'USD'
      }, { transaction: t });

      return investment;
    });

    res.json({
      message: 'Investment created successfully',
      investment: result
    });

  } catch (error) {
    console.error('Error creating investment:', error);
    res.status(500).json({ error: error.message || 'Failed to create investment' });
  }
});

// Get investment statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get total investments and returns
    const totalStats = await Investment.findAll({
      where: { userId },
      attributes: [
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalInvested'],
        [Sequelize.fn('SUM', Sequelize.col('expected_return')), 'totalExpectedReturn'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalInvestments']
      ]
    });

    // Get active investments count
    const activeInvestments = await Investment.count({
      where: { 
        userId,
        status: 'active'
      }
    });

    // Get completed investments count
    const completedInvestments = await Investment.count({
      where: { 
        userId,
        status: 'completed'
      }
    });

    // Get investment distribution by plan
    const planDistribution = await Investment.findAll({
      where: { userId },
      attributes: [
        'planId',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalAmount']
      ],
      group: ['planId'],
      include: [{
        model: InvestmentPlan,
        attributes: ['name']
      }]
    });

    // Get recent investment activity
    const recentActivity = await Investment.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 5,
      include: [{
        model: InvestmentPlan,
        attributes: ['name']
      }]
    });

    res.json({
      ...totalStats[0].toJSON(),
      activeInvestments,
      completedInvestments,
      planDistribution,
      recentActivity
    });
  } catch (error) {
    console.error('Error fetching investment stats:', error);
    res.status(500).json({ error: 'Failed to fetch investment statistics' });
  }
});

// Get plan comparison with other users
router.get('/plans/:id/comparison', auth, async (req, res) => {
  try {
    const planId = req.params.id;
    
    // Get all users who have invested in this plan
    const investments = await Investment.findAll({
      where: {
        planId,
        status: 'active'
      },
      include: [
        { 
          model: User, 
          attributes: ['id', 'name'],
          where: {
            id: {
              [Op.ne]: req.user.id // Exclude current user
            }
          }
        },
        { model: InvestmentPlan }
      ],
      order: [['amount', 'DESC']],
      limit: 5 // Get top 5 investors
    });

    // Format the comparison data
    const comparison = investments.map(investment => ({
      id: investment.id,
      userName: investment.User.name,
      amount: investment.amount,
      expectedReturn: investment.expectedReturn,
      startDate: investment.startDate,
      endDate: investment.endDate,
      planName: investment.InvestmentPlan.name,
      interestRate: investment.InvestmentPlan.interestRate,
      durationDays: investment.InvestmentPlan.durationDays,
      currentValue: investment.amount + (investment.amount * (investment.InvestmentPlan.interestRate / 100) * 
        ((new Date() - new Date(investment.startDate)) / (investment.InvestmentPlan.durationDays * 24 * 60 * 60 * 1000)))
    }));

    res.json(comparison);
  } catch (error) {
    console.error('Error fetching plan comparison:', error);
    res.status(500).json({ error: 'Failed to fetch plan comparison' });
  }
});

module.exports = router; 