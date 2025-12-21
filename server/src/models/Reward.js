import { DataTypes } from "sequelize";
import sequelize from "../db/config.js";
import User from "./User.js";

const Reward = sequelize.define("Reward", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
  type: {
    type: DataTypes.ENUM("staking", "referral", "achievement", "bonus"),
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.ENUM("USD", "BPT"),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("pending", "claimed", "expired"),
    defaultValue: "pending",
  },
  claimedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
});

// Define associations
Reward.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

export default Reward;
