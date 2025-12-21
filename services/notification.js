const nodemailer = require('nodemailer');
const User = require('../models/User');

// Gmail SMTP configuration - hardcoded credentials
const GMAIL_USER = "mosesochiengopiyo@gmail.com";
const GMAIL_APP_PASSWORD = "hafw rxsv fwvt qeez";

// Email transporter configuration using Gmail
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

// Notification templates
const templates = {
  DEPOSIT_SUCCESS: {
    subject: 'Deposit Successful',
    html: (data) => `
      <h2>Deposit Successful</h2>
      <p>Your deposit of ${data.amount} USD has been processed successfully.</p>
      <p>You can now use these funds to invest in our plans.</p>
      <p>Thank you for choosing Blu Pension!</p>
    `
  },
  DEPOSIT_FAILED: {
    subject: 'Deposit Failed',
    html: (data) => `
      <h2>Deposit Failed</h2>
      <p>We're sorry, but your deposit could not be processed.</p>
      <p>Reason: ${data.reason}</p>
      <p>Please try again or contact support if the issue persists.</p>
    `
  },
  INVESTMENT_SUCCESS: {
    subject: 'Investment Successful',
    html: (data) => `
      <h2>Investment Successful</h2>
      <p>Your investment of ${data.amount} BLU has been processed successfully.</p>
      <p>Plan: ${data.planName}</p>
      <p>Expected returns: ${data.expectedReturns} BLU</p>
      <p>Thank you for investing with Blu Pension!</p>
    `
  },
  INVESTMENT_MATURED: {
    subject: 'Investment Matured',
    html: (data) => `
      <h2>Investment Matured</h2>
      <p>Your investment in ${data.planName} has matured.</p>
      <p>Initial investment: ${data.initialAmount} BLU</p>
      <p>Returns: ${data.returns} BLU</p>
      <p>Total: ${data.total} BLU</p>
      <p>Thank you for investing with Blu Pension!</p>
    `
  },
  WITHDRAWAL_SUCCESS: {
    subject: 'Withdrawal Successful',
    html: (data) => `
      <h2>Withdrawal Successful</h2>
      <p>Your withdrawal of ${data.amount} ${data.currency} has been processed successfully.</p>
      <p>Transaction ID: ${data.transactionId}</p>
      <p>Thank you for choosing Blu Pension!</p>
    `
  },
  WITHDRAWAL_FAILED: {
    subject: 'Withdrawal Failed',
    html: (data) => `
      <h2>Withdrawal Failed</h2>
      <p>We're sorry, but your withdrawal could not be processed.</p>
      <p>Reason: ${data.reason}</p>
      <p>Please try again or contact support if the issue persists.</p>
    `
  }
};

// Send notification to user
async function sendNotification(userId, type, data) {
  try {
    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get notification template
    const template = templates[type];
    if (!template) {
      throw new Error('Invalid notification type');
    }

    // Send email
    await transporter.sendMail({
      from: `Blupension <${GMAIL_USER}>`,
      to: user.email,
      subject: template.subject,
      html: template.html(data)
    });

    // TODO: Implement push notifications
    // TODO: Implement SMS notifications

    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}

module.exports = {
  sendNotification
}; 