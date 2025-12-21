import express from "express";
import { body, validationResult } from "express-validator";
import auth from "../middleware/auth.js";
import Reward from "../models/Reward.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import sequelize from "../db/config.js";

const router = express.Router();

// Get user's rewards
router.get("/", auth, async (req, res) => {
  try {
    const rewards = await Reward.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });

    res.json({ rewards });
  } catch (error) {
    console.error("Rewards fetch error:", error);
    res.status(500).json({ message: "Error fetching rewards" });
  }
});

// Create new reward
router.post(
  "/",
  auth,
  [
    body("type").isIn(["staking", "referral", "achievement", "bonus"]),
    body("amount").isFloat({ min: 0.01 }),
    body("currency").isIn(["USD", "BPT"]),
    body("description").optional().trim(),
    body("expiresAt").optional().isISO8601(),
  ],
  async (req, res) => {
    const t = await sequelize.transaction();

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { type, amount, currency, description, expiresAt } = req.body;

      const reward = await Reward.create(
        {
          userId: req.user.id,
          type,
          amount,
          currency,
          description,
          expiresAt: expiresAt || null,
          status: "pending",
        },
        { transaction: t },
      );

      await t.commit();

      res.status(201).json({
        message: "Reward created successfully",
        reward,
      });
    } catch (error) {
      await t.rollback();
      console.error("Reward creation error:", error);
      res.status(500).json({ message: "Error creating reward" });
    }
  },
);

// Claim reward
router.post("/:id/claim", auth, async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const reward = await Reward.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
        status: "pending",
      },
      transaction: t,
    });

    if (!reward) {
      await t.rollback();
      return res.status(404).json({ message: "Claimable reward not found" });
    }

    // Check if reward has expired
    if (reward.expiresAt && new Date() > new Date(reward.expiresAt)) {
      await reward.update({ status: "expired" }, { transaction: t });
      await t.rollback();
      return res.status(400).json({ message: "Reward has expired" });
    }

    const user = await User.findByPk(req.user.id, { transaction: t });

    // Create transaction record
    const transaction = await Transaction.create(
      {
        userId: req.user.id,
        type: "reward",
        amount: reward.amount,
        currency: reward.currency,
        description: `Claimed ${reward.type} reward: ${reward.description}`,
        status: "completed",
        completedAt: new Date(),
      },
      { transaction: t },
    );

    // Update user balance
    const balanceUpdate = {};
    if (reward.currency === "USD") {
      balanceUpdate.balance = user.balance + reward.amount;
    } else {
      balanceUpdate.bptBalance = user.bptBalance + reward.amount;
    }

    await user.update(balanceUpdate, { transaction: t });

    // Update reward status
    await reward.update(
      {
        status: "claimed",
        claimedAt: new Date(),
      },
      { transaction: t },
    );

    await t.commit();

    res.json({
      message: "Reward claimed successfully",
      reward,
      transaction,
      newBalance:
        reward.currency === "USD"
          ? balanceUpdate.balance
          : balanceUpdate.bptBalance,
    });
  } catch (error) {
    await t.rollback();
    console.error("Reward claim error:", error);
    res.status(500).json({ message: "Error claiming reward" });
  }
});

// Get reward by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const reward = await Reward.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!reward) {
      return res.status(404).json({ message: "Reward not found" });
    }

    res.json({ reward });
  } catch (error) {
    console.error("Reward fetch error:", error);
    res.status(500).json({ message: "Error fetching reward" });
  }
});

// Get staking rewards summary
router.get("/staking/summary", auth, async (req, res) => {
  try {
    const stakingRewards = await Reward.findAll({
      where: {
        userId: req.user.id,
        type: "staking",
      },
      attributes: [
        [sequelize.fn("sum", sequelize.col("amount")), "totalAmount"],
        "currency",
        "status",
      ],
      group: ["currency", "status"],
    });

    res.json({ stakingRewards });
  } catch (error) {
    console.error("Staking summary error:", error);
    res.status(500).json({ message: "Error fetching staking summary" });
  }
});

export default router;
