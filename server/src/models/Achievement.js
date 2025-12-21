import { DataTypes } from "sequelize";
import sequelize from "../db/config.js";
import User from "./User.js";

const Achievement = sequelize.define("Achievement", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'id'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: "id",
    },
    field: 'user_id'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'name'
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'description'
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [["investment", "trading", "community", "security", "engagement"]],
    },
    field: 'category'
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    field: 'level'
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'progress'
  },
  target: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'target'
  },
  reward: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'reward'
  },
  rewardCurrency: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [["USD", "BPT"]],
    },
    field: 'reward_currency'
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "in_progress",
    validate: {
      isIn: [["in_progress", "completed", "claimed"]],
    },
    field: 'status'
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'completed_at'
  },
  claimedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'claimed_at'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'metadata'
  },
}, {
  tableName: 'achievements',
  underscored: true,
});

// Define associations
Achievement.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

export default Achievement;
