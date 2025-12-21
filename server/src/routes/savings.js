import express from "express";
import auth from "../middleware/auth.js";
import User from "../models/User.js";
import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";
import Portfolio from "../models/Portfolio.js";
import { Op } from "sequelize";

const router = express.Router();

// Get or create savings account
async function getOrCreateSavingsAccount(userId) {
  let savingsAccount = await Account.findOne({
    where: { userId, type: "savings", isActive: true },
  });

  if (!savingsAccount) {
    savingsAccount = await Account.create({
      userId,
      name: "Savings Account",
      type: "savings",
      balance: 0,
      currency: "USD",
      isActive: true,
    });
  }

  return savingsAccount;
}

// Get or create investment account
async function getOrCreateInvestmentAccount(userId) {
  let investmentAccount = await Account.findOne({
    where: { userId, type: "investment", isActive: true },
  });

  if (!investmentAccount) {
    investmentAccount = await Account.create({
      userId,
      name: "Investment Account",
      type: "investment",
      balance: 0,
      currency: "USD",
      isActive: true,
    });
  }

  return investmentAccount;
}

// Get savings balance
router.get("/balance", auth, async (req, res) => {
  try {
    const savingsAccount = await getOrCreateSavingsAccount(req.user.id);
    const investmentAccount = await getOrCreateInvestmentAccount(req.user.id);

    // Get user's portfolio value
    const portfolio = await Portfolio.findOne({
      where: { userId: req.user.id, status: "active" },
    });

    const portfolioValue = portfolio ? parseFloat(portfolio.totalValue) || 0 : 0;

    res.json({
      savingsBalance: parseFloat(savingsAccount.balance) || 0,
      investmentBalance: parseFloat(investmentAccount.balance) || 0,
      portfolioValue: portfolioValue,
      totalValue: (parseFloat(savingsAccount.balance) || 0) + portfolioValue,
    });
  } catch (error) {
    console.error("Get savings balance error:", error);
    res.status(500).json({ message: "Error fetching savings balance" });
  }
});

// Deposit to savings
router.post("/deposit", auth, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const savingsAccount = await getOrCreateSavingsAccount(req.user.id);

    // Update savings balance
    const newBalance = parseFloat(savingsAccount.balance) + parseFloat(amount);
    await savingsAccount.update({ balance: newBalance });

    // Update user balance
    const userNewBalance = parseFloat(user.balance) + parseFloat(amount);
    await user.update({ balance: userNewBalance });

    // Create transaction record
    await Transaction.create({
      userId: req.user.id,
      type: "deposit",
      amount: parseFloat(amount),
      currency: "USD",
      status: "completed",
      description: `Deposit to savings account`,
      toAccountId: savingsAccount.id,
      completedAt: new Date(),
    });

    res.json({
      message: "Deposit successful",
      savingsBalance: newBalance,
      userBalance: userNewBalance,
    });
  } catch (error) {
    console.error("Deposit error:", error);
    res.status(500).json({ message: "Error processing deposit" });
  }
});

// Withdraw from savings
router.post("/withdraw", auth, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const savingsAccount = await getOrCreateSavingsAccount(req.user.id);

    if (parseFloat(savingsAccount.balance) < parseFloat(amount)) {
      return res.status(400).json({ message: "Insufficient savings balance" });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update savings balance
    const newBalance = parseFloat(savingsAccount.balance) - parseFloat(amount);
    await savingsAccount.update({ balance: newBalance });

    // Update user balance
    const userNewBalance = Math.max(0, parseFloat(user.balance) - parseFloat(amount));
    await user.update({ balance: userNewBalance });

    // Create transaction record
    await Transaction.create({
      userId: req.user.id,
      type: "withdraw",
      amount: parseFloat(amount),
      currency: "USD",
      status: "completed",
      description: `Withdrawal from savings account`,
      fromAccountId: savingsAccount.id,
      completedAt: new Date(),
    });

    res.json({
      message: "Withdrawal successful",
      savingsBalance: newBalance,
      userBalance: userNewBalance,
    });
  } catch (error) {
    console.error("Withdraw error:", error);
    res.status(500).json({ message: "Error processing withdrawal" });
  }
});

// Transfer from savings to investment
router.post("/transfer-to-investment", auth, async (req, res) => {
  try {
    const { amount, allocation } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const savingsAccount = await getOrCreateSavingsAccount(req.user.id);
    const investmentAccount = await getOrCreateInvestmentAccount(req.user.id);

    if (parseFloat(savingsAccount.balance) < parseFloat(amount)) {
      return res.status(400).json({ message: "Insufficient savings balance" });
    }

    // Update balances
    const newSavingsBalance = parseFloat(savingsAccount.balance) - parseFloat(amount);
    await savingsAccount.update({ balance: newSavingsBalance });

    const newInvestmentBalance = parseFloat(investmentAccount.balance) + parseFloat(amount);
    await investmentAccount.update({ balance: newInvestmentBalance });

    // Get or create portfolio
    let portfolio = await Portfolio.findOne({
      where: { userId: req.user.id, status: "active" },
    });

    if (!portfolio) {
      portfolio = await Portfolio.create({
        userId: req.user.id,
        name: "My Portfolio",
        description: "Main investment portfolio",
        strategy: "moderate",
        totalValue: parseFloat(amount),
        allocation: allocation || {
          conservative: 0.4,
          moderate: 0.4,
          aggressive: 0.2,
        },
        status: "active",
      });
    } else {
      // Update portfolio
      const currentValue = parseFloat(portfolio.totalValue) || 0;
      const newValue = currentValue + parseFloat(amount);
      
      // Merge allocations if provided
      const currentAllocation = portfolio.allocation || {};
      const mergedAllocation = allocation 
        ? { ...currentAllocation, ...allocation }
        : currentAllocation;

      await portfolio.update({
        totalValue: newValue,
        allocation: mergedAllocation,
      });
    }

    // Create transaction record
    await Transaction.create({
      userId: req.user.id,
      type: "transfer",
      amount: parseFloat(amount),
      currency: "USD",
      status: "completed",
      description: `Transfer from savings to investment`,
      fromAccountId: savingsAccount.id,
      toAccountId: investmentAccount.id,
      completedAt: new Date(),
    });

    res.json({
      message: "Transfer successful",
      savingsBalance: newSavingsBalance,
      investmentBalance: newInvestmentBalance,
      portfolioValue: parseFloat(portfolio.totalValue),
      allocation: portfolio.allocation,
    });
  } catch (error) {
    console.error("Transfer error:", error);
    res.status(500).json({ message: "Error processing transfer" });
  }
});

// Get savings history
router.get("/history", auth, async (req, res) => {
  try {
    const savingsAccount = await getOrCreateSavingsAccount(req.user.id);

    const transactions = await Transaction.findAll({
      where: {
        userId: req.user.id,
        [Op.or]: [
          { toAccountId: savingsAccount.id },
          { fromAccountId: savingsAccount.id },
        ],
      },
      order: [["completedAt", "DESC"]],
      limit: 50,
    });

    res.json({ transactions });
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({ message: "Error fetching history" });
  }
});

export default router;

