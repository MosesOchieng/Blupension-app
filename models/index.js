const { Sequelize } = require('sequelize');
const path = require('path');

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite'),
  logging: false,
  define: {
    timestamps: true,
    underscored: true
  }
});

// Import models
const User = require('./User');
const InvestmentPlan = require('./InvestmentPlan');
const Investment = require('./Investment');
const Transaction = require('./Transaction');
const EscrowWallet = require('./EscrowWallet');
const ConnectedAccount = require('./ConnectedAccount');
const VerificationCode = require('./VerificationCode');
const PasswordResetToken = require('./PasswordResetToken');
const TempUser = require('./TempUser');

// Initialize models
const models = {
  User,
  InvestmentPlan,
  Investment,
  Transaction,
  EscrowWallet,
  ConnectedAccount,
  VerificationCode,
  PasswordResetToken,
  TempUser
};

// Initialize each model
Object.values(models).forEach(model => {
  if (typeof model.init === 'function') {
    model.init(sequelize);
  }
});

// Set up associations
Object.values(models).forEach(model => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

module.exports = {
  sequelize,
  ...models
}; 