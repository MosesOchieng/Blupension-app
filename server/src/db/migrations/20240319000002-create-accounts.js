export async function up(queryInterface, Sequelize) {
  const isSQLite = queryInterface.sequelize.getDialect() === "sqlite";
  // Create sequence first
  if (!isSQLite) {
    await queryInterface.sequelize.query(
      'CREATE SEQUENCE IF NOT EXISTS "accounts_id_seq_custom_20240319";',
    );
  }

  // Create enum types (PostgreSQL only)
  if (!isSQLite) {
  await queryInterface.sequelize.query(
    "CREATE TYPE \"enum_accounts_type\" AS ENUM ('checking', 'savings', 'investment', 'crypto');",
  );
  await queryInterface.sequelize.query(
    "CREATE TYPE \"enum_accounts_currency\" AS ENUM ('USD', 'BPT');",
  );
  }

  // Create table with sequence
  await queryInterface.createTable("accounts", {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.INTEGER,
      autoIncrement: isSQLite,
      defaultValue: isSQLite 
        ? undefined 
        : Sequelize.literal("nextval('\"accounts_id_seq_custom_20240319\"')"),
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
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    type: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "checking",
      validate: {
        isIn: [["checking", "savings", "investment", "crypto"]],
      },
    },
    balance: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
    },
    currency: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "USD",
      validate: {
        isIn: [["USD", "BPT"]],
      },
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
    metadata: {
      type: Sequelize.JSON,
      allowNull: true,
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
  await queryInterface.dropTable("accounts");
  await queryInterface.sequelize.query(
    'DROP TYPE IF EXISTS "enum_accounts_type";',
  );
  await queryInterface.sequelize.query(
    'DROP TYPE IF EXISTS "enum_accounts_currency";',
  );
  await queryInterface.sequelize.query(
    'DROP SEQUENCE IF EXISTS "accounts_id_seq_custom_20240319";',
  );
}
