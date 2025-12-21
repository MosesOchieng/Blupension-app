import { DataTypes } from "sequelize";
import sequelize from "../db/config.js";
import User from "./User.js";
import Account from "./Account.js";

const Transaction = sequelize.define(
  "Transaction",
  {
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
    type: {
      type: DataTypes.ENUM(
        "deposit",
        "withdraw",
        "transfer",
        "reward",
        "stake",
        "unstake"
      ),
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
      type: DataTypes.ENUM("pending", "completed", "failed", "cancelled"),
      defaultValue: "pending",
      allowNull: false,
    },
    txHash: {
      type: DataTypes.STRING,
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
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fromAccountId: {
      type: DataTypes.UUID,
      references: {
        model: Account,
        key: "id",
      },
      allowNull: true,
    },
    toAccountId: {
      type: DataTypes.UUID,
      references: {
        model: Account,
        key: "id",
      },
      allowNull: true,
    },
  },
  {
    timestamps: true,
    underscored: true,
  }
);

// Define associations
Transaction.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Transaction.belongsTo(Account, {
  foreignKey: "fromAccountId",
  as: "fromAccount",
});

Transaction.belongsTo(Account, {
  foreignKey: "toAccountId",
  as: "toAccount",
});

export default Transaction;
