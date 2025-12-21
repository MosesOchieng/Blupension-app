import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import { ethers } from "ethers";

const router = express.Router();

// Initialize contract with error handling
let contract = null;
let provider = null;

try {
  if (process.env.WEB3_PROVIDER_URL && process.env.CONTRACT_ADDRESS && process.env.CONTRACT_ABI) {
    provider = new ethers.JsonRpcProvider(process.env.WEB3_PROVIDER_URL);
    const contractABI = JSON.parse(process.env.CONTRACT_ABI);
    contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      contractABI,
      provider
    );
  }
} catch (error) {
  console.warn("Blockchain connection not available:", error.message);
}

// Get pension balance
router.get("/balance", authenticateToken, async (req, res) => {
  try {
    if (!contract) {
      return res.status(503).json({
        success: false,
        message: "Blockchain connection not available",
      });
    }

    const balance = await contract.calculateVestedAmount(req.user.walletAddress);
    res.json({
      success: true,
      balance: balance.toString(),
    });
  } catch (error) {
    console.error("Error getting pension balance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get pension balance",
      error: error.message,
    });
  }
});

// Make a contribution
router.post("/contribute", authenticateToken, async (req, res) => {
  try {
    if (!contract) {
      return res.status(503).json({
        success: false,
        message: "Blockchain connection not available",
      });
    }

    const { amount } = req.body;
    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Amount is required",
      });
    }

    // Create transaction record
    const transaction = await Transaction.create({
      userId: req.user.id,
      type: "contribution",
      amount: amount,
      status: "pending",
    });

    // Send transaction to blockchain
    const tx = await contract.contribute({
      value: ethers.parseEther(amount.toString()),
    });

    // Update transaction record
    await transaction.update({
      status: "completed",
      txHash: tx.hash,
    });

    res.json({ 
      success: true,
      transaction: transaction,
      txHash: tx.hash,
    });
  } catch (error) {
    console.error("Error making contribution:", error);
    res.status(500).json({
      success: false,
      message: "Failed to make contribution",
      error: error.message,
    });
  }
});

// Claim vested tokens
router.post("/claim", authenticateToken, async (req, res) => {
  try {
    if (!contract) {
      return res.status(503).json({
        success: false,
        message: "Blockchain connection not available",
      });
    }

    // Create transaction record
    const transaction = await Transaction.create({
      userId: req.user.id,
      type: "claim",
      status: "pending",
    });

    // Send claim transaction to blockchain
    const tx = await contract.claimTokens();

    // Update transaction record
    await transaction.update({
      status: "completed",
      txHash: tx.hash,
    });

    res.json({ 
      success: true,
      transaction: transaction,
      txHash: tx.hash,
    });
  } catch (error) {
    console.error("Error claiming tokens:", error);
    res.status(500).json({
      success: false,
      message: "Failed to claim tokens",
      error: error.message,
    });
  }
});

// Get contribution history
router.get("/contributions", authenticateToken, async (req, res) => {
  try {
    if (!contract) {
      return res.status(503).json({
        success: false,
        message: "Blockchain connection not available",
      });
    }

    const contributions = await contract.contributions(req.user.walletAddress);
    const lastContributionTime = await contract.lastContributionTime(req.user.walletAddress);

    res.json({
      success: true,
      contributions: contributions.toString(),
      lastContributionTime: lastContributionTime.toString(),
    });
  } catch (error) {
    console.error("Error getting contribution history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get contribution history",
      error: error.message,
    });
  }
});

export default router; 
