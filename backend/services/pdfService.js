const PDFDocument = require('pdfkit');

/**
 * Generate a PDF invoice for a shipment and stream it to response.
 * @param {Object} shipment - Shipment object with relations
 * @param {Stream} res - Express response object
 */
exports.generateShipmentInvoice = (shipment, res) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  // Header / Branding
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Invoice-${shipment.trackingNumber}.pdf`);
  doc.pipe(res);

  // Colors
  const primaryColor = '#f97316';
  const textColor = '#1e293b';
  const grayColor = '#64748b';

  // Title & Brand Banner
  doc.fillColor(primaryColor).fontSize(24).font('Helvetica-Bold').text('SMART TRANSPORT', 50, 45);
  doc.fillColor(grayColor).fontSize(10).font('Helvetica').text('Cargo & Fleet Management System — Ethiopia', 50, 72);

  // Invoice Title
  doc.fillColor(textColor).fontSize(16).font('Helvetica-Bold').text('SHIPMENT INVOICE', 400, 45, { align: 'right' });
  doc.fillColor(grayColor).fontSize(10).font('Helvetica').text(`Tracking #: ${shipment.trackingNumber}`, 400, 65, { align: 'right' });
  doc.text(`Date: ${new Date(shipment.createdAt).toLocaleDateString()}`, 400, 80, { align: 'right' });

  doc.moveTo(50, 105).lineTo(545, 105).strokeColor('#e2e8f0').lineWidth(1).stroke();

  // Customer & Shipment Info Boxes
  let y = 120;
  doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('Customer Details', 50, y);
  doc.fillColor(textColor).fontSize(10).font('Helvetica');
  doc.text(`Name: ${shipment.customer?.firstName || ''} ${shipment.customer?.lastName || ''}`, 50, y + 18);
  doc.text(`Email: ${shipment.customer?.email || 'N/A'}`, 50, y + 32);
  doc.text(`Phone: ${shipment.customer?.phone || 'N/A'}`, 50, y + 46);

  doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('Route Info', 320, y);
  doc.fillColor(textColor).fontSize(10).font('Helvetica');
  doc.text(`Pickup: ${shipment.pickupCity || ''} (${shipment.pickupAddress || ''})`, 320, y + 18);
  doc.text(`Destination: ${shipment.destCity || ''} (${shipment.destAddress || ''})`, 320, y + 32);
  doc.text(`Cargo: ${shipment.cargoDescription || ''} (${shipment.cargoWeight || 0} kg)`, 320, y + 46);

  y += 80;
  doc.moveTo(50, y).lineTo(545, y).strokeColor('#e2e8f0').lineWidth(1).stroke();

  // Cost Breakdown Table
  y += 20;
  doc.fillColor(textColor).fontSize(12).font('Helvetica-Bold').text('Pricing Breakdown', 50, y);

  y += 25;
  // Table Header
  doc.rect(50, y, 495, 24).fill('#f8fafc');
  doc.fillColor(textColor).fontSize(10).font('Helvetica-Bold');
  doc.text('Description', 60, y + 7);
  doc.text('Rate / Details', 250, y + 7);
  doc.text('Amount (ETB)', 440, y + 7, { align: 'right' });

  // Rows
  y += 30;
  doc.font('Helvetica').fontSize(10).fillColor(textColor);

  // Distance row
  doc.text('Distance Charge', 60, y);
  doc.text(`${shipment.estimatedDistance || 0} km @ 25 ETB/km`, 250, y);
  doc.text(`${(shipment.distancePrice || 0).toFixed(2)} ETB`, 440, y, { align: 'right' });

  y += 20;
  // Weight row
  doc.text(`Weight Charge (${shipment.priority || 'normal'})`, 60, y);
  doc.text(`${shipment.cargoWeight || 0} kg`, 250, y);
  doc.text(`${(shipment.weightPrice || 0).toFixed(2)} ETB`, 440, y, { align: 'right' });

  y += 25;
  doc.moveTo(50, y).lineTo(545, y).strokeColor('#cbd5e1').lineWidth(1).stroke();

  // Total
  y += 15;
  doc.font('Helvetica-Bold').fontSize(12).fillColor(textColor);
  doc.text('Total Amount:', 250, y);
  doc.fillColor(primaryColor).text(`${(shipment.totalPrice || 0).toFixed(2)} ETB`, 440, y, { align: 'right' });

  // Payment Status Stamp
  y += 50;
  const isPaid = shipment.isPaid;
  const stampText = isPaid ? 'PAID & CONFIRMED' : 'PAYMENT PENDING';
  const stampColor = isPaid ? '#16a34a' : '#ea580c';

  doc.rect(50, y, 220, 45).lineWidth(2).strokeColor(stampColor).stroke();
  doc.fillColor(stampColor).fontSize(14).font('Helvetica-Bold').text(stampText, 60, y + 14);

  // Footer Note
  doc.fillColor(grayColor).fontSize(9).font('Helvetica').text(
    'Thank you for using Smart Transport Cargo Management System. Contact support@smarttransport.et for assistance.',
    50, 720, { align: 'center', width: 495 }
  );

  doc.end();
};
