module.exports = {
  up: async (sequelize) => {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS investments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        plan_id INTEGER NOT NULL,
        amount DECIMAL(20, 8) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        start_date DATETIME,
        end_date DATETIME,
        expected_return DECIMAL(20, 8),
        actual_return DECIMAL(20, 8),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (plan_id) REFERENCES investment_plans(id)
      );
    `);
  },

  down: async (sequelize) => {
    await sequelize.query('DROP TABLE IF EXISTS investments;');
  }
}; 