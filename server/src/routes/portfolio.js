import express from "express";
import { body, validationResult } from "express-validator";
import auth from "../middleware/auth.js";
import Portfolio from "../models/Portfolio.js";

const router = express.Router();

// Get user's portfolios
router.get("/", auth, async (req, res) => {
  try {
    const portfolios = await Portfolio.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });

    res.json({ portfolios });
  } catch (error) {
    console.error("Portfolio fetch error:", error);
    res.status(500).json({ message: "Error fetching portfolios" });
  }
});

// Create new portfolio
router.post(
  "/",
  auth,
  [
    body("name").trim().notEmpty().withMessage("Portfolio name is required"),
    body("strategy")
      .isIn(["conservative", "moderate", "aggressive"])
      .withMessage("Invalid strategy"),
    body("description").optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, strategy, description } = req.body;

      const portfolio = await Portfolio.create({
        userId: req.user.id,
        name,
        strategy,
        description,
        allocation: getDefaultAllocation(strategy),
      });

      res.status(201).json({
        message: "Portfolio created successfully",
        portfolio,
      });
    } catch (error) {
      console.error("Portfolio creation error:", error);
      res.status(500).json({ message: "Error creating portfolio" });
    }
  },
);

// Get portfolio by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    res.json({ portfolio });
  } catch (error) {
    console.error("Portfolio fetch error:", error);
    res.status(500).json({ message: "Error fetching portfolio" });
  }
});

// Update portfolio
router.put(
  "/:id",
  auth,
  [
    body("name").optional().trim().notEmpty(),
    body("strategy")
      .optional()
      .isIn(["conservative", "moderate", "aggressive"]),
    body("description").optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const portfolio = await Portfolio.findOne({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
      });

      if (!portfolio) {
        return res.status(404).json({ message: "Portfolio not found" });
      }

      const { name, strategy, description } = req.body;
      const updates = {
        name: name || portfolio.name,
        strategy: strategy || portfolio.strategy,
        description: description || portfolio.description,
      };

      if (strategy && strategy !== portfolio.strategy) {
        updates.allocation = getDefaultAllocation(strategy);
      }

      await portfolio.update(updates);

      res.json({
        message: "Portfolio updated successfully",
        portfolio,
      });
    } catch (error) {
      console.error("Portfolio update error:", error);
      res.status(500).json({ message: "Error updating portfolio" });
    }
  },
);

// Delete portfolio
router.delete("/:id", auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    await portfolio.destroy();

    res.json({ message: "Portfolio deleted successfully" });
  } catch (error) {
    console.error("Portfolio deletion error:", error);
    res.status(500).json({ message: "Error deleting portfolio" });
  }
});

// Get portfolio performance
router.get("/:id/performance", auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    res.json({
      performance: portfolio.performance,
      totalValue: portfolio.totalValue,
      allocation: portfolio.allocation,
    });
  } catch (error) {
    console.error("Portfolio performance error:", error);
    res.status(500).json({ message: "Error fetching portfolio performance" });
  }
});

// Helper function to get default allocation based on strategy
function getDefaultAllocation(strategy) {
  switch (strategy) {
    case "conservative":
      return {
        stocks: 30,
        bonds: 50,
        cash: 20,
      };
    case "moderate":
      return {
        stocks: 60,
        bonds: 30,
        cash: 10,
      };
    case "aggressive":
      return {
        stocks: 80,
        bonds: 15,
        cash: 5,
      };
    default:
      return {
        stocks: 60,
        bonds: 30,
        cash: 10,
      };
  }
}

export default router;
