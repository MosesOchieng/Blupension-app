import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";
import sequelize from "./db/config.js";
import User from "./models/User.js";
import Portfolio from "./models/Portfolio.js";
import Transaction from "./models/Transaction.js";
import Reward from "./models/Reward.js";
import Achievement from "./models/Achievement.js";
import Account from "./models/Account.js";
import fs from "fs";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy as LinkedInStrategy } from "passport-linkedin-oauth2";
import crypto from "crypto";
import { Web3 } from "web3";
import { ethers } from "ethers";
import { join } from "path";

// Import routes
import authRoutes from "./routes/auth.js";
import { authenticateToken } from "./middleware/auth.js";
import userRoutes from "./routes/user.js";
import portfolioRoutes from "./routes/portfolio.js";
import transactionRoutes from "./routes/transaction.js";
import rewardRoutes from "./routes/reward.js";
import achievementRoutes from "./routes/achievement.js";
import pensionRoutes from "./routes/pension.js";

// Load environment variables
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Initialize passport
app.use(passport.initialize());

// Serve static files from the public directory for auth pages
app.use(express.static(path.join(__dirname, "../../public")));

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, "../../dist")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/pension", pensionRoutes);
app.use("/api/user", userRoutes);
app.use("/api/portfolios", portfolioRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/achievements", achievementRoutes);

// Initialize Web3 and contract with error handling
let web3 = null;
let contract = null;
let provider = null;

// Only initialize blockchain if all required environment variables are present
if (
  process.env.WEB3_PROVIDER_URL &&
  process.env.CONTRACT_ADDRESS &&
  process.env.CONTRACT_ABI
) {
  try {
    provider = new ethers.JsonRpcProvider(process.env.WEB3_PROVIDER_URL);
    web3 = new Web3(process.env.WEB3_PROVIDER_URL);

    const contractABI = JSON.parse(process.env.CONTRACT_ABI);
    contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      contractABI,
      provider,
    );
    console.log("Blockchain connection initialized successfully");
  } catch (error) {
    console.warn("Blockchain connection not available:", error.message);
  }
} else {
  console.log("Blockchain features disabled - missing environment variables");
}

// Authentication middleware
const authMiddleware = async (req, res, next) => {
  try {
    // Check for token in Authorization header or query parameter
    const token =
      req.headers.authorization?.split(" ")[1] ||
      req.query.token ||
      req.cookies?.token;

    if (!token) {
      if (req.xhr || req.headers.accept?.includes("application/json")) {
        return res.status(401).json({
          status: "error",
          message: "Authentication required",
        });
      }
      return res.redirect("/login?redirect=true");
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);

      if (!user) {
        throw new Error("User not found");
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      console.error("Token verification error:", error);
      if (req.xhr || req.headers.accept?.includes("application/json")) {
        return res.status(401).json({
          status: "error",
          message: "Invalid or expired token",
        });
      }
      // Clear invalid token from cookies if present
      res.clearCookie("token");
      return res.redirect("/login?redirect=true");
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    if (req.xhr || req.headers.accept?.includes("application/json")) {
      return res.status(500).json({
        status: "error",
        message: "Authentication error",
      });
    }
    return res.redirect("/login?redirect=true");
  }
};

// Handle auth pages
app.get(
  ["/login", "/login.html", "/register", "/register.html"],
  (req, res) => {
    // If user is already authenticated, redirect to dashboard
    const token =
      req.headers.authorization?.split(" ")[1] ||
      req.query.token ||
      req.cookies?.token;

    if (token) {
      try {
        jwt.verify(token, process.env.JWT_SECRET);
        return res.redirect("/dashboard");
      } catch (error) {
        // Token is invalid, continue to login page
      }
    }

    const page = req.path.replace(".html", "");
    res.sendFile(path.join(__dirname, `../../public${page}.html`));
  },
);

// Protected dashboard routes
app.get("/dashboard", authenticateToken, (req, res) => {
  res.sendFile(join(__dirname, "../../public/dashboard.html"));
});

// Handle all other routes by serving the React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../dist/index.html"));
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      auth: "up",
      user: "up",
      portfolio: "up",
      transaction: "up",
      reward: "up",
      achievement: "up",
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Handle specific errors
  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      status: "error",
      message: "Validation error",
      errors: err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      status: "error",
      message: "Duplicate entry",
      errors: err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  // Default error response
  res.status(500).json({
    status: "error",
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

// Start server
const PORT = process.env.PORT || 5000;

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    // Run migrations
    await import("./db/migrate.js");
    console.log("Database migrations completed.");

    // LinkedIn OAuth configuration
    passport.use(
      new LinkedInStrategy(
        {
          clientID: process.env.LINKEDIN_CLIENT_ID,
          clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
          callbackURL: process.env.LINKEDIN_CALLBACK_URL,
          scope: ["r_emailaddress", "r_liteprofile"],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user exists
            let user = await User.findOne({
              where: { email: profile.emails[0].value },
            });

            if (!user) {
              // Create new user
              user = await User.create({
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                email: profile.emails[0].value,
                linkedinId: profile.id,
                isLinkedInUser: true,
                status: "active",
              });
            } else {
              // Update existing user with LinkedIn ID if not set
              if (!user.linkedinId) {
                user.linkedinId = profile.id;
                user.isLinkedInUser = true;
                await user.save();
              }
            }

            return done(null, user);
          } catch (error) {
            return done(error, null);
          }
        },
      ),
    );

    // LinkedIn auth routes
    app.get(
      "/api/auth/linkedin",
      passport.authenticate("linkedin", { state: true }),
    );

    app.get(
      "/api/auth/linkedin/callback",
      passport.authenticate("linkedin", {
        failureRedirect: "/login?error=linkedin_auth_failed",
        session: false,
      }),
      (req, res) => {
        try {
          // Generate JWT token
          const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, {
            expiresIn: "24h",
          });

          // Store user data in localStorage via script
          const userData = {
            id: req.user.id,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            email: req.user.email,
          };

          // Redirect to frontend with token and user data
          res.redirect(
            `/dashboard?token=${token}&user=${encodeURIComponent(
              JSON.stringify(userData),
            )}`,
          );
        } catch (error) {
          console.error("LinkedIn callback error:", error);
          res.redirect("/login?error=token_generation_failed");
        }
      },
    );

    // Update the /api/blockchain/connect endpoint to handle connection errors
    app.post("/api/blockchain/connect", async (req, res) => {
      try {
        if (!provider) {
          return res.status(503).json({
            success: false,
            message: "Blockchain connection not available",
          });
        }

        const { walletAddress } = req.body;
        if (!walletAddress) {
          return res.status(400).json({
            success: false,
            message: "Wallet address is required",
          });
        }

        // ... rest of your existing blockchain connection code ...
      } catch (error) {
        console.error("Blockchain connection error:", error);
        res.status(500).json({
          success: false,
          message: "Failed to connect to blockchain",
          error: error.message,
        });
      }
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
  process.exit(1);
});

startServer(); 
