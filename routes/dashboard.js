const express = require('express');
const router = express.Router();
const { User, Investment, Transaction } = require('../models');

router.get('/', async (req, res) => {
  try {
    console.log('Dashboard request user:', req.user); // Debug log
    const userId = req.user?.id;

    if (!userId) {
      console.error('No user ID found in request');
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get user's investments
    const investments = await Investment.findAll({
      where: { userId },
      include: [{ model: User }]
    });

    // Calculate portfolio value
    const portfolioValue = investments.reduce((sum, investment) => sum + investment.amount, 0);

    // Get total investments
    const totalInvestments = investments.length;

    // Get rewards (you can implement your own reward calculation logic)
    const rewards = 0; // Placeholder

    // Get recent transactions
    const recentTransactions = await Transaction.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    // Get user details
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      portfolioValue,
      totalInvestments,
      rewards,
      recentTransactions,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router; 