let twilioClient;

const getClient = () => {
  if (!twilioClient && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    const twilio = require('twilio');
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
};

exports.sendSMS = async (to, message) => {
  try {
    const client = getClient();
    if (!client) {
      console.log('Twilio not configured, SMS skipped');
      return;
    }
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
  } catch (error) {
    console.error('SMS send failed:', error.message);
  }
};

exports.sendShipmentSMS = async (phone, trackingNumber, status) => {
  const messages = {
    assigned: `Smart Transport: Driver assigned to your shipment #${trackingNumber}. Track at smarttransport.et`,
    picked_up: `Smart Transport: Your cargo #${trackingNumber} has been picked up and is on its way!`,
    delivered: `Smart Transport: Your shipment #${trackingNumber} has been delivered. Thank you!`,
  };
  if (messages[status]) {
    await exports.sendSMS(phone, messages[status]);
  }
};
