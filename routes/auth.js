const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const emailService = require("../utils/emailService");
const { createWallet } = require("../utils/walletService");
const {
  User,
  VerificationCode,
  PasswordResetToken,
  TempUser,
} = require("../models");
const { Op } = require("sequelize");

// Health check endpoint
router.get("/health", async (req, res) => {
  try {
    // Test database connection
    await User.sequelize.authenticate();
    
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      environment: process.env.NODE_ENV || "development"
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Register endpoint
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // Validate required fields
    const errors = [];
    if (!firstName) errors.push("First name is required");
    if (!lastName) errors.push("Last name is required");
    if (!email) errors.push("Email is required");
    if (!password) errors.push("Password is required");
    if (!phone) errors.push("Phone number is required");

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    // Validate phone number format
    if (!/^254[0-9]{9}$/.test(phone)) {
      return res.status(400).json({
        message: "Phone number must start with 254 followed by 9 digits",
      });
    }

    // Check if user exists in either permanent or temporary users
    const existingUser = await User.findOne({ where: { email } });
    const existingTempUser = await TempUser.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    if (existingTempUser) {
      // If there's an unverified user, delete it and allow re-registration
      await existingTempUser.destroy();
    }

    // Generate verification code and account name
    const verificationCode = emailService.generateVerificationCode();
    const accountName = emailService.generateAccountName();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log("Registration details:", {
      email,
      verificationCode,
      accountName,
      expiresAt,
      currentTime: new Date(),
    });

    // Store original password before creating temporary user
    const originalPassword = password;

    // Create temporary user with explicit field mapping
    const tempUser = await TempUser.create({
      firstName,
      lastName,
      email,
      password: originalPassword,  // This will be hashed by TempUser model's beforeCreate hook
      phone,
      accountName,
      verification_code: verificationCode,
      expires_at: expiresAt,
    });

    // Store the original password in a separate field
    await tempUser.update({ original_password: originalPassword });

    // Send verification email
    const emailResult = await emailService.sendVerificationCode(
      email,
      verificationCode,
    );

    if (!emailResult.success) {
      // If email fails, delete the temporary user
      await tempUser.destroy();
      return res.status(500).json({
        message: "Failed to send verification email. Please try again.",
      });
    }

    res.status(201).json({
      message: "Registration successful. Please check your email for verification code.",
      userId: tempUser.id,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Registration failed. Please try again.",
    });
  }
});

// Verify code endpoint
router.post("/verify-code", async (req, res) => {
  try {
    const { emailCode, userId } = req.body;

    // Validate required fields
    if (!emailCode || !userId) {
      console.log("Missing required fields:", { emailCode, userId });
      return res.status(400).json({
        message: "Invalid verification code",
      });
    }

    console.log("Verification attempt:", { emailCode, userId });

    // Get temporary user
    const tempUser = await TempUser.findOne({
      where: {
        id: userId,
        verification_code: emailCode,
        expires_at: {
          [Op.gt]: new Date(),
        },
      },
    });

    console.log("Found temp user:", tempUser ? "Yes" : "No");
    if (tempUser) {
      console.log("Temp user details:", {
        id: tempUser.id,
        email: tempUser.email,
        verification_code: tempUser.verification_code,
        expires_at: tempUser.expires_at,
        current_time: new Date(),
      });
    }

    if (!tempUser) {
      console.log("Verification failed: Invalid code or expired");
      return res.status(400).json({
        message: "Invalid verification code",
      });
    }

    // Create wallet for the user
    const wallet = await createWallet();

    // Create permanent user with original password
    const user = await User.create({
      firstName: tempUser.firstName,
      lastName: tempUser.lastName,
      email: tempUser.email,
      password: tempUser.original_password,  // Use the original password
      phone: tempUser.phone || "", // Ensure phone is set to empty string if null
      accountName: tempUser.accountName,
      isVerified: true,
      role: "user",
      walletAddress: wallet.address,
      walletPrivateKey: wallet.privateKey,
      walletMnemonic: wallet.mnemonic,
    });

    // Send account details email
    await emailService.sendAccountDetails(user.email, {
      email: user.email,
      accountId: user.accountName,
    });

    // Delete temporary user
    await tempUser.destroy();

    res.json({
      message:
        "Account verified successfully. Please check your email for your account details.",
      walletAddress: user.walletAddress,
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ message: "Verification failed. Please try again." });
  }
});

// Resend verification codes endpoint
router.post("/resend-code", async (req, res) => {
  try {
    const { userId } = req.body;

    // Get temporary user
    const tempUser = await TempUser.findByPk(userId);
    if (!tempUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate new verification code
    const verificationCode = emailService.generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update temporary user with new code
    await tempUser.update({
      verification_code: verificationCode,
      expires_at: expiresAt,
    });

    // Send new verification code
    const emailResult = await emailService.sendVerificationCode(
      tempUser.email,
      verificationCode,
    );

    if (!emailResult.success) {
      return res.status(500).json({
        message: "Failed to send verification email. Please try again.",
      });
    }

    res.json({ message: "New verification code sent successfully" });
  } catch (error) {
    console.error("Resend code error:", error);
    res.status(500).json({
      message: "Failed to resend verification code. Please try again.",
    });
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login attempt:", { email });

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        error: "Email and password are required" 
      });
    }

    // Find user
    const user = await User.findByEmail(email);
    console.log("User found:", user ? "Yes" : "No");
    if (user) {
      console.log("User details:", {
        id: user.id,
        email: user.email,
        isVerified: user.isVerified,
        role: user.role
      });
    }

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check if user is verified
    if (!user.isVerified) {
      console.log("User not verified");
      return res.status(401).json({
        error: "Please verify your email first",
        userId: user.id,
      });
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        isProfileComplete: user.isProfileComplete
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    // Set the token in a cookie (deployment-friendly)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Secure in production
      sameSite: 'lax', // More permissive for deployment
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Return JSON response
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isProfileComplete: user.isProfileComplete
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    
    // More specific error messages
    if (error.name === 'SequelizeConnectionError') {
      return res.status(500).json({ 
        error: "Database connection error. Please try again." 
      });
    }
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        error: "Invalid input data" 
      });
    }
    
    res.status(500).json({ 
      error: "Login failed. Please try again." 
    });
  }
});

// Forgot password endpoint
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate and store reset token
    const resetToken = emailService.generateResetToken();
    await PasswordResetToken.create({
      userId: user.id,
      token: resetToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    // Send reset email
    await emailService.sendPasswordResetEmail(email, resetToken);

    res.json({ message: "Password reset instructions sent to your email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      message: "Failed to process password reset request. Please try again.",
    });
  }
});

// Reset password endpoint
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Find valid reset token
    const resetToken = await PasswordResetToken.findOne({
      where: {
        token,
        expiresAt: {
          [Op.gt]: new Date(),
        },
      },
      order: [["created_at", "DESC"]],
      include: [
        {
          model: User,
          attributes: ["id"],
        },
      ],
    });

    if (!resetToken) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    // Update user password
    await User.update(
      { password: newPassword },
      { where: { id: resetToken.userId } },
    );

    // Delete used reset token
    await resetToken.destroy();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res
      .status(500)
      .json({ message: "Failed to reset password. Please try again." });
  }
});

// Verify token endpoint
router.get("/verify", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "No token provided",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      return res.status(401).json({
        status: "error",
        message:
          jwtError.name === "TokenExpiredError"
            ? "Token has expired"
            : "Invalid token",
      });
    }

    if (!decoded.userId) {
      return res.status(401).json({
        status: "error",
        message: "Invalid token format",
      });
    }

    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        status: "error",
        message: "Email not verified",
        userId: user.id,
      });
    }

    res.json({
      status: "success",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({
      status: "error",
      message: "Server error during verification",
    });
  }
});

module.exports = router;
