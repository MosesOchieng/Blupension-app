const { Model, DataTypes } = require('sequelize');

class EscrowWallet extends Model {
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
          model: 'Users',
          key: 'id'
        }
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false
      },
      balance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
      },
      currency: {
        type: DataTypes.STRING(10),
        defaultValue: 'USD'
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      bluBalance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
      },
      stableCoins: {
        type: DataTypes.JSONB,
        defaultValue: {
          USDT: 0,
          USDC: 0,
          DAI: 0
        }
      },
      cryptocurrencies: {
        type: DataTypes.JSONB,
        defaultValue: {
          BTC: 0,
          ETH: 0,
          BNB: 0
        }
      },
      lastUpdated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      sequelize,
      modelName: 'EscrowWallet',
      tableName: 'escrow_wallets',
      timestamps: true,
      underscored: true
    });
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'userId' });
  }
}

module.exports = EscrowWallet; 