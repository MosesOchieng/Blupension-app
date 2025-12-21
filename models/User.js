const { Model, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        firstName: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        lastName: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true,
          },
        },
        phone: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          validate: {
            is: /^254\d{9}$/,
          },
        },
        accountName: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          validate: {
            is: /^BLU-\d{4}-[A-Z0-9]{4}$/,
          },
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        role: {
          type: DataTypes.ENUM("user", "admin"),
          defaultValue: "user",
        },
        isVerified: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        verificationToken: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        resetPasswordToken: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        resetPasswordExpires: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        walletAddress: {
          type: DataTypes.STRING,
          allowNull: true,
          unique: true,
        },
        walletPrivateKey: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        walletMnemonic: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: "User",
        tableName: "users",
        timestamps: true,
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

  static associate(models) {
    this.hasMany(models.Investment, { foreignKey: "userId" });
    this.hasMany(models.Transaction, { foreignKey: "userId" });
    this.hasMany(models.VerificationCode, { foreignKey: "userId" });
    this.hasMany(models.PasswordResetToken, { foreignKey: "userId" });
    this.hasOne(models.EscrowWallet, { foreignKey: "userId" });
  }

  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  }

  static async findByEmail(email) {
    return this.findOne({ where: { email: email.toLowerCase() } });
  }

  static async findById(id) {
    return this.findByPk(id);
  }

  static async findByPhone(phone) {
    return this.findOne({ where: { phone } });
  }

  static async findByAccountName(accountName) {
    return this.findOne({ where: { accountName } });
  }

  static async verifyEmail(userId) {
    const user = await this.findByPk(userId);
    if (user) {
      user.isVerified = true;
      await user.save();
    }
    return user;
  }

  static async updatePassword(userId, newPassword) {
    const user = await this.findByPk(userId);
    if (user) {
      user.password = newPassword;
      await user.save();
    }
    return user;
  }
}

module.exports = User;
