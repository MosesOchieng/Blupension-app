const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const db = new sqlite3.Database("database.sqlite");

// Read and execute migrations in order
const migrationFiles = [
  "001_create_users_table.js",
  "002_create_temp_users_table.js",
  "003_create_verification_codes_table.js",
  "004_create_password_reset_tokens_table.js",
  "005_create_wallets_table.js",
  "006_create_verification_tables.js",
];

async function runMigrations() {
  for (const file of migrationFiles) {
    console.log(`Running migration: ${file}`);
    const migration = require(`./${file}`);
    await migration.up(db);
  }
  console.log("All migrations completed successfully");
  db.close();
}

runMigrations().catch(console.error);
