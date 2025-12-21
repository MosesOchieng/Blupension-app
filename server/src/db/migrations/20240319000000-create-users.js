export async function up(queryInterface, Sequelize) {
  const isSQLite = queryInterface.sequelize.getDialect() === "sqlite";
  
  // Create sequence first (PostgreSQL only)
  if (!isSQLite) {
    await queryInterface.sequelize.query(
      '// CREATE SEQUENCE IF NOT EXISTS (PostgreSQL only) "users_id_seq_custom_20240319";',
    );
  }

  // Create table with sequence (PostgreSQL) or AUTOINCREMENT (SQLite)
  await queryInterface.createTable("users", {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.INTEGER,
      autoIncrement: isSQLite,
      defaultValue: isSQLite 
        ? undefined 
        : Sequelize.literal("// nextval (PostgreSQL only)('\"users_id_seq_custom_20240319\"')"),
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    first_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    last_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    linkedin_id: {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    },
    wallet_address: {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    },
    phone: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    address: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    retirement_age: {
      type: Sequelize.INTEGER,
      defaultValue: 65,
    },
    monthly_contribution: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
    },
    investment_plan: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "moderate",
      validate: {
        isIn: [["conservative", "moderate", "aggressive"]],
      },
    },
    is_verified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    two_factor_auth: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    notifications: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
    last_login: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    username: {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    },
    avatar: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    balance: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
    },
    bpt_balance: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "active",
      validate: {
        isIn: [["active", "inactive", "suspended"]],
      },
    },
    is_linkedin_user: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("users");
  await queryInterface.sequelize.query(
    'DROP SEQUENCE IF EXISTS "users_id_seq_custom_20240319";',
  );
}
