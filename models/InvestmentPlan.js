const { Model, DataTypes } = require('sequelize');

class InvestmentPlan extends Model {
  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      minAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      maxAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      interestRate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false
      },
      riskLevel: {
        type: DataTypes.ENUM('low', 'medium', 'high'),
        allowNull: false,
        defaultValue: 'medium'
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
      },
      features: {
        type: DataTypes.JSON,
        allowNull: true
      }
    }, {
      sequelize,
      modelName: 'InvestmentPlan',
      tableName: 'investment_plans',
      timestamps: true,
      underscored: true
    });
  }

  static associate(models) {
    this.hasMany(models.Investment, { foreignKey: 'planId' });
  }
}

module.exports = InvestmentPlan; 