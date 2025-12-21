import { DataTypes } from "sequelize";
import bcrypt from "bcrypt";
import sequelize from "../db/config.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "id",
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "first_name",
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "last_name",
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
      field: "email",
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true, // Allow null for LinkedIn users
      field: "password",
    },
    linkedinId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      field: "linkedin_id",
    },
    walletAddress: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        is: /^0x[a-fA-F0-9]{40}$/,
      },
      field: "wallet_address",
    },
    phone: {
      type: DataTypes.STRING,
      field: "phone",
    },
    address: {
      type: DataTypes.STRING,
      field: "address",
    },
    retirementAge: {
      type: DataTypes.INTEGER,
      defaultValue: 65,
      validate: {
        min: 50,
        max: 75,
      },
      field: "retirement_age",
    },
    monthlyContribution: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      validate: {
        min: 0,
      },
      field: "monthly_contribution",
    },
    investmentPlan: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "moderate",
      validate: {
        isIn: [["conservative", "moderate", "aggressive"]],
      },
      field: "investment_plan",
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_verified",
    },
    verificationCode: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "verification_code",
    },
    verificationCodeExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "verification_code_expiry",
    },
    twoFactorAuth: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "two_factor_auth",
    },
    notifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "notifications",
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "last_login",
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      field: "username",
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "avatar",
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: "balance",
    },
    bptBalance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: "bpt_balance",
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "active",
      validate: {
        isIn: [["active", "inactive", "suspended"]],
      },
      field: "status",
    },
    isLinkedInUser: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_linkedin_user",
    },
  },
  {
    tableName: "users",
    underscored: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password && !user.isLinkedInUser) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password") && !user.isLinkedInUser) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  },
);

// Instance method to compare password
User.prototype.comparePassword = async function (candidatePassword) {
  if (!this.password) return false; // For LinkedIn users without password
  return bcrypt.compare(candidatePassword, this.password);
};

export default User;
