const { Sequelize } = require('sequelize');
const { User } = require('./User');
const { InvestmentPlan } = require('./InvestmentPlan');
const { Investment } = require('./Investment');
const { Transaction } = require('./Transaction');
const { EscrowWallet } = require('./EscrowWallet');

// User associations
User.hasMany(Investment, { foreignKey: 'userId' });
User.hasMany(Transaction, { foreignKey: 'userId' });
User.hasOne(EscrowWallet, { foreignKey: 'userId' });

// InvestmentPlan associations
InvestmentPlan.hasMany(Investment, { foreignKey: 'planId' });

// Investment associations
Investment.belongsTo(User, { foreignKey: 'userId' });
Investment.belongsTo(InvestmentPlan, { foreignKey: 'planId' });
Investment.hasMany(Transaction, { foreignKey: 'investmentId' });

// Transaction associations
Transaction.belongsTo(User, { foreignKey: 'userId' });
Transaction.belongsTo(Investment, { foreignKey: 'investmentId' });

// EscrowWallet associations
EscrowWallet.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  User,
  InvestmentPlan,
  Investment,
  Transaction,
  EscrowWallet
}; 