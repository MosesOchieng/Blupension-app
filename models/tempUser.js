const { Model, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

class TempUser extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.TEXT,
          defaultValue: () => uuidv4(),
          primaryKey: true,
        },
        firstName: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        lastName: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        email: {
          type: DataTypes.TEXT,
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true,
          },
        },
        password: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        phone: {
          type: DataTypes.TEXT,
          allowNull: false,
          validate: {
            is: /^254[0-9]{9}$/,
          },
        },
        accountName: {
          type: DataTypes.TEXT,
          allowNull: false,
          unique: true,
          validate: {
            is: /^BLU-\d{4}-[A-Z0-9]{4}$/,
          },
        },
        verification_code: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        original_password: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        expires_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: "TempUser",
        tableName: "temp_users",
        underscored: true,
        hooks: {
          beforeCreate: async (user) => {
            if (user.password) {
              user.password = await bcrypt.hash(user.password, 10);
            }
          },
          beforeUpdate: async (user) => {
            if (user.changed("password")) {
              user.password = await bcrypt.hash(user.password, 10);
            }
          },
        },
      },
    );
  }

  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  }
}

module.exports = TempUser;
