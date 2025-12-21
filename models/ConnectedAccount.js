const { Model, DataTypes } = require('sequelize');

class ConnectedAccount extends Model {
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
      type: {
        type: DataTypes.ENUM('metamask', 'bank', 'mobile_money'),
        allowNull: false
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true
      },
      accountNumber: {
        type: DataTypes.STRING,
        allowNull: true
      },
      bankName: {
        type: DataTypes.STRING,
        allowNull: true
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true
      },
      provider: {
        type: DataTypes.STRING,
        allowNull: true
      },
      balance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
      },
      connected: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      lastUpdated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      sequelize,
      modelName: 'ConnectedAccount'
    });
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'userId' });
  }
}

module.exports = ConnectedAccount; 