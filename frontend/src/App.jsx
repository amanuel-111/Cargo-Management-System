import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from './redux/slices/authSlice';
import { useSocket } from './hooks/useSocket';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import ServicesPage from './pages/public/ServicesPage';
import PricingPage from './pages/public/PricingPage';
import ContactPage from './pages/public/ContactPage';
import TrackPage from './pages/public/TrackPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard';
import CreateShipment from './pages/customer/CreateShipment';
import ShipmentHistory from './pages/customer/ShipmentHistory';
import TrackShipment from './pages/customer/TrackShipment';
import CustomerProfile from './pages/customer/Profile';
import Payment from './pages/customer/Payment';
import Notifications from './pages/customer/Notifications';

// Driver Pages
import DriverDashboard from './pages/driver/Dashboard';
import AssignedDeliveries from './pages/driver/AssignedDeliveries';
import DeliveryUpdate from './pages/driver/DeliveryUpdate';
import DriverProfile from './pages/driver/Profile';

// Fleet Manager Pages
import FleetDashboard from './pages/fleet/Dashboard';
import ManageDrivers from './pages/fleet/ManageDrivers';
import ManageVehicles from './pages/fleet/ManageVehicles';
import ShipmentAssignment from './pages/fleet/ShipmentAssignment';
import TrackingCenter from './pages/fleet/TrackingCenter';
import FleetReports from './pages/fleet/Reports';
import PaymentApproval from './pages/fleet/PaymentApproval';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import AdminAnalytics from './pages/admin/Analytics';
import SystemSettings from './pages/admin/Settings';

// Route Guards
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';

// Initialize dark mode
const initDarkMode = () => {
  if (localStorage.getItem('darkMode') === 'true') {
    document.documentElement.classList.add('dark');
  }
};
initDarkMode();

function AppContent() {
  useSocket(); // Initialize socket connection
  return null;
}

function App() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) dispatch(getMe());
  }, [dispatch, token]);

  return (
    <Router>
      <AppContent />
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/track" element={<TrackPage />} />
          <Route path="/track/:trackingNumber" element={<TrackPage />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Customer Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute roles={['customer']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/customer/dashboard" element={<CustomerDashboard />} />
              <Route path="/customer/create-shipment" element={<CreateShipment />} />
              <Route path="/customer/shipments" element={<ShipmentHistory />} />
              <Route path="/customer/track/:id" element={<TrackShipment />} />
              <Route path="/customer/track" element={<TrackShipment />} />
              <Route path="/customer/notifications" element={<Notifications />} />
              <Route path="/customer/profile" element={<CustomerProfile />} />
              <Route path="/customer/payment" element={<Payment />} />
            </Route>
          </Route>
        </Route>

        {/* Driver Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute roles={['driver']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/driver/dashboard" element={<DriverDashboard />} />
              <Route path="/driver/deliveries" element={<AssignedDeliveries />} />
              <Route path="/driver/delivery/:id" element={<DeliveryUpdate />} />
              <Route path="/driver/profile" element={<DriverProfile />} />
            </Route>
          </Route>
        </Route>

        {/* Fleet Manager Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute roles={['fleet_manager', 'admin']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/fleet/dashboard" element={<FleetDashboard />} />
              <Route path="/fleet/drivers" element={<ManageDrivers />} />
              <Route path="/fleet/vehicles" element={<ManageVehicles />} />
              <Route path="/fleet/assignments" element={<ShipmentAssignment />} />
              <Route path="/fleet/tracking" element={<TrackingCenter />} />
              <Route path="/fleet/reports" element={<FleetReports />} />
              <Route path="/fleet/payments" element={<PaymentApproval />} />
            </Route>
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute roles={['admin']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/settings" element={<SystemSettings />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
