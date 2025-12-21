import { DataTypes } from "sequelize";
import sequelize from "../db/config.js";
import User from "./User.js";

const Portfolio = sequelize.define(
  "Portfolio",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: "id",
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      field: "user_id",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "name",
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "description",
    },
    strategy: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [["conservative", "moderate", "aggressive"]],
      },
      field: "strategy",
    },
    totalValue: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: "total_value",
    },
    allocation: {
      type: DataTypes.JSON,
      defaultValue: {},
      field: "allocation",
    },
    performance: {
      type: DataTypes.JSON,
      defaultValue: {
        daily: 0,
        weekly: 0,
        monthly: 0,
        yearly: 0,
      },
      field: "performance",
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "active",
      validate: {
        isIn: [["active", "inactive", "closed"]],
      },
      field: "status",
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      field: "metadata",
    },
  },
  {
    tableName: "portfolios",
    underscored: true,
  },
);

// Define associations
Portfolio.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

export default Portfolio;
