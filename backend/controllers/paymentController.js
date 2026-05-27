const { Payment, Shipment, User } = require('../models');
const notificationService = require('../services/notificationService');
const { upload } = require('../config/cloudinary');

// POST /api/payments  — customer submits payment proof
exports.submitPayment = async (req, res, next) => {
  try {
    const { shipmentId, method, transactionId, note } = req.body;
    const customerId = req.user.id;

    // Validate shipment belongs to this customer
    const shipment = await Shipment.findByPk(shipmentId);
    if (!shipment)
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    if (shipment.customerId !== customerId)
      return res.status(403).json({ success: false, message: 'Not authorized' });
    if (shipment.isPaid)
      return res.status(400).json({ success: false, message: 'Shipment is already paid' });

    // Prevent duplicate pending payments
    const existing = await Payment.findOne({ where: { shipmentId, status: 'pending' } });
    if (existing)
      return res.status(400).json({ success: false, message: 'A payment is already pending review for this shipment' });

    const screenshotUrl = req.file?.path || null;

    const payment = await Payment.create({
      shipmentId,
      customerId,
      amount:        shipment.totalPrice,
      method,
      transactionId: transactionId || null,
      screenshotUrl,
      note:          note || null,
      status:        'pending',
    });

    // Notify fleet managers & admins
    const reviewers = await User.findAll({
      where: { role: ['fleet_manager', 'admin'], isActive: true },
    });
    for (const r of reviewers) {
      await notificationService.createNotification({
        recipientId: r.id,
        type:        'payment_received',
        title:       'New Payment Submitted',
        message:     `Payment submitted for shipment #${shipment.trackingNumber} — ETB ${shipment.totalPrice}`,
        shipmentId:  shipment.id,
      });
    }

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

// GET /api/payments  — list payments (admin/fleet_manager sees all; customer sees own)
exports.getPayments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};

    if (req.user.role === 'customer') where.customerId = req.user.id;
    if (status) where.status = status;

    const offset = (Number(page) - 1) * Number(limit);
    const { count, rows } = await Payment.findAndCountAll({
      where,
      include: [
        {
          model: Shipment,
          attributes: ['id', 'trackingNumber', 'pickupCity', 'destCity', 'totalPrice'],
        },
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
        },
        {
          model: User,
          as: 'reviewedBy',
          attributes: ['id', 'firstName', 'lastName'],
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
      limit:  Number(limit),
      offset,
      distinct: true,
    });

    res.json({
      success: true,
      count:   rows.length,
      total:   count,
      pages:   Math.ceil(count / Number(limit)),
      currentPage: Number(page),
      data:    rows,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/payments/:id
exports.getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findByPk(req.params.id, {
      include: [
        { model: Shipment, attributes: ['id', 'trackingNumber', 'pickupCity', 'destCity', 'totalPrice', 'status'] },
        { model: User, as: 'customer', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] },
        { model: User, as: 'reviewedBy', attributes: ['id', 'firstName', 'lastName'], required: false },
      ],
    });
    if (!payment)
      return res.status(404).json({ success: false, message: 'Payment not found' });

    // Customers can only see their own
    if (req.user.role === 'customer' && payment.customerId !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized' });

    res.json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

// PUT /api/payments/:id/approve  — fleet_manager or admin approves
exports.approvePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment)
      return res.status(404).json({ success: false, message: 'Payment not found' });
    if (payment.status !== 'pending')
      return res.status(400).json({ success: false, message: `Payment is already ${payment.status}` });

    await payment.update({
      status:       'approved',
      reviewedById: req.user.id,
      reviewedAt:   new Date(),
    });

    // Mark shipment as paid and move to confirmed
    const shipment = await Shipment.findByPk(payment.shipmentId);
    if (shipment) {
      await shipment.update({
        isPaid:        true,
        paymentMethod: payment.method,
        paymentDate:   new Date(),
        status:        'confirmed',
      });

      // Notify customer
      await notificationService.createNotification({
        recipientId: payment.customerId,
        type:        'payment_received',
        title:       'Payment Approved',
        message:     `Your payment for shipment #${shipment.trackingNumber} has been approved. Your shipment is now confirmed.`,
        shipmentId:  shipment.id,
      });

      if (req.io) {
        req.io.to(`user_${payment.customerId}`).emit('paymentApproved', {
          paymentId:  payment.id,
          shipmentId: shipment.id,
          trackingNumber: shipment.trackingNumber,
        });
      }
    }

    res.json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

// PUT /api/payments/:id/reject  — fleet_manager or admin rejects
exports.rejectPayment = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const payment = await Payment.findByPk(req.params.id);
    if (!payment)
      return res.status(404).json({ success: false, message: 'Payment not found' });
    if (payment.status !== 'pending')
      return res.status(400).json({ success: false, message: `Payment is already ${payment.status}` });

    await payment.update({
      status:          'rejected',
      reviewedById:    req.user.id,
      reviewedAt:      new Date(),
      rejectionReason: reason || 'Payment could not be verified',
    });

    const shipment = await Shipment.findByPk(payment.shipmentId);
    if (shipment) {
      await notificationService.createNotification({
        recipientId: payment.customerId,
        type:        'system',
        title:       'Payment Rejected',
        message:     `Your payment for shipment #${shipment.trackingNumber} was rejected. Reason: ${reason || 'Could not be verified'}. Please resubmit.`,
        shipmentId:  shipment.id,
      });
    }

    res.json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};
