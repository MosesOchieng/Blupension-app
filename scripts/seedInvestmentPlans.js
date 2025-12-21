require('dotenv').config();
const { sequelize, InvestmentPlan } = require('../models');

const plans = [
  {
    name: 'Starter Plan',
    description: 'Perfect for beginners. Low risk, steady returns.',
    minAmount: 100,
    maxAmount: 1000,
    interestRate: 5,
    durationDays: 30,
    isActive: true
  },
  {
    name: 'Growth Plan',
    description: 'Balanced investment with moderate risk and higher returns.',
    minAmount: 1000,
    maxAmount: 5000,
    interestRate: 8,
    durationDays: 60,
    isActive: true
  },
  {
    name: 'Premium Plan',
    description: 'High-yield investment for experienced investors.',
    minAmount: 5000,
    maxAmount: 50000,
    interestRate: 12,
    durationDays: 90,
    isActive: true
  }
];

async function seedPlans() {
  try {
    await sequelize.sync();
    
    // Delete existing plans
    await InvestmentPlan.destroy({ where: {} });
    
    // Create new plans
    await InvestmentPlan.bulkCreate(plans);
    
    console.log('Investment plans seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding investment plans:', error);
    process.exit(1);
  }
}

seedPlans(); 