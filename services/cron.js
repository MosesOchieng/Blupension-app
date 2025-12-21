const cron = require('node-cron');
const { Investment, Transaction } = require('../models');
const { Sequelize } = require('sequelize');

// Function to process investment returns
async function processInvestmentReturns() {
  try {
    // Get all active investments that have reached their end date
    const maturedInvestments = await Investment.findAll({
      where: {
        status: 'active',
        endDate: {
          [Sequelize.Op.lte]: new Date()
        }
      }
    });

    for (const investment of maturedInvestments) {
      // Create a transaction for the return
      await Transaction.create({
        userId: investment.userId,
        investmentId: investment.id,
        type: 'RETURN',
        amount: investment.expectedReturn,
        status: 'completed',
        currency: 'USD',
        description: `Return from investment ${investment.id}`
      });

      // Update investment status
      await investment.update({
        status: 'completed'
      });
    }
  } catch (error) {
    console.error('Error processing investment returns:', error);
  }
}

// Schedule cron jobs
function startCronJobs() {
  // Process investment returns daily at midnight
  cron.schedule('0 0 * * *', processInvestmentReturns);
  console.log('Cron jobs started');
}

module.exports = {
  startCronJobs
}; 