import express from "express";
import { body, validationResult } from "express-validator";
import auth from "../middleware/auth.js";
import Achievement from "../models/Achievement.js";
import Reward from "../models/Reward.js";
import sequelize from "../db/config.js";

const router = express.Router();

// Get user's achievements
router.get("/", auth, async (req, res) => {
  try {
    const achievements = await Achievement.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });

    res.json({ achievements });
  } catch (error) {
    console.error("Achievements fetch error:", error);
    res.status(500).json({ message: "Error fetching achievements" });
  }
});

// Create new achievement
router.post(
  "/",
  auth,
  [
    body("name").trim().notEmpty(),
    body("category").isIn([
      "investment",
      "trading",
      "community",
      "security",
      "engagement",
    ]),
    body("target").isInt({ min: 1 }),
    body("reward").isFloat({ min: 0 }),
    body("rewardCurrency").isIn(["USD", "BPT"]),
    body("description").optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, category, target, reward, rewardCurrency, description } =
        req.body;

      const achievement = await Achievement.create({
        userId: req.user.id,
        name,
        category,
        target,
        reward,
        rewardCurrency,
        description,
        progress: 0,
        status: "in_progress",
      });

      res.status(201).json({
        message: "Achievement created successfully",
        achievement,
      });
    } catch (error) {
      console.error("Achievement creation error:", error);
      res.status(500).json({ message: "Error creating achievement" });
    }
  },
);

// Update achievement progress
router.put(
  "/:id/progress",
  auth,
  [body("progress").isInt({ min: 0 })],
  async (req, res) => {
    const t = await sequelize.transaction();

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { progress } = req.body;
      const achievement = await Achievement.findOne({
        where: {
          id: req.params.id,
          userId: req.user.id,
          status: "in_progress",
        },
        transaction: t,
      });

      if (!achievement) {
        await t.rollback();
        return res.status(404).json({ message: "Achievement not found" });
      }

      // Update progress
      achievement.progress = progress;

      // Check if achievement is completed
      if (
        progress >= achievement.target &&
        achievement.status === "in_progress"
      ) {
        achievement.status = "completed";
        achievement.completedAt = new Date();

        // Create reward
        await Reward.create(
          {
            userId: req.user.id,
            type: "achievement",
            amount: achievement.reward,
            currency: achievement.rewardCurrency,
            description: `Reward for completing achievement: ${achievement.name}`,
            status: "pending",
          },
          { transaction: t },
        );
      }

      await achievement.save({ transaction: t });
      await t.commit();

      res.json({
        message:
          achievement.status === "completed"
            ? "Achievement completed!"
            : "Progress updated",
        achievement,
      });
    } catch (error) {
      await t.rollback();
      console.error("Achievement progress error:", error);
      res.status(500).json({ message: "Error updating achievement progress" });
    }
  },
);

// Get achievement by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const achievement = await Achievement.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!achievement) {
      return res.status(404).json({ message: "Achievement not found" });
    }

    res.json({ achievement });
  } catch (error) {
    console.error("Achievement fetch error:", error);
    res.status(500).json({ message: "Error fetching achievement" });
  }
});

// Get achievements by category
router.get("/category/:category", auth, async (req, res) => {
  try {
    const { category } = req.params;
    const achievements = await Achievement.findAll({
      where: {
        userId: req.user.id,
        category,
      },
      order: [["createdAt", "DESC"]],
    });

    res.json({ achievements });
  } catch (error) {
    console.error("Category achievements fetch error:", error);
    res.status(500).json({ message: "Error fetching category achievements" });
  }
});

// Get achievements summary
router.get("/summary", auth, async (req, res) => {
  try {
    const summary = await Achievement.findAll({
      where: { userId: req.user.id },
      attributes: [
        "category",
        "status",
        [sequelize.fn("count", sequelize.col("id")), "count"],
        [sequelize.fn("sum", sequelize.col("reward")), "totalReward"],
      ],
      group: ["category", "status"],
    });

    res.json({ summary });
  } catch (error) {
    console.error("Achievement summary error:", error);
    res.status(500).json({ message: "Error fetching achievement summary" });
  }
});

export default router;
