module.exports = {
  up: async (sequelize) => {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        investment_id INTEGER,
        type VARCHAR(50) NOT NULL,
        amount DECIMAL(20, 8) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        currency VARCHAR(10) NOT NULL DEFAULT 'USD',
        payment_method VARCHAR(50),
        transaction_hash VARCHAR(255),
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (investment_id) REFERENCES investments(id)
      );
    `);
  },

  down: async (sequelize) => {
    await sequelize.query('DROP TABLE IF EXISTS transactions;');
  }
}; 