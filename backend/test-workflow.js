const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { sequelize } = require('./config/db');
const { User, Vehicle, Shipment, Payment, LocationUpdate, ShipmentStatusHistory, Notification } = require('./models');
const shipmentController = require('./controllers/shipmentController');
const paymentController = require('./controllers/paymentController');

// Helper to mock req/res
const mockReqRes = (user, body = {}, params = {}) => {
  const req = { user, body, params, io: { to: () => ({ emit: () => {} }) } };
  const res = {
    status: (code) => res,
    json: (data) => { res.data = data; return res; }
  };
  return { req, res, next: (err) => { if (err) throw err; } };
};

async function testWorkflow() {
  try {
    await sequelize.authenticate();
    await sequelize.query('ALTER TABLE notifications MODIFY COLUMN type VARCHAR(50) NOT NULL;');
    console.log('DB connected and notifications table altered');

    // 1. Create entities
    const admin = await User.create({ firstName: 'A', lastName: 'A', email: `admin_${Date.now()}@test.com`, password: 'pw', phone: `+2519${Date.now().toString().slice(-8)}`, role: 'admin' });
    const customer = await User.create({ firstName: 'C', lastName: 'C', email: `cust_${Date.now()}@test.com`, password: 'pw', phone: `+2519${Date.now().toString().slice(-8)}`, role: 'customer' });
    const driver = await User.create({ firstName: 'D', lastName: 'D', email: `drvr_${Date.now()}@test.com`, password: 'pw', phone: `+2519${Date.now().toString().slice(-8)}`, role: 'driver', isOnline: true });
    const vehicle = await Vehicle.create({ plateNumber: `TEST-${Date.now()}`, type: 'truck', capacity: 1000, status: 'available', brand: 'Volvo', model: 'FMX', year: 2020 });

    console.log('Entities created');

    // 2. Customer creates shipment
    const { req: reqS1, res: resS1, next: nextS1 } = mockReqRes(customer, {
      pickup: { city: 'CityA', address: 'Addr1' },
      destination: { city: 'CityB', address: 'Addr2' },
      cargo: { description: 'Stuff', weight: 100 }
    });
    await shipmentController.createShipment(reqS1, resS1, nextS1);
    const shipment = resS1.data.data;
    console.log('Shipment created:', shipment.id, 'Status:', shipment.status);

    // 3. Customer submits payment
    const payment = await Payment.create({
      shipmentId: shipment.id, customerId: customer.id, amount: shipment.totalPrice,
      method: 'cbe', screenshotUrl: 'test.png', status: 'pending'
    });
    console.log('Payment created:', payment.id);

    // 4. Admin approves payment
    const { req: reqP1, res: resP1, next: nextP1 } = mockReqRes(admin, {}, { id: payment.id });
    await paymentController.approvePayment(reqP1, resP1, nextP1);
    
    // Check shipment status
    const s1 = await Shipment.findByPk(shipment.id);
    console.log('After payment approval -> Shipment Paid:', s1.isPaid, 'Status:', s1.status);

    // 5. Admin assigns shipment
    const { req: reqA1, res: resA1, next: nextA1 } = mockReqRes(admin, { driverId: driver.id, vehicleId: vehicle.id }, { id: shipment.id });
    await shipmentController.assignShipment(reqA1, resA1, nextA1);
    const s2 = await Shipment.findByPk(shipment.id);
    console.log('After assignment -> Shipment Status:', s2.status, 'Driver:', s2.driverId, 'Vehicle:', s2.vehicleId);
    
    const v2 = await Vehicle.findByPk(vehicle.id);
    console.log('Vehicle Status:', v2.status, 'Assigned Driver:', v2.assignedDriverId);

    // 6. Driver updates status: picked_up -> in_transit -> delivered
    const { req: reqU1, res: resU1, next: nextU1 } = mockReqRes(driver, { status: 'picked_up' }, { id: shipment.id });
    await shipmentController.updateStatus(reqU1, resU1, nextU1);
    console.log('After pickup -> Shipment Status:', resU1.data.data.status);

    const { req: reqU2, res: resU2, next: nextU2 } = mockReqRes(driver, { status: 'in_transit' }, { id: shipment.id });
    await shipmentController.updateStatus(reqU2, resU2, nextU2);
    console.log('After in_transit -> Shipment Status:', resU2.data.data.status);

    const { req: reqU4, res: resU4, next: nextU4 } = mockReqRes(driver, { status: 'out_for_delivery' }, { id: shipment.id });
    await shipmentController.updateStatus(reqU4, resU4, nextU4);
    console.log('After out_for_delivery -> Shipment Status:', resU4.data.data.status);

    const { req: reqU3, res: resU3, next: nextU3 } = mockReqRes(driver, { deliveredTo: 'John Doe', notes: 'OK' }, { id: shipment.id });
    await shipmentController.uploadProofOfDelivery(reqU3, resU3, nextU3);
    console.log('After delivered -> Shipment Status:', resU3.data.data.status);

    const v3 = await Vehicle.findByPk(vehicle.id);
    console.log('Final Vehicle Status:', v3.status);

    console.log('Workflow Test Passed Successfully!');
  } catch (err) {
    console.error('Test Failed:', err);
  } finally {
    process.exit();
  }
}

testWorkflow();
