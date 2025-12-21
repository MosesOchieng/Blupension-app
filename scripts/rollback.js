const fs = require('fs');
const path = require('path');
const { query } = require('../config/database');

async function getLastExecutedMigration() {
  try {
    const result = await query(
      'SELECT name FROM migrations ORDER BY executed_at DESC LIMIT 1'
    );
    return result.rows[0]?.name;
  } catch (error) {
    console.error('Error getting last executed migration:', error);
    throw error;
  }
}

async function rollbackMigration(migrationName) {
  try {
    const migration = require(path.join(__dirname, '..', 'migrations', migrationName));
    await migration.down();
    await query('DELETE FROM migrations WHERE name = $1', [migrationName]);
    console.log(`Rolled back migration: ${migrationName}`);
  } catch (error) {
    console.error(`Error rolling back migration ${migrationName}:`, error);
    throw error;
  }
}

async function rollbackMigrations() {
  try {
    const lastMigration = await getLastExecutedMigration();
    if (!lastMigration) {
      console.log('No migrations to roll back');
      return;
    }

    await rollbackMigration(lastMigration);
    console.log('Rollback completed successfully');
  } catch (error) {
    console.error('Rollback failed:', error);
    process.exit(1);
  }
}

rollbackMigrations(); 