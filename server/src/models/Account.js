import { DataTypes } from "sequelize";
import sequelize from "../db/config.js";
import User from "./User.js";

const Account = sequelize.define(
  "Account",
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
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [["checking", "savings", "investment", "crypto"]],
      },
      field: "type",
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: "balance",
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: "USD",
      validate: {
        isIn: [["USD", "BPT"]],
      },
      field: "currency",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "is_active",
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      field: "metadata",
    },
  },
  {
    tableName: "accounts",
    underscored: true,
  },
);

// Define associations
Account.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

export default Account;
