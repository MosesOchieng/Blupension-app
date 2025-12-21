const { sequelize } = require("../models");

async function runMigrations() {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    // Sync all models with the database
    await sequelize.sync({ force: true });
    console.log("Database tables synchronized successfully.");

    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigrations();
