const { sequelize } = require('../config/database');
require('../models/associations'); // This will set up all model associations
const User = require('../models/User');
const InvestmentPlan = require('../models/InvestmentPlan');
const Investment = require('../models/Investment');
const Transaction = require('../models/Transaction');

async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Sync all models with the database
    await sequelize.sync({ force: true });
    
    console.log('Database initialized successfully');
    
    // Create a test user
    const testUser = await User.create({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      phoneNumber: '1234567890'
    });
    
    console.log('Test user created:', testUser.toJSON());
    
    // Create test investment plans
    const plans = await InvestmentPlan.bulkCreate([
      {
        name: 'Basic Plan',
        description: 'Perfect for beginners',
        minAmount: 100,
        maxAmount: 1000,
        interestRate: 5.0,
        duration: 6,
        compoundingFrequency: 'monthly',
        features: JSON.stringify(['Daily Interest', 'Flexible Withdrawal']),
        terms: 'Basic investment terms apply'
      },
      {
        name: 'Premium Plan',
        description: 'Higher returns for experienced investors',
        minAmount: 1000,
        maxAmount: 10000,
        interestRate: 8.0,
        duration: 12,
        compoundingFrequency: 'monthly',
        features: JSON.stringify(['Daily Interest', 'Priority Support', 'Bonus Returns']),
        terms: 'Premium investment terms apply'
      }
    ]);
    
    console.log('Test investment plans created:', plans.map(plan => plan.toJSON()));
    
    // Create a test investment
    const testInvestment = await Investment.create({
      userId: testUser.id,
      planId: plans[0].id,
      amount: 500,
      currency: 'USD',
      bluAmount: 750,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + plans[0].duration * 30 * 24 * 60 * 60 * 1000),
      interestRate: plans[0].interestRate,
      compoundingFrequency: plans[0].compoundingFrequency
    });
    
    console.log('Test investment created:', testInvestment.toJSON());
    
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('Database connection closed');
  }
}

initializeDatabase().catch(console.error); 