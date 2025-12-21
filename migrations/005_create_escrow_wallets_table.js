module.exports = {
  up: async (sequelize) => {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS escrow_wallets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        address VARCHAR(255) NOT NULL,
        balance DECIMAL(20, 8) DEFAULT 0,
        currency VARCHAR(10) NOT NULL DEFAULT 'USD',
        is_active BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);
  },

  down: async (sequelize) => {
    await sequelize.query('DROP TABLE IF EXISTS escrow_wallets;');
  }
}; 