import { DataTypes } from "sequelize";
import sequelize from "../db/config.js";
import User from "./User.js";
import Account from "./Account.js";

const Transaction = sequelize.define(
  "Transaction",
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
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [
          ["deposit", "withdraw", "transfer", "reward", "stake", "unstake"],
        ],
      },
      field: "type",
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "amount",
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [["USD", "BPT"]],
      },
      field: "currency",
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "pending",
      allowNull: false,
      validate: {
        isIn: [["pending", "completed", "failed", "cancelled"]],
      },
      field: "status",
    },
    txHash: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "tx_hash",
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "description",
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      field: "metadata",
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "completed_at",
    },
    fromAccountId: {
      type: DataTypes.INTEGER,
      references: {
        model: "accounts",
        key: "id",
      },
      allowNull: true,
      field: "from_account_id",
    },
    toAccountId: {
      type: DataTypes.INTEGER,
      references: {
        model: "accounts",
        key: "id",
      },
      allowNull: true,
      field: "to_account_id",
    },
  },
  {
    tableName: "transactions",
    underscored: true,
  },
);

// Define associations
Transaction.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

Transaction.belongsTo(Account, {
  foreignKey: "from_account_id",
  as: "fromAccount",
});

Transaction.belongsTo(Account, {
  foreignKey: "to_account_id",
  as: "toAccount",
});

export default Transaction;
