import { DataTypes } from "sequelize";
import sequelize from "../db/config.js";
import User from "./User.js";

const Portfolio = sequelize.define("Portfolio", {
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
  strategy: {
    type: DataTypes.ENUM("conservative", "moderate", "aggressive"),
    allowNull: false,
  },
  totalValue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  allocation: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  performance: {
    type: DataTypes.JSON,
    defaultValue: {
      daily: 0,
      weekly: 0,
      monthly: 0,
      yearly: 0,
    },
  },
  status: {
    type: DataTypes.ENUM("active", "inactive", "closed"),
    defaultValue: "active",
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
});

// Define associations
Portfolio.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

export default Portfolio;
