import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// Determine which database to use based on environment variables
const useSQLite = process.env.DB_DIALECT === "sqlite" || !process.env.DB_NAME;

let sequelize;

if (useSQLite) {
  // Use SQLite for easier development
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: process.env.DB_STORAGE || "./database.sqlite",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
  });
} else {
  // Use PostgreSQL for production
  const dbPassword = process.env.DB_PASSWORD || "";
  sequelize = new Sequelize(
    process.env.DB_NAME || "blupension",
    process.env.DB_USER || "root",
    typeof dbPassword === "string" ? dbPassword : "",
    {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      dialect: "postgres",
      logging: process.env.NODE_ENV === "development" ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      retry: {
        max: 3,
        match: [
          /SequelizeConnectionError/,
          /SequelizeConnectionRefusedError/,
          /SequelizeHostNotFoundError/,
          /SequelizeHostNotReachableError/,
          /SequelizeInvalidConnectionError/,
          /SequelizeConnectionTimedOutError/,
        ],
      },
    },
  );
}

// Test the connection (non-blocking for development)
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");
  } catch (err) {
    console.error("❌ Unable to connect to the database:", err.message);
    if (process.env.NODE_ENV === "production") {
    process.exit(1);
    } else {
      console.log("⚠️  Continuing in development mode...");
    }
  }
};

// Don't block startup - test connection asynchronously
testConnection().catch(() => {
  // Connection test failed, but continue in dev mode
});

export default sequelize;
