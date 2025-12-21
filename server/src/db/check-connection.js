import sequelize from './config.js';

async function checkConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful!');
    
    // Test query
    const result = await sequelize.query('SELECT version();');
    console.log('PostgreSQL version:', result[0][0].version);
    
    process.exit(0);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

checkConnection(); 