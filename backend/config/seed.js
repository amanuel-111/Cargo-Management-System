/**
 * Seed script — creates demo users for all roles.
 * Run once:  node config/seed.js
 */
require('dotenv').config();
const { sequelize } = require('./db');
require('../models'); // register associations
const { User } = require('../models');

const users = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@smarttransport.et',
    phone: '+251911000001',
    password: 'admin123',
    role: 'admin',
    isEmailVerified: true,
    isActive: true,
  },
  {
    firstName: 'Fleet',
    lastName: 'Manager',
    email: 'fleet@smarttransport.et',
    phone: '+251911000002',
    password: 'fleet123',
    role: 'fleet_manager',
    isEmailVerified: true,
    isActive: true,
  },
  {
    firstName: 'Test',
    lastName: 'Driver',
    email: 'driver@test.et',
    phone: '+251911000003',
    password: 'test123',
    role: 'driver',
    isEmailVerified: true,
    isActive: true,
    licenseNumber: 'DL-123456',
  },
  {
    firstName: 'Test',
    lastName: 'Customer',
    email: 'customer@test.et',
    phone: '+251911000004',
    password: 'test123',
    role: 'customer',
    isEmailVerified: true,
    isActive: true,
  },
];

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL');

    await sequelize.sync({ logging: false });

    let created = 0;
    let skipped = 0;

    for (const u of users) {
      const exists = await User.findOne({ where: { email: u.email } });
      if (exists) {
        console.log(`  ⏭  Skipped  ${u.role.padEnd(14)} ${u.email} (already exists)`);
        skipped++;
      } else {
        await User.create(u); // beforeSave hook hashes the password
        console.log(`  ✅ Created  ${u.role.padEnd(14)} ${u.email}`);
        created++;
      }
    }

    console.log(`\nDone — ${created} created, ${skipped} skipped.\n`);
    console.log('Demo credentials:');
    console.log('  Admin        admin@smarttransport.et  / admin123');
    console.log('  Fleet Mgr    fleet@smarttransport.et  / fleet123');
    console.log('  Driver       driver@test.et           / test123');
    console.log('  Customer     customer@test.et         / test123');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
