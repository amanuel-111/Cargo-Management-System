# Smart Transport — Frontend

React.js + Tailwind CSS + Redux Toolkit logistics dashboard.

## Quick Start

```bash
npm install
cp .env.example .env   # add your API URL and Mapbox token
npm start              # development
npm run build          # production build
```

## Folder Structure

```
frontend/
├── public/
│   └── index.html
└── src/
    ├── assets/            # Images, icons
    ├── components/
    │   ├── common/        # StatCard, StatusBadge, Modal, Pagination, LoadingSkeleton
    │   └── layout/        # Navbar, Footer, Sidebar, DashboardHeader
    ├── layouts/
    │   ├── PublicLayout.jsx
    │   └── DashboardLayout.jsx
    ├── routes/
    │   ├── ProtectedRoute.jsx
    │   └── RoleRoute.jsx
    ├── pages/
    │   ├── public/        # Home, About, Services, Pricing, Contact, Track
    │   ├── auth/          # Login, Register, ForgotPassword, ResetPassword
    │   ├── customer/      # Dashboard, CreateShipment, ShipmentHistory, TrackShipment, Profile
    │   ├── driver/        # Dashboard, AssignedDeliveries, DeliveryUpdate, Profile
    │   ├── fleet/         # Dashboard, ManageDrivers, ManageVehicles, ShipmentAssignment, TrackingCenter, Reports
    │   └── admin/         # Dashboard, UserManagement, Analytics, Settings
    ├── redux/
    │   ├── store.js
    │   └── slices/        # authSlice, uiSlice, notificationSlice
    ├── services/
    │   ├── api.js         # Axios instance + interceptors
    │   └── socketService.js
    ├── hooks/
    │   ├── useAuth.js
    │   └── useSocket.js
    ├── utils/
    │   └── helpers.js     # formatDate, formatCurrency, status colors
    ├── App.jsx
    ├── index.js
    └── index.css
```

## Deploy to Vercel

```bash
npm run build
# or connect repo to Vercel — it auto-detects Create React App
```

Set `REACT_APP_API_URL` to your backend URL in Vercel environment variables.
