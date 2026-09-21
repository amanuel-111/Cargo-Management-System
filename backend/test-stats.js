const axios = require('axios');
const { User, Payment } = require('./models');
const { fn, col } = require('sequelize');

async function test() {
  try {
    const admin = await User.findOne({ where: { role: 'admin' } });
    if (!admin) return console.log('No admin found');
    const token = admin.getSignedJwtToken();
    
    // 1. Get stats endpoint
    const statsRes = await axios.get('http://localhost:5000/api/payments/stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Endpoint Stats:', statsRes.data);

    // 2. Direct database counts
    const dbStats = await Payment.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true,
    });
    console.log('DB Raw Stats:', dbStats);

    // 3. Count using findAndCountAll
    const { count: pendingCount } = await Payment.findAndCountAll({ where: { status: 'pending' } });
    const { count: approvedCount } = await Payment.findAndCountAll({ where: { status: 'approved' } });
    const { count: rejectedCount } = await Payment.findAndCountAll({ where: { status: 'rejected' } });
    console.log('DB findAndCountAll:', { pending: pendingCount, approved: approvedCount, rejected: rejectedCount });

  } catch (err) {
    console.error('API Error:', err.response ? err.response.data : err.message);
  }
  process.exit();
}

test();
