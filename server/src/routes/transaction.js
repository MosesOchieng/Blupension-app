import express from 'express';
import { body, validationResult } from 'express-validator';
import auth from '../middleware/auth.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import sequelize from '../db/config.js';

const router = express.Router();

// Get user's transactions
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    res.json({ transactions });
  } catch (error) {
    console.error('Transaction fetch error:', error);
    res.status(500).json({ message: 'Error fetching transactions' });
  }
});

// Create new transaction
router.post('/', auth, [
  body('type').isIn(['deposit', 'withdraw', 'transfer', 'reward', 'stake', 'unstake']),
  body('amount').isFloat({ min: 0.01 }),
  body('currency').isIn(['USD', 'BPT']),
  body('description').optional().trim(),
], async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, amount, currency, description } = req.body;
    const user = await User.findByPk(req.user.id, { transaction: t });

    // Validate sufficient balance for withdrawals
    if (type === 'withdraw') {
      const balance = currency === 'USD' ? user.balance : user.bptBalance;
      if (balance < amount) {
        await t.rollback();
        return res.status(400).json({ message: 'Insufficient balance' });
      }
    }

    // Create transaction
    const transaction = await Transaction.create({
      userId: req.user.id,
      type,
      amount,
      currency,
      description,
      status: 'pending',
    }, { transaction: t });

    // Update user balance
    const balanceUpdate = {};
    if (currency === 'USD') {
      balanceUpdate.balance = type === 'deposit' 
        ? user.balance + amount 
        : type === 'withdraw' 
          ? user.balance - amount 
          : user.balance;
    } else {
      balanceUpdate.bptBalance = type === 'deposit' 
        ? user.bptBalance + amount 
        : type === 'withdraw' 
          ? user.bptBalance - amount 
          : user.bptBalance;
    }

    await user.update(balanceUpdate, { transaction: t });

    // Complete transaction
    await transaction.update({ 
      status: 'completed',
      completedAt: new Date()
    }, { transaction: t });

    await t.commit();

    res.status(201).json({
      message: 'Transaction completed successfully',
      transaction,
      newBalance: currency === 'USD' ? balanceUpdate.balance : balanceUpdate.bptBalance,
    });
  } catch (error) {
    await t.rollback();
    console.error('Transaction creation error:', error);
    res.status(500).json({ message: 'Error processing transaction' });
  }
});

// Get transaction by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({ transaction });
  } catch (error) {
    console.error('Transaction fetch error:', error);
    res.status(500).json({ message: 'Error fetching transaction' });
  }
});

// Cancel pending transaction
router.post('/:id/cancel', auth, async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const transaction = await Transaction.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
        status: 'pending',
      },
      transaction: t,
    });

    if (!transaction) {
      await t.rollback();
      return res.status(404).json({ message: 'Pending transaction not found' });
    }

    await transaction.update({
      status: 'cancelled',
    }, { transaction: t });

    await t.commit();

    res.json({
      message: 'Transaction cancelled successfully',
      transaction,
    });
  } catch (error) {
    await t.rollback();
    console.error('Transaction cancellation error:', error);
    res.status(500).json({ message: 'Error cancelling transaction' });
  }
});

// Get transaction history with filters
router.get('/history', auth, async (req, res) => {
  try {
    const { type, currency, status, startDate, endDate } = req.query;
    const where = { userId: req.user.id };

    if (type) where.type = type;
    if (currency) where.currency = currency;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const transactions = await Transaction.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    res.json({ transactions });
  } catch (error) {
    console.error('Transaction history error:', error);
    res.status(500).json({ message: 'Error fetching transaction history' });
  }
});

export default router; 