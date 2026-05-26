require('dotenv').config();
const { sequelize } = require('./db');
require('../models'); // load all models so associations register

const sync = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('All tables synced successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Sync failed:', err.message);
    process.exit(1);
  }
};

sync();
