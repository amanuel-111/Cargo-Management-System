const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  };
  return transporter.sendMail(mailOptions);
};

exports.sendVerificationEmail = async (email, name, verifyUrl) => {
  await sendEmail({
    to: email,
    subject: 'Verify Your Email - Smart Transport',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f97316; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Smart Transport</h1>
        </div>
        <div style="padding: 30px; background: #fff;">
          <h2>Hello ${name},</h2>
          <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
          <a href="${verifyUrl}" style="display: inline-block; background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email</a>
          <p>This link expires in 24 hours.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
      </div>
    `,
  });
};

exports.sendPasswordResetEmail = async (email, name, resetUrl) => {
  await sendEmail({
    to: email,
    subject: 'Password Reset - Smart Transport',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f97316; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Smart Transport</h1>
        </div>
        <div style="padding: 30px; background: #fff;">
          <h2>Hello ${name},</h2>
          <p>You requested a password reset. Click the button below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
          <p>This link expires in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `,
  });
};

exports.sendShipmentNotification = async (email, name, shipment, status) => {
  const statusMessages = {
    confirmed: 'Your shipment has been confirmed',
    assigned: 'A driver has been assigned to your shipment',
    picked_up: 'Your cargo has been picked up',
    in_transit: 'Your shipment is on the way',
    delivered: 'Your shipment has been delivered successfully',
  };

  await sendEmail({
    to: email,
    subject: `Shipment Update: ${statusMessages[status] || 'Status Updated'} - Smart Transport`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f97316; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Smart Transport</h1>
        </div>
        <div style="padding: 30px; background: #fff;">
          <h2>Hello ${name},</h2>
          <p>${statusMessages[status] || 'Your shipment status has been updated.'}</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Tracking Number:</strong> ${shipment.trackingNumber}</p>
            <p><strong>From:</strong> ${shipment.pickup?.city}</p>
            <p><strong>To:</strong> ${shipment.destination?.city}</p>
            <p><strong>Status:</strong> ${status.replace('_', ' ').toUpperCase()}</p>
          </div>
        </div>
      </div>
    `,
  });
};
