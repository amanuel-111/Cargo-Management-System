const { sequelize, connectDB } = require('./db');
require('../models'); // Register all models + associations

const runMigrations = async () => {
  try {
    console.log('🔄 Starting Database Schema Migration...');
    await connectDB();

    // Sync database models safely without dropping existing columns/tables
    await sequelize.sync({ alter: { drop: false }, logging: console.log });

    console.log('✅ Database Schema Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
};

runMigrations();
