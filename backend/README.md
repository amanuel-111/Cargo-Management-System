# Smart Transport — Backend

Node.js + Express + MongoDB REST API with Socket.io real-time support.

## Quick Start

```bash
npm install
cp .env.example .env   # fill in your values
npm run dev            # development (nodemon)
npm start              # production
```

## Folder Structure

```
backend/
├── config/
│   ├── db.js              # MongoDB connection
│   └── cloudinary.js      # Cloudinary + Multer
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── shipmentController.js
│   ├── vehicleController.js
│   ├── trackingController.js
│   ├── notificationController.js
│   └── analyticsController.js
├── middleware/
│   ├── auth.js            # JWT protect + RBAC authorize
│   ├── errorHandler.js
│   └── validate.js
├── models/
│   ├── User.js
│   ├── Vehicle.js
│   ├── Shipment.js
│   ├── Notification.js
│   ├── LocationUpdate.js
│   └── Report.js
├── routes/
│   ├── auth.js            # /api/auth
│   ├── users.js           # /api/users
│   ├── shipments.js       # /api/shipments
│   ├── vehicles.js        # /api/vehicles
│   ├── tracking.js        # /api/tracking
│   ├── notifications.js   # /api/notifications
│   └── analytics.js       # /api/analytics
├── services/
│   ├── emailService.js    # Nodemailer
│   ├── smsService.js      # Twilio
│   └── notificationService.js
├── sockets/
│   └── socketHandler.js   # Socket.io events
├── uploads/               # Temp file buffer
├── server.js
├── .env.example
└── Dockerfile
```

## API Base URL

```
http://localhost:5000/api
```

## Deploy to Render / Railway

Set all environment variables from `.env.example` in your dashboard, then connect your repo.
