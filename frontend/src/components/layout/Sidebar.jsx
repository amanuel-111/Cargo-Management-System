import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiTruck, FiHome, FiPackage, FiMap, FiUsers, FiBarChart2,
  FiSettings, FiLogOut, FiChevronLeft, FiChevronRight, FiBell,
  FiNavigation, FiClipboard, FiTool, FiActivity, FiDollarSign,
} from 'react-icons/fi';
import { toggleSidebar } from '../../redux/slices/uiSlice';
import { useAuth } from '../../hooks/useAuth';
import { getInitials } from '../../utils/helpers';

const navConfig = {
  customer: [
    { label: 'Dashboard', to: '/customer/dashboard', icon: FiHome },
    { label: 'Create Shipment', to: '/customer/create-shipment', icon: FiPackage },
    { label: 'My Shipments', to: '/customer/shipments', icon: FiClipboard },
    { label: 'Track Shipment', to: '/customer/track', icon: FiMap },
    { label: 'Notifications', to: '/customer/notifications', icon: FiBell },
    { label: 'Profile', to: '/customer/profile', icon: FiSettings },
  ],
  driver: [
    { label: 'Dashboard', to: '/driver/dashboard', icon: FiHome },
    { label: 'My Deliveries', to: '/driver/deliveries', icon: FiPackage },
    { label: 'Navigation', to: '/driver/navigation', icon: FiNavigation },
    { label: 'Profile', to: '/driver/profile', icon: FiSettings },
  ],
  fleet_manager: [
    { label: 'Dashboard',        to: '/fleet/dashboard',   icon: FiHome      },
    { label: 'Manage Drivers',   to: '/fleet/drivers',     icon: FiUsers     },
    { label: 'Manage Vehicles',  to: '/fleet/vehicles',    icon: FiTruck     },
    { label: 'Assignments',      to: '/fleet/assignments', icon: FiClipboard },
    { label: 'Payment Approval', to: '/fleet/payments',    icon: FiDollarSign },
    { label: 'Tracking Center',  to: '/fleet/tracking',    icon: FiMap       },
    { label: 'Reports',          to: '/fleet/reports',     icon: FiBarChart2 },
  ],
  admin: [
    { label: 'Dashboard',        to: '/admin/dashboard', icon: FiHome      },
    { label: 'User Management',  to: '/admin/users',     icon: FiUsers     },
    { label: 'Payment Approval', to: '/fleet/payments',  icon: FiDollarSign },
    { label: 'Analytics',        to: '/admin/analytics', icon: FiActivity  },
    { label: 'Settings',         to: '/admin/settings',  icon: FiTool      },
  ],
};

const Sidebar = () => {
  const dispatch = useDispatch();
  const { sidebarOpen } = useSelector((state) => state.ui);
  const { user, logout } = useAuth();

  const links = navConfig[user?.role] || [];

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 256 : 64 }}
      transition={{ duration: 0.2 }}
      className="fixed left-0 top-0 h-full bg-white dark:bg-dark-900 border-r border-gray-100 dark:border-dark-700 z-40 flex flex-col overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100 dark:border-dark-700">
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiTruck className="text-white text-sm" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white text-sm whitespace-nowrap">
                Smart<span className="text-primary-500">Transport</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        {!sidebarOpen && (
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center mx-auto">
            <FiTruck className="text-white text-sm" />
          </div>
        )}
        {sidebarOpen && (
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-500"
          >
            <FiChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Collapse button when closed */}
      {!sidebarOpen && (
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="mx-auto mt-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-500"
        >
          <FiChevronRight size={16} />
        </button>
      )}

      {/* User info */}
      {sidebarOpen && user && (
        <div className="px-4 py-3 border-b border-gray-100 dark:border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <span className="text-primary-600 font-semibold text-sm">
                  {getInitials(user.firstName, user.lastName)}
                </span>
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user.role?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {links.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''} ${!sidebarOpen ? 'justify-center px-2' : ''}`
            }
            title={!sidebarOpen ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-2 py-4 border-t border-gray-100 dark:border-dark-700">
        <button
          onClick={logout}
          className={`sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 ${!sidebarOpen ? 'justify-center px-2' : ''}`}
          title={!sidebarOpen ? 'Logout' : undefined}
        >
          <FiLogOut size={18} className="flex-shrink-0" />
          {sidebarOpen && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
