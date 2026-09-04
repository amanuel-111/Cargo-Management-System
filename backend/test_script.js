const axios = require('axios');

async function test() {
  try {
    const ts = Date.now();
    // Register
    const regRes = await axios.post('http://localhost:5000/api/auth/register', {
      firstName: 'Test',
      lastName: 'User',
      email: `test${ts}@example.com`,
      password: 'Password123',
      phone: `0911${String(ts).slice(-6)}`
    });
    const token = regRes.data.token;
    console.log('Got token:', token.substring(0, 10) + '...');

    // Create shipment
    const createRes = await axios.post('http://localhost:5000/api/shipments', {
      pickup: { city: 'A', address: 'A1' },
      destination: { city: 'B', address: 'B1' },
      cargo: { description: 'test', weight: 10 }
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const shipmentId = createRes.data.data.id;
    console.log('Created shipment:', shipmentId);

    // Get specific shipment
    const singleRes = await axios.get(`http://localhost:5000/api/shipments/${shipmentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Shipment fetched successfully:', singleRes.data.success);
    
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

test();
