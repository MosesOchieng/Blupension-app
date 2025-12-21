import User from '../models/User.js';
import sequelize from './config.js';

async function seed() {
  try {
    // Create test users
    const testUsers = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: '$2b$10$lgTHRr6RuOmbcvmu4kwwSOa/NdFoGYy0nJQmNghGPKsRnMkfeLckS', // password123
        walletAddress: '0x1234567890123456789012345678901234567890',
        phone: '+254700000000',
        address: 'Nairobi, Kenya',
        retirementAge: 65,
        monthlyContribution: 1000,
        investmentPlan: 'moderate',
        isVerified: true,
        twoFactorAuth: false,
        notifications: true,
        balance: 0,
        bptBalance: 0,
        status: 'active',
        isLinkedInUser: false
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        password: '$2b$10$lgTHRr6RuOmbcvmu4kwwSOa/NdFoGYy0nJQmNghGPKsRnMkfeLckS', // password123
        walletAddress: '0x0987654321098765432109876543210987654321',
        phone: '+254700000001',
        address: 'Mombasa, Kenya',
        retirementAge: 60,
        monthlyContribution: 2000,
        investmentPlan: 'aggressive',
        isVerified: true,
        twoFactorAuth: false,
        notifications: true,
        balance: 0,
        bptBalance: 0,
        status: 'active',
        isLinkedInUser: false
      }
    ];

    // Create users
    for (const userData of testUsers) {
      await User.create(userData);
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

// Run migrations first, then seed
import './migrate.js';
seed(); 