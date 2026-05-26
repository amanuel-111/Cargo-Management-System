# 🚚 Smart Transport — Cargo Management System

A full-stack logistics and cargo management platform built for Ethiopian transport operations. Supports real-time shipment tracking, multi-role dashboards, fleet management, and payment processing.

---

## ✨ Features

### Customer
- Create shipment requests with pickup & delivery details
- Real-time shipment tracking via tracking number
- Payment submission (CBE Bank, Telebirr, Chapa)
- Shipment history and status updates
- Rate completed deliveries

### Driver
- View assigned deliveries
- Update shipment status (picked up → in transit → delivered)
- Upload proof of delivery (photo + signature)
- Real-time location sharing

### Fleet Manager
- Assign drivers and vehicles to shipments
- Manage driver and vehicle records
- Live tracking center
- Generate reports

### Admin
- Full user management (create, activate, deactivate)
- System-wide analytics dashboard
- Platform settings

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Tailwind CSS, Redux Toolkit, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MySQL + Sequelize ORM |
| Real-time | Socket.io |
| Auth | JWT (access + refresh tokens) |
| File Uploads | Cloudinary + Multer |
| Email | Nodemailer (Gmail SMTP) |
| SMS | Twilio |
| Maps | Mapbox GL |
| Charts | Recharts |

---

## 📁 Project Structure

```
Cargo-Management-System/
├── backend/
│   ├── config/          # DB connection, Cloudinary
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth (JWT + RBAC), error handler, validation
│   ├── models/          # Sequelize models
│   ├── routes/          # Express routers
│   ├── services/        # Email, SMS, notification services
│   ├── sockets/         # Socket.io event handlers
│   ├── server.js
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/  # Reusable UI components
    │   ├── layouts/     # Dashboard & public layouts
    │   ├── pages/       # admin / customer / driver / fleet / auth / public
    │   ├── redux/       # Store + slices
    │   ├── services/    # Axios instance, Socket service
    │   └── hooks/       # useAuth, useSocket
    └── .env.example
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v16+
- MySQL (MAMP, XAMPP, or standalone)

### 1. Clone the repo
```bash
git clone https://github.com/amanuel-111/Cargo-Management-System.git
cd Cargo-Management-System
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and set your MySQL credentials and JWT secrets:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=smart_transport
DB_USER=root
DB_PASS=your_password

JWT_SECRET=your_long_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
```

Create the database:
```sql
CREATE DATABASE smart_transport CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Start the backend (tables are auto-created on first run):
```bash
npm run dev
```

### 3. Frontend setup
```bash
cd ../frontend
npm install
cp .env.example .env
```

`.env` defaults work for local dev:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_MAPBOX_TOKEN=your_mapbox_token   # optional
```

Start the frontend:
```bash
npm start
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000/api |
| Health check | http://localhost:5000/health |

---

## 💰 Pricing

Shipment pricing is calculated as:

```
Total = (Distance in km × 25 ETB) + (Weight in kg × 2 ETB)
Minimum fare: 200 ETB
```

Use the estimate endpoint before creating a shipment:
```
GET /api/shipments/estimate?pickupLat=9.03&pickupLng=38.74&destLat=8.99&destLng=38.79&weight=50
```

---

## 🔐 User Roles

| Role | Access |
|---|---|
| `customer` | Create shipments, track, pay, rate |
| `driver` | View assignments, update status, upload POD |
| `fleet_manager` | Assign drivers/vehicles, manage fleet, reports |
| `admin` | Full system access |

---

## 📡 Key API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/shipments
POST   /api/shipments
GET    /api/shipments/estimate
GET    /api/shipments/track/:trackingNumber
PUT    /api/shipments/:id/assign
PUT    /api/shipments/:id/status
GET    /api/vehicles
GET    /api/users
GET    /api/analytics/overview
GET    /api/notifications
```

---

## 🌍 Environment Variables

See [`backend/.env.example`](backend/.env.example) and [`frontend/.env.example`](frontend/.env.example) for all required variables.

> **Note:** Never commit your `.env` file. It is listed in `.gitignore`.

---

## 📄 License

MIT — free to use and modify.
