import express from "express";
import { body, validationResult } from "express-validator";
import { verifyToken } from "./auth.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import auth from "../middleware/auth.js";

const router = express.Router();

// Get user profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        walletAddress: user.walletAddress,
        balance: user.balance,
        bptBalance: user.bptBalance,
        status: user.status,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: "Error fetching profile" });
  }
});

// Update user profile
router.put("/profile", auth, async (req, res) => {
  try {
    const { username, walletAddress } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user fields
    await user.update({
      username: username || user.username,
      walletAddress: walletAddress || user.walletAddress,
    });

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        walletAddress: user.walletAddress,
        balance: user.balance,
        bptBalance: user.bptBalance,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
});

// Get user balance
router.get("/balance", auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      balance: user.balance,
      bptBalance: user.bptBalance,
    });
  } catch (error) {
    console.error("Balance error:", error);
    res.status(500).json({ message: "Error fetching balance" });
  }
});

// Update user settings
router.put("/settings", auth, async (req, res) => {
  try {
    const { notifications } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.update({
      notifications:
        notifications !== undefined ? notifications : user.notifications,
    });

    res.json({
      message: "Settings updated successfully",
      settings: {
        notifications: user.notifications,
      },
    });
  } catch (error) {
    console.error("Settings error:", error);
    res.status(500).json({ message: "Error updating settings" });
  }
});

// Change password
router.put(
  "/change-password",
  verifyToken,
  [
    body("currentPassword").notEmpty(),
    body("newPassword").isLength({ min: 6 }),
  ],
  async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        return res
          .status(401)
          .json({ message: "Current password is incorrect" });
    }

    // Update password
    user.password = newPassword;
    await user.save();

      res.json({ message: "Password updated successfully" });
  } catch (error) {
      console.error("Password change error:", error);
      res.status(500).json({ message: "Error changing password" });
  }
  },
);

// Enable/disable 2FA
router.put(
  "/2fa",
  verifyToken,
  [body("enable").isBoolean()],
  async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { enable } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    user.twoFactorAuth = enable;
    await user.save();

    res.json({ 
        message: `2FA ${enable ? "enabled" : "disabled"} successfully`,
        twoFactorAuth: enable,
    });
  } catch (error) {
      console.error("2FA update error:", error);
      res.status(500).json({ message: "Error updating 2FA settings" });
  }
  },
);

// Connect wallet
router.post(
  "/connect-wallet",
  verifyToken,
  [
    body("walletAddress")
      .matches(/^0x[a-fA-F0-9]{40}$/)
      .withMessage("Invalid wallet address"),
  ],
  async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { walletAddress } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // Check if wallet is already connected to another account
    const existingUser = await User.findOne({ walletAddress });
    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res
          .status(400)
          .json({ message: "Wallet already connected to another account" });
    }

    user.walletAddress = walletAddress;
    await user.save();

    res.json({ 
        message: "Wallet connected successfully",
        walletAddress,
    });
  } catch (error) {
      console.error("Wallet connection error:", error);
      res.status(500).json({ message: "Error connecting wallet" });
  }
  },
);

// Get investment summary
router.get("/investment-summary", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate retirement metrics
    const currentDate = new Date();
    const birthYear =
      currentDate.getFullYear() -
      (currentDate.getFullYear() - user.retirementAge + 65);
    const yearsToRetirement =
      user.retirementAge - (currentDate.getFullYear() - birthYear);
    const monthlyContribution = user.monthlyContribution;
    const projectedAmount = monthlyContribution * 12 * yearsToRetirement * 1.08; // 8% annual return

    res.json({
      currentPlan: user.investmentPlan,
      monthlyContribution: monthlyContribution,
      yearsToRetirement: yearsToRetirement,
      projectedAmount: projectedAmount,
      retirementAge: user.retirementAge,
    });
  } catch (error) {
    console.error("Investment summary error:", error);
    res.status(500).json({ message: "Error fetching investment summary" });
  }
});

// Delete account
router.delete(
  "/account",
  verifyToken,
  [body("password").notEmpty()],
  async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { password } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return res.status(401).json({ message: "Password is incorrect" });
    }

    await User.findByIdAndDelete(req.userId);
      res.json({ message: "Account deleted successfully" });
  } catch (error) {
      console.error("Account deletion error:", error);
      res.status(500).json({ message: "Error deleting account" });
  }
  },
);

export default router; 
