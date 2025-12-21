import Transaction from "../models/transaction.js";
import Account from "../models/account.js";

// Transaction associations
Transaction.belongsTo(Account, {
  foreignKey: "fromAccountId",
  as: "fromAccount",
});

Transaction.belongsTo(Account, {
  foreignKey: "toAccountId",
  as: "toAccount",
});

// Account associations
Account.hasMany(Transaction, {
  foreignKey: "fromAccountId",
  as: "outgoingTransactions",
});

Account.hasMany(Transaction, {
  foreignKey: "toAccountId",
  as: "incomingTransactions",
});
