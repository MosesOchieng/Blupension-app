import express from 'express';
import Transaction from '../models/transaction.js';
import Account from '../models/account.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all transactions for a user
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Account,
          as: 'fromAccount',
          attributes: ['accountNumber']
        },
        {
          model: Account,
          as: 'toAccount',
          attributes: ['accountNumber']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new transaction
router.post('/', auth, async (req, res) => {
  try {
    const { type, amount, description, fromAccountId, toAccountId } = req.body;

    // Validate transaction type and required fields
    if (!['deposit', 'withdrawal', 'transfer'].includes(type)) {
      return res.status(400).json({ message: 'Invalid transaction type' });
    }

    // For transfers, both accounts are required
    if (type === 'transfer' && (!fromAccountId || !toAccountId)) {
      return res.status(400).json({ message: 'Both accounts are required for transfers' });
    }

    // For deposits and withdrawals, only one account is required
    if ((type === 'deposit' || type === 'withdrawal') && !fromAccountId) {
      return res.status(400).json({ message: 'Account is required' });
    }

    // Check if the account belongs to the user
    const account = await Account.findOne({
      where: { id: fromAccountId, userId: req.user.id }
    });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // For withdrawals and transfers, check if there's sufficient balance
    if ((type === 'withdrawal' || type === 'transfer') && account.balance < amount) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    // Create the transaction
    const transaction = await Transaction.create({
      userId: req.user.id,
      type,
      amount,
      description,
      fromAccountId,
      toAccountId,
      status: 'pending'
    });

    // Update account balances
    if (type === 'deposit') {
      await account.update({ balance: account.balance + amount });
    } else if (type === 'withdrawal') {
      await account.update({ balance: account.balance - amount });
    } else if (type === 'transfer') {
      await account.update({ balance: account.balance - amount });
      const toAccount = await Account.findByPk(toAccountId);
      if (!toAccount) {
        return res.status(404).json({ message: 'Destination account not found' });
      }
      await toAccount.update({ balance: toAccount.balance + amount });
    }

    await transaction.update({ status: 'completed' });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific transaction
router.get('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: [
        {
          model: Account,
          as: 'fromAccount',
          attributes: ['accountNumber']
        },
        {
          model: Account,
          as: 'toAccount',
          attributes: ['accountNumber']
        }
      ]
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 