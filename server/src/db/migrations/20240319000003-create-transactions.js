export async function up(queryInterface, Sequelize) {
  const isSQLite = queryInterface.sequelize.getDialect() === "sqlite";
  // Create sequence first
  if (!isSQLite) {
    await queryInterface.sequelize.query(
      'CREATE SEQUENCE IF NOT EXISTS "transactions_id_seq_custom_20240319";',
    );
  }

  // Create enum types (PostgreSQL only)
  if (!isSQLite) {
  await queryInterface.sequelize.query(
    "CREATE TYPE \"enum_transactions_type\" AS ENUM ('deposit', 'withdraw', 'transfer', 'reward', 'stake', 'unstake');",
  );
  await queryInterface.sequelize.query(
    "CREATE TYPE \"enum_transactions_currency\" AS ENUM ('USD', 'BPT');",
  );
  await queryInterface.sequelize.query(
    "CREATE TYPE \"enum_transactions_status\" AS ENUM ('pending', 'completed', 'failed', 'cancelled');",
  );
  }

  // Create table with sequence
  await queryInterface.createTable("transactions", {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.INTEGER,
      autoIncrement: isSQLite,
      defaultValue: isSQLite 
        ? undefined 
        : Sequelize.literal("nextval('\"transactions_id_seq_custom_20240319\"')"),
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "NO ACTION",
    },
    accountId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "accounts",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "NO ACTION",
    },
    type: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "deposit",
      validate: {
        isIn: [
          ["deposit", "withdraw", "transfer", "reward", "stake", "unstake"],
        ],
      },
    },
    amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "USD",
      validate: {
        isIn: [["USD", "BPT"]],
      },
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "pending",
      validate: {
        isIn: [["pending", "completed", "failed", "cancelled"]],
      },
    },
    txHash: {
      type: Sequelize.STRING,
    },
    description: {
      type: Sequelize.STRING,
    },
    metadata: {
      type: Sequelize.JSON,
    },
    completedAt: {
      type: Sequelize.DATE,
    },
    fromAccountId: {
      type: Sequelize.INTEGER,
      references: {
        model: "accounts",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    toAccountId: {
      type: Sequelize.INTEGER,
      references: {
        model: "accounts",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("transactions");
  await queryInterface.sequelize.query(
    'DROP TYPE IF EXISTS "enum_transactions_type";',
  );
  await queryInterface.sequelize.query(
    'DROP TYPE IF EXISTS "enum_transactions_currency";',
  );
  await queryInterface.sequelize.query(
    'DROP TYPE IF EXISTS "enum_transactions_status";',
  );
  await queryInterface.sequelize.query(
    'DROP SEQUENCE IF EXISTS "transactions_id_seq_custom_20240319";',
  );
}
