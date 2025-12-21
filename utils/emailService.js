const nodemailer = require("nodemailer");
require("dotenv").config();

// Gmail SMTP configuration - hardcoded credentials
const GMAIL_USER = "mosesochiengopiyo@gmail.com";
const GMAIL_APP_PASSWORD = "hafw rxsv fwvt qeez";

// Create reusable transporter object using Gmail SMTP
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

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Email transporter verification failed:", error);
  } else {
    console.log("Email transporter is ready to send emails");
  }
});

class EmailService {
  constructor() {
    console.log("EmailService initialized with Gmail SMTP");
    this.fromEmail = GMAIL_USER;
  }

  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  generateAccountName() {
    const prefix = "BLU";
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  async sendVerificationCode(email, code) {
    try {
      const mailOptions = {
        from: `Blupension <${this.fromEmail}>`,
        to: email,
        subject: "Blupension Verification Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e3a8a;">Blupension Verification</h2>
            <p>Thank you for registering with Blupension. To verify your email address, please use the following code:</p>
            <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
              <h1 style="color: #1e3a8a; margin: 0; font-size: 32px;">${code}</h1>
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
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

  async sendAccountDetails(email, accountDetails) {
    try {
      const mailOptions = {
        from: `Blupension <${this.fromEmail}>`,
        to: email,
        subject: "Your Blupension Account Details",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e3a8a;">Welcome to Blupension!</h2>
            <p>Your account has been successfully created. Here are your account details:</p>
            <div style="background-color: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 5px;">
              <h3 style="color: #1e3a8a; margin-top: 0;">Account Information</h3>
              <p><strong>Email:</strong> ${accountDetails.email}</p>
              <p><strong>Account ID:</strong> ${accountDetails.accountId}</p>
              <p><strong>Member Since:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            <div style="background-color: #e5e7eb; padding: 20px; margin: 20px 0; border-radius: 5px;">
              <h3 style="color: #1e3a8a; margin-top: 0;">Next Steps</h3>
              <ol>
                <li>Log in to your account using your email</li>
                <li>Complete your profile information</li>
                <li>Set up your investment preferences</li>
                <li>Start contributing to your pension fund</li>
              </ol>
            </div>
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
            <p>Thank you for choosing Blupension!</p>
          </div>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("Account details email sent:", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("Error sending account details email:", error);
      return { success: false, error: error.message };
    }
  }

  async sendPasswordResetCode(email, code) {
    try {
      const mailOptions = {
        from: `Blupension <${this.fromEmail}>`,
        to: email,
        subject: "Blupension Password Reset Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e3a8a;">Password Reset Request</h2>
            <p>You have requested to reset your password. Use the following code to proceed:</p>
            <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
              <h1 style="color: #1e3a8a; margin: 0; font-size: 32px;">${code}</h1>
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, please ignore this email and contact our support team immediately.</p>
          </div>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("Password reset email sent:", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("Error sending password reset email:", error);
      return { success: false, error: error.message };
    }
  }

  async sendVerificationCodes(email) {
    const code = this.generateVerificationCode();

    // Send email verification
    const emailResult = await this.sendVerificationCode(email, code);

    return {
      emailSuccess: emailResult.success,
      code,
      emailMessageId: emailResult.messageId,
      errors: {
        email: emailResult.error,
      },
    };
  }

  async sendPasswordResetCodes(email) {
    const code = this.generateVerificationCode();

    // Send email reset code
    const emailResult = await this.sendPasswordResetCode(email, code);

    return {
      emailSuccess: emailResult.success,
      code,
      emailMessageId: emailResult.messageId,
      errors: {
        email: emailResult.error,
      },
    };
  }
}

module.exports = new EmailService();
