module.exports = {
  up: async (sequelize) => {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS investment_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        min_amount DECIMAL(20, 8) NOT NULL,
        max_amount DECIMAL(20, 8) NOT NULL,
        interest_rate DECIMAL(5, 2) NOT NULL,
        duration_days INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  },

  down: async (sequelize) => {
    await sequelize.query('DROP TABLE IF EXISTS investment_plans;');
  }
}; 