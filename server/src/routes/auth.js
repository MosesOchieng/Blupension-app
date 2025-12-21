import express from "express";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { authenticateToken } from "../middleware/auth.js";
import passport from "passport";
import nodemailer from "nodemailer";

const router = express.Router();

// Gmail SMTP configuration - hardcoded credentials
const GMAIL_USER = "mosesochiengopiyo@gmail.com";
const GMAIL_APP_PASSWORD = "hafw rxsv fwvt qeez";

// Create email transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
});

// Verify transporter configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("Email transporter verification failed:", error);
  } else {
    console.log("Email transporter is ready to send emails");
  }
});

// Generate verification code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification email
async function sendVerificationEmail(email, code) {
  try {
    const mailOptions = {
      from: `Blupension <${GMAIL_USER}>`,
      to: email,
      subject: "Blupension Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e3a8a;">Welcome to Blupension!</h2>
          <p>Thank you for registering with Blupension. To verify your email address, please use the following code:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
            <h1 style="color: #1e3a8a; margin: 0; font-size: 32px;">${code}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Verification email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return { success: false, error: error.message };
  }
}

// Register validation middleware
const registerValidation = [
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Please enter a valid phone number"),
  body("address").optional().trim(),
  body("retirementAge")
    .optional()
    .isInt({ min: 50, max: 75 })
    .withMessage("Retirement age must be between 50 and 75"),
  body("monthlyContribution")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Monthly contribution must be a positive number"),
  body("investmentPlan")
    .optional()
    .isIn(["conservative", "moderate", "aggressive"])
    .withMessage("Invalid investment plan"),
];

// Register route
router.post("/register", registerValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      address,
      retirementAge,
      monthlyContribution,
      investmentPlan,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      // If user exists but is not verified, allow resending verification code
      if (!existingUser.isVerified) {
        // Generate new verification code
        const verificationCode = generateVerificationCode();
        const verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Update user with new code
        await existingUser.update({
          verificationCode: verificationCode,
          verificationCodeExpiry: verificationCodeExpiry,
        });

        // Send verification email
        const emailResult = await sendVerificationEmail(email, verificationCode);

        return res.status(200).json({
          message: "User already exists but not verified. New verification code sent to your email.",
          userId: existingUser.id,
          requiresVerification: true,
          emailSent: emailResult.success,
        });
      } else {
        // User exists and is verified
        return res.status(400).json({ 
          message: "User already exists. Please login instead.",
          userExists: true,
        });
      }
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create new user (unverified initially)
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      address,
      retirementAge,
      monthlyContribution,
      investmentPlan,
      username: email.split("@")[0],
      status: "active",
      isVerified: false,
      verificationCode: verificationCode,
      verificationCodeExpiry: verificationCodeExpiry,
    });

    // Send verification email
    const emailResult = await sendVerificationEmail(email, verificationCode);

    if (!emailResult.success) {
      console.error("Failed to send verification email:", emailResult.error);
      // Don't delete user, but log the error
      // User can request a new code later
    }

    // Generate JWT token (but user still needs to verify email)
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" },
    );

    res.status(201).json({
      message: "User registered successfully. Please check your email for verification code.",
      token,
      userId: user.id, // Add userId for frontend compatibility
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        walletAddress: user.walletAddress,
        username: user.username,
        status: user.status,
        isVerified: user.isVerified,
      },
      emailSent: emailResult.success,
    });
  } catch (error) {
    console.error("Registration error:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Error registering user" });
  }
});

// Login validation middleware
const loginValidation = [
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email and password are required",
      });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    // Check if user is a LinkedIn user
    if (user.isLinkedInUser) {
      return res.status(401).json({
        status: "error",
        message: "Please use LinkedIn to log in",
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    // Check if user is active
    if (user.status !== "active") {
      return res.status(403).json({
        status: "error",
        message: "Account is not active",
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      // Generate new verification code
      const verificationCode = generateVerificationCode();
      const verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Update user with new code
      await user.update({
        verificationCode: verificationCode,
        verificationCodeExpiry: verificationCodeExpiry,
      });

      // Send verification email
      const emailResult = await sendVerificationEmail(user.email, verificationCode);

      return res.status(403).json({
        status: "error",
        message: "Please verify your email address. A new verification code has been sent to your email.",
        requiresVerification: true,
        userId: user.id,
        emailSent: emailResult.success,
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Send response
    res.json({
      status: "success",
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        walletAddress: user.walletAddress,
        username: user.username,
        balance: user.balance,
        bptBalance: user.bptBalance,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred during login",
    });
  }
});

// Verify token middleware
export const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

// Get user profile route
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: "Error fetching profile" });
  }
});

// Get current user
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key",
    );
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        walletAddress: user.walletAddress,
        username: user.username,
        balance: user.balance,
        bptBalance: user.bptBalance,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
});

// Verify token endpoint
router.get("/verify", authenticateToken, (req, res) => {
  try {
    // The user data is already attached by the authenticateToken middleware
    res.json({
      status: "success",
      user: {
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        role: req.user.role,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({
      status: "error",
      message: "Invalid token",
    });
  }
});

// Verify code route
router.post("/verify-code", async (req, res) => {
  try {
    // Accept both 'code' and 'emailCode' for compatibility
    const code = req.body.code || req.body.emailCode;
    const userId = req.body.userId;

    if (!code || !userId) {
      return res.status(400).json({
        status: "error",
        message: "Verification code and user ID are required",
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Check if code matches and hasn't expired
    if (
      user.verificationCode !== code ||
      !user.verificationCodeExpiry ||
      new Date() > user.verificationCodeExpiry
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid or expired verification code",
      });
    }

    // Update user to verified
    await user.update({
      isVerified: true,
      verificationCode: null,
      verificationCodeExpiry: null,
    });

    res.json({
      status: "success",
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({
      status: "error",
      message: "Error during verification",
    });
  }
});

// Resend verification code route
router.post("/resend-code", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "User ID is required",
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        status: "error",
        message: "Email is already verified",
      });
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with new code
    await user.update({
      verificationCode: verificationCode,
      verificationCodeExpiry: verificationCodeExpiry,
    });

    // Send verification email
    const emailResult = await sendVerificationEmail(user.email, verificationCode);

    if (!emailResult.success) {
      console.error("Failed to send verification email:", emailResult.error);
      return res.status(500).json({
        status: "error",
        message: "Failed to send verification email. Please try again.",
      });
    }

    res.json({
      status: "success",
      message: "Verification code sent successfully",
    });
  } catch (error) {
    console.error("Resend code error:", error);
    res.status(500).json({
      status: "error",
      message: "Error resending verification code",
    });
  }
});

// Social login routes
router.get("/google", (req, res) => {
  if (process.env.ENABLE_OAUTH !== "true") {
    return res
      .status(503)
      .json({ message: "Social login is currently disabled" });
  }
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res);
});

router.get("/linkedin", (req, res) => {
  if (process.env.ENABLE_OAUTH !== "true") {
    return res
      .status(503)
      .json({ message: "Social login is currently disabled" });
  }
  passport.authenticate("linkedin")(req, res);
});

export default router;
