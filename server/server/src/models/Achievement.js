import { DataTypes } from "sequelize";
import sequelize from "../db/config.js";
import User from "./User.js";

const Achievement = sequelize.define("Achievement", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  category: {
    type: DataTypes.ENUM(
      "investment",
      "trading",
      "community",
      "security",
      "engagement",
    ),
    allowNull: false,
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  target: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  reward: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  rewardCurrency: {
    type: DataTypes.ENUM("USD", "BPT"),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("in_progress", "completed", "claimed"),
    defaultValue: "in_progress",
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  claimedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
});

// Define associations
Achievement.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

export default Achievement;
