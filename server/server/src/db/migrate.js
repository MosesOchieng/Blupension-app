/**
 * Imports the configured Sequelize database connection from the config file.
 * This connection is used for database operations across the migration script.
 */
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";
import Portfolio from "../models/Portfolio.js";
import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";
import Reward from "../models/Reward.js";
import Achievement from "../models/Achievement.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sequelize = new Sequelize({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dialect: "postgres",
  logging: false,
});

const runMigrations = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    // Run migrations in sequence
    const migrations = [
      "./migrations/20240320000000-add-linkedin-columns.js",
      // Add other migrations here in order
    ];

    for (const migration of migrations) {
      const migrationModule = await import(path.join(__dirname, migration));
      await migrationModule.up(sequelize.getQueryInterface(), Sequelize);
      console.log(`Migration ${migration} completed successfully.`);
    }

    console.log("All migrations completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

// Only run migration if this file is run directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  runMigrations();
}

export default runMigrations;