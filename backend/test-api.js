const axios = require('axios');
const { User } = require('./models');

async function test() {
  try {
    const admin = await User.findOne({ where: { role: 'admin' } });
    if (!admin) return console.log('No admin found');
    
    const token = admin.getSignedJwtToken();
    
    const driversRes = await axios.get('http://localhost:5000/api/tracking/active-drivers', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Active drivers:', driversRes.data.data.length);
  } catch (err) {
    console.error('API Error:', err.response ? err.response.data : err.message);
  }
  process.exit();
}

test();
