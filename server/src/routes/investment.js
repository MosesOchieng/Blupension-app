import express from "express";
import auth from "../middleware/auth.js";
import User from "../models/User.js";
import Account from "../models/Account.js";
import Portfolio from "../models/Portfolio.js";
import Transaction from "../models/Transaction.js";
import { Op } from "sequelize";

const router = express.Router();

// Investment plans configuration
const INVESTMENT_PLANS = {
  conservative: {
    name: "Conservative Plan",
    description: "Low risk, stable returns",
    annualReturn: 0.05, // 5%
    allocation: {
      bonds: 0.6,
      stocks: 0.3,
      cash: 0.1,
    },
  },
  moderate: {
    name: "Balanced Plan",
    description: "Moderate risk, balanced returns",
    annualReturn: 0.08, // 8%
    allocation: {
      bonds: 0.4,
      stocks: 0.5,
      alternatives: 0.1,
    },
  },
  aggressive: {
    name: "Growth Plan",
    description: "Higher risk, potential for higher returns",
    annualReturn: 0.12, // 12%
    allocation: {
      bonds: 0.2,
      stocks: 0.7,
      crypto: 0.1,
    },
  },
};

// Get investment plans
router.get("/plans", auth, async (req, res) => {
  try {
    res.json({ plans: INVESTMENT_PLANS });
  } catch (error) {
    console.error("Get plans error:", error);
    res.status(500).json({ message: "Error fetching investment plans" });
  }
});

// Get portfolio and investment details
router.get("/portfolio", auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      where: { userId: req.user.id, status: "active" },
    });

    const investmentAccount = await Account.findOne({
      where: { userId: req.user.id, type: "investment", isActive: true },
    });

    if (!portfolio) {
      return res.json({
        portfolio: null,
        investmentBalance: investmentAccount ? parseFloat(investmentAccount.balance) : 0,
        allocation: null,
        growth: null,
      });
    }

    // Calculate growth
    const startDate = portfolio.createdAt || new Date();
    const daysSinceStart = Math.max(1, Math.floor((new Date() - startDate) / (1000 * 60 * 60 * 24)));
    const strategy = portfolio.strategy || "moderate";
    const plan = INVESTMENT_PLANS[strategy] || INVESTMENT_PLANS.moderate;
    const dailyReturn = plan.annualReturn / 365;
    const currentValue = parseFloat(portfolio.totalValue) || 0;
    const growthAmount = currentValue * dailyReturn * daysSinceStart;
    const totalValue = currentValue + growthAmount;
    const growthPercentage = (growthAmount / currentValue) * 100;

    // Get allocation breakdown
    const allocation = portfolio.allocation || {};
    const allocationBreakdown = Object.keys(plan.allocation).map((key) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      percentage: plan.allocation[key] * 100,
      amount: (totalValue * plan.allocation[key]),
    }));

    res.json({
      portfolio: {
        id: portfolio.id,
        name: portfolio.name,
        strategy: strategy,
        totalValue: totalValue,
        initialValue: currentValue,
        allocation: allocation,
      },
      investmentBalance: investmentAccount ? parseFloat(investmentAccount.balance) : 0,
      allocation: allocationBreakdown,
      growth: {
        amount: growthAmount,
        percentage: growthPercentage,
        daysSinceStart: daysSinceStart,
        dailyReturn: dailyReturn * 100,
        annualReturn: plan.annualReturn * 100,
      },
      plan: plan,
    });
  } catch (error) {
    console.error("Get portfolio error:", error);
    res.status(500).json({ message: "Error fetching portfolio" });
  }
});

// Update portfolio allocation
router.put("/portfolio/allocation", auth, async (req, res) => {
  try {
    const { allocation } = req.body;

    if (!allocation) {
      return res.status(400).json({ message: "Allocation is required" });
    }

    let portfolio = await Portfolio.findOne({
      where: { userId: req.user.id, status: "active" },
    });

    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    await portfolio.update({ allocation });

    res.json({
      message: "Allocation updated successfully",
      allocation: portfolio.allocation,
    });
  } catch (error) {
    console.error("Update allocation error:", error);
    res.status(500).json({ message: "Error updating allocation" });
  }
});

// Get investment growth history
router.get("/growth-history", auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      where: { userId: req.user.id, status: "active" },
    });

    if (!portfolio) {
      return res.json({ history: [] });
    }

    // Generate growth history for the last 30 days
    const history = [];
    const startDate = portfolio.createdAt || new Date();
    const strategy = portfolio.strategy || "moderate";
    const plan = INVESTMENT_PLANS[strategy] || INVESTMENT_PLANS.moderate;
    const dailyReturn = plan.annualReturn / 365;
    const initialValue = parseFloat(portfolio.totalValue) || 0;

    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      if (date >= startDate) {
        const daysSinceStart = Math.floor((date - startDate) / (1000 * 60 * 60 * 24));
        const value = initialValue * (1 + dailyReturn * daysSinceStart);
        history.push({
          date: date.toISOString().split("T")[0],
          value: value,
          growth: value - initialValue,
        });
      }
    }

    res.json({ history });
  } catch (error) {
    console.error("Get growth history error:", error);
    res.status(500).json({ message: "Error fetching growth history" });
  }
});

// Get investment flow (savings → allocation → growth)
router.get("/flow", auth, async (req, res) => {
  try {
    const savingsAccount = await Account.findOne({
      where: { userId: req.user.id, type: "savings", isActive: true },
    });

    const investmentAccount = await Account.findOne({
      where: { userId: req.user.id, type: "investment", isActive: true },
    });

    const portfolio = await Portfolio.findOne({
      where: { userId: req.user.id, status: "active" },
    });

    const savingsBalance = savingsAccount ? parseFloat(savingsAccount.balance) : 0;
    const investmentBalance = investmentAccount ? parseFloat(investmentAccount.balance) : 0;

    let portfolioValue = 0;
    let growthAmount = 0;
    let allocationBreakdown = [];

    if (portfolio) {
      const startDate = portfolio.createdAt || new Date();
      const daysSinceStart = Math.max(1, Math.floor((new Date() - startDate) / (1000 * 60 * 60 * 24)));
      const strategy = portfolio.strategy || "moderate";
      const plan = INVESTMENT_PLANS[strategy] || INVESTMENT_PLANS.moderate;
      const dailyReturn = plan.annualReturn / 365;
      const currentValue = parseFloat(portfolio.totalValue) || 0;
      growthAmount = currentValue * dailyReturn * daysSinceStart;
      portfolioValue = currentValue + growthAmount;

      allocationBreakdown = Object.keys(plan.allocation).map((key) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        percentage: plan.allocation[key] * 100,
        amount: portfolioValue * plan.allocation[key],
        icon: key === "bonds" ? "📊" : key === "stocks" ? "📈" : key === "crypto" ? "₿" : "💰",
      }));
    }

    res.json({
      savings: {
        balance: savingsBalance,
        label: "Savings Account",
      },
      investment: {
        balance: investmentBalance,
        label: "Investment Account",
      },
      portfolio: {
        value: portfolioValue,
        growth: growthAmount,
        label: "Portfolio Value",
      },
      allocation: allocationBreakdown,
      totalValue: savingsBalance + portfolioValue,
    });
  } catch (error) {
    console.error("Get flow error:", error);
    res.status(500).json({ message: "Error fetching investment flow" });
  }
});

export default router;

