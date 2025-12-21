const { Model, DataTypes } = require('sequelize');

class Investment extends Model {
  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      planId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'investment_plans',
          key: 'id'
        }
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'USD'
      },
      bluAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('pending', 'active', 'completed', 'cancelled'),
        defaultValue: 'pending'
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false
      },
      expectedReturn: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      actualReturn: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      interestRate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false
      },
      compoundingFrequency: {
        type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly'),
        defaultValue: 'monthly'
      },
      currentValue: {
        type: DataTypes.VIRTUAL,
        get() {
          const startDate = this.getDataValue('startDate');
          const amount = this.getDataValue('amount');
          const expectedReturn = this.getDataValue('expectedReturn');
          
          if (!startDate || !amount || !expectedReturn) return amount;

          const now = new Date();
          const duration = (now - startDate) / (1000 * 60 * 60 * 24); // days
          const returnRate = expectedReturn / amount;
          const dailyRate = returnRate / 365;

          return amount * (1 + (dailyRate * duration));
        }
      }
    }, {
      sequelize,
      modelName: 'Investment',
      tableName: 'investments'
    });
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'userId' });
    this.belongsTo(models.InvestmentPlan, { foreignKey: 'planId' });
    this.hasMany(models.Transaction, { foreignKey: 'investmentId' });
  }
}

module.exports = Investment; 