const { sequelize, testConnection } = require('./config/database');

async function run() {
  try {
    console.log("Testing SQLite database connection...");
    await testConnection();
    
    // Create a test table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS test_table (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert a test record
    await sequelize.query(`
      INSERT INTO test_table (name) VALUES ('Test Record')
    `);
    
    // Query the test record
    const [results] = await sequelize.query(`
      SELECT * FROM test_table
    `);
    
    console.log("Test records:", results);
    
  } catch (error) {
    console.error("Database error:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log("Database connection closed");
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  try {
    await sequelize.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
});

run().catch(console.error); 