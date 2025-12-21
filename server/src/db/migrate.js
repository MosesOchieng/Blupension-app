/**
 * Imports the configured Sequelize database connection from the config file.
 * This connection is used for database operations across the migration script.
 */
import { Sequelize } from "sequelize";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";
import Portfolio from "../models/Portfolio.js";
import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";
import Reward from "../models/Reward.js";
import Achievement from "../models/Achievement.js";

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use the same database configuration logic as config.js
const useSQLite = process.env.DB_DIALECT === "sqlite" || !process.env.DB_NAME;

let sequelize;

if (useSQLite) {
  // Use SQLite for easier development
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: process.env.DB_STORAGE || "./database.sqlite",
    logging: false,
  });
} else {
  // Use PostgreSQL for production
  const dbPassword = process.env.DB_PASSWORD || "";
  sequelize = new Sequelize(
  process.env.DB_NAME || "blupension_new",
  process.env.DB_USER || "postgres",
    typeof dbPassword === "string" ? dbPassword : "",
  {
    host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
  dialect: "postgres",
  logging: false,
  },
);
}

async function dropSequencesAndTypes() {
  try {
    const isSQLite = sequelize.getDialect() === "sqlite";
    
    if (!isSQLite) {
      // PostgreSQL-specific operations
    // Drop sequences
    await sequelize.query('DROP SEQUENCE IF EXISTS "Users_id_seq" CASCADE;');
    await sequelize.query(
      'DROP SEQUENCE IF EXISTS "Portfolios_id_seq" CASCADE;',
    );
    await sequelize.query(
      'DROP SEQUENCE IF EXISTS "users_id_seq_custom_20240319" CASCADE;',
    );
    await sequelize.query(
      'DROP SEQUENCE IF EXISTS "portfolios_id_seq_custom_20240319" CASCADE;',
    );
    await sequelize.query(
      'DROP SEQUENCE IF EXISTS "accounts_id_seq_custom_20240319" CASCADE;',
    );
    await sequelize.query(
      'DROP SEQUENCE IF EXISTS "transactions_id_seq_custom_20240319" CASCADE;',
    );
    await sequelize.query(
      'DROP SEQUENCE IF EXISTS "achievements_id_seq_custom_20240319" CASCADE;',
    );
    await sequelize.query(
      'DROP SEQUENCE IF EXISTS "rewards_id_seq_custom_20240319" CASCADE;',
    );

    // Drop types
    await sequelize.query('DROP TYPE IF EXISTS "Users" CASCADE;');
    await sequelize.query('DROP TYPE IF EXISTS "Portfolios" CASCADE;');
    await sequelize.query(
      'DROP TYPE IF EXISTS "enum_Users_investmentPlan" CASCADE;',
    );
    await sequelize.query('DROP TYPE IF EXISTS "enum_Users_status" CASCADE;');
    await sequelize.query(
      'DROP TYPE IF EXISTS "enum_Portfolios_strategy" CASCADE;',
    );
    await sequelize.query(
      'DROP TYPE IF EXISTS "enum_Portfolios_status" CASCADE;',
    );
    await sequelize.query('DROP TYPE IF EXISTS "enum_accounts_type" CASCADE;');
    await sequelize.query(
      'DROP TYPE IF EXISTS "enum_accounts_currency" CASCADE;',
    );
    await sequelize.query(
      'DROP TYPE IF EXISTS "enum_transactions_type" CASCADE;',
    );
    await sequelize.query(
      'DROP TYPE IF EXISTS "enum_transactions_currency" CASCADE;',
    );
    await sequelize.query(
      'DROP TYPE IF EXISTS "enum_transactions_status" CASCADE;',
    );
    await sequelize.query(
      'DROP TYPE IF EXISTS "enum_achievements_category" CASCADE;',
    );
    await sequelize.query(
      'DROP TYPE IF EXISTS "enum_achievements_reward_currency" CASCADE;',
    );
    await sequelize.query(
      'DROP TYPE IF EXISTS "enum_achievements_status" CASCADE;',
    );
    await sequelize.query('DROP TYPE IF EXISTS "enum_rewards_type" CASCADE;');
    await sequelize.query(
      'DROP TYPE IF EXISTS "enum_rewards_currency" CASCADE;',
    );
    await sequelize.query('DROP TYPE IF EXISTS "enum_rewards_status" CASCADE;');
    }

    // Drop tables if they exist (works for both SQLite and PostgreSQL)
    const cascade = isSQLite ? "" : " CASCADE";
    await sequelize.query(`DROP TABLE IF EXISTS "rewards"${cascade};`);
    await sequelize.query(`DROP TABLE IF EXISTS "achievements"${cascade};`);
    await sequelize.query(`DROP TABLE IF EXISTS "transactions"${cascade};`);
    await sequelize.query(`DROP TABLE IF EXISTS "accounts"${cascade};`);
    await sequelize.query(`DROP TABLE IF EXISTS "Portfolios"${cascade};`);
    await sequelize.query(`DROP TABLE IF EXISTS "Users"${cascade};`);

    console.log("Tables dropped successfully");
  } catch (error) {
    console.error("Error dropping tables:", error.message);
    // Continue anyway - tables might not exist
  }
}

async function runMigrations() {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    // Drop sequences, types, and tables first
    await dropSequencesAndTypes();

    // Run migrations
    const migrations = [
      "20240319000000-create-users.js",
      "20240319000001-create-portfolios.js",
      "20240319000002-create-accounts.js",
      "20240319000003-create-transactions.js",
      "20240319000004-create-achievements.js",
      "20240319000005-create-rewards.js",
      "20240319000006-add-verification-fields.js",
    ];

    for (const migration of migrations) {
      const { up } = await import(`./migrations/${migration}`);
      await up(sequelize.getQueryInterface(), Sequelize);
      console.log(`Migration ${migration} completed successfully`);
    }

    console.log("All migrations completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Only run migration if this file is run directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  runMigrations();
}

export default runMigrations;
