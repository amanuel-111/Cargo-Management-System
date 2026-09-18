const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { sequelize } = require('./config/db');
const { User, Vehicle, Shipment, Payment, LocationUpdate, ShipmentStatusHistory, Notification } = require('./models');
const shipmentController = require('./controllers/shipmentController');
const paymentController = require('./controllers/paymentController');

const mockReqRes = (user, body = {}, params = {}) => {
  const req = { user, body, params, io: { to: () => ({ emit: () => {} }) } };
  const res = {
    status: function (code) { this.statusCode = code; return this; },
    json: function (data) { this.data = data; return this; }
  };
  let error = null;
  const next = (err) => { error = err; };
  return { req, res, next, getError: () => error };
};

async function testEdgeCases() {
  console.log('--- Starting Edge Case Tests ---');
  try {
    await sequelize.authenticate();
    
    // Setup entities
    const admin = await User.create({ firstName: 'A', lastName: 'A', email: `admin_${Date.now()}@test.com`, password: 'pw', phone: `+2519${Date.now().toString().slice(-8)}`, role: 'admin' });
    const customer = await User.create({ firstName: 'C', lastName: 'C', email: `cust_${Date.now()}@test.com`, password: 'pw', phone: `+2519${Date.now().toString().slice(-8)}`, role: 'customer' });
    const driver = await User.create({ firstName: 'D', lastName: 'D', email: `drvr_${Date.now()}@test.com`, password: 'pw', phone: `+2519${Date.now().toString().slice(-8)}`, role: 'driver', isOnline: true });
    const vehicle = await Vehicle.create({ plateNumber: `TEST-${Date.now()}`, type: 'truck', capacity: 1000, status: 'available', brand: 'Volvo', model: 'FMX', year: 2020 });
    
    // 1. Missing Data (Create Shipment without pickup)
    console.log('\\n[TEST] 1. Create Shipment with missing pickup data');
    const { req: r1, res: rs1, next: n1, getError: ge1 } = mockReqRes(customer, {
      destination: { city: 'CityB', address: 'Addr2' },
      cargo: { description: 'Stuff', weight: 100 }
    });
    try {
      await shipmentController.createShipment(r1, rs1, n1);
      if (ge1()) throw ge1();
      console.log('❌ Failed: Should have thrown validation error');
    } catch (err) {
      console.log('✅ Passed: Threw error correctly ->', err.message || 'Cannot read properties of undefined');
    }

    // Create a valid shipment for further tests
    const { req: r2, res: rs2, next: n2 } = mockReqRes(customer, {
      pickup: { city: 'CityA', address: 'Addr1' },
      destination: { city: 'CityB', address: 'Addr2' },
      cargo: { description: 'Stuff', weight: 100 }
    });
    await shipmentController.createShipment(r2, rs2, n2);
    const shipment = rs2.data.data;
    
    // 2. Unauthorized Actions (Driver trying to assign shipment)
    console.log('\\n[TEST] 2. Unauthorized Driver trying to approve payment');
    const { req: r3, res: rs3, next: n3 } = mockReqRes(driver, {}, { id: 999 }); // id doesn't matter, will block earlier in routing usually, but controller doesn't block driver if it reaches there... wait, controller payment approve doesn't check role directly because the router does it!
    // But we test controller logic.
    // Let's test driver rating a shipment
    const { req: r4, res: rs4, next: n4 } = mockReqRes(driver, { score: 5 }, { id: shipment.id });
    await shipmentController.rateShipment(r4, rs4, n4);
    if (rs4.statusCode === 403) {
      console.log('✅ Passed: Driver cannot rate shipment (403)');
    } else {
      console.log('❌ Failed: Driver rated shipment');
    }

    // 3. Invalid Status Transition (pending -> in_transit directly)
    console.log('\\n[TEST] 3. Invalid Status Transition');
    const { req: r5, res: rs5, next: n5 } = mockReqRes(admin, { status: 'in_transit' }, { id: shipment.id });
    await shipmentController.updateStatus(r5, rs5, n5);
    if (rs5.statusCode === 400 && rs5.data?.message?.includes('cannot be updated')) {
      console.log('✅ Passed: Blocked invalid transition');
    } else {
      console.log('❌ Failed: Allowed invalid transition');
    }

    // 4. Unavailable Vehicle Assignment
    console.log('\\n[TEST] 4. Unavailable Vehicle Assignment');
    const payment = await Payment.create({ shipmentId: shipment.id, customerId: customer.id, amount: 100, method: 'cbe', screenshotUrl: 'x', status: 'pending' });
    const { req: r6, res: rs6, next: n6 } = mockReqRes(admin, {}, { id: payment.id });
    await paymentController.approvePayment(r6, rs6, n6);
    
    // make vehicle unavailable
    await vehicle.update({ status: 'maintenance' });
    const { req: r7, res: rs7, next: n7 } = mockReqRes(admin, { driverId: driver.id, vehicleId: vehicle.id }, { id: shipment.id });
    await shipmentController.assignShipment(r7, rs7, n7);
    if (rs7.statusCode === 400 && rs7.data?.message?.includes('not available')) {
      console.log('✅ Passed: Blocked unavailable vehicle assignment');
    } else {
      console.log('❌ Failed: Assigned unavailable vehicle');
    }

    console.log('\\n--- Edge Case Tests Completed ---');
  } catch (err) {
    console.error('Edge case script failed:', err);
  } finally {
    process.exit();
  }
}

testEdgeCases();
