import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  FiPackage, FiTruck, FiCheckCircle, FiClock,
  FiPlus, FiArrowRight, FiDollarSign, FiAlertCircle,
} from 'react-icons/fi';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { SkeletonCard } from '../../components/common/LoadingSkeleton';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { useSelector } from 'react-redux';

const CustomerDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  // Fetch shipment stats
  const { data: statsRes } = useQuery({
    queryKey: ['customer-shipment-stats'],
    queryFn: () => api.get('/shipments/stats').then((r) => r.data),
  });
  const shipmentStats = statsRes?.data || { total: 0, in_transit: 0, delivered: 0, unpaid_pending: 0 };

  // Fetch recent 5 for the table
  const { data: recentData, isLoading } = useQuery({
    queryKey: ['customer-shipments-recent'],
    queryFn: () => api.get('/shipments?limit=5').then((r) => r.data),
  });

  const recentShipments = recentData?.data || [];

  const stats = [
    { title: 'Total Shipments', value: shipmentStats.total,          icon: FiPackage,     color: 'primary' },
    { title: 'In Transit',      value: shipmentStats.in_transit,     icon: FiTruck,       color: 'orange'  },
    { title: 'Delivered',       value: shipmentStats.delivered,      icon: FiCheckCircle, color: 'green'   },
    { title: 'Pending Payment', value: shipmentStats.unpaid_pending, icon: FiClock,       color: 'blue'    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">Here's what's happening with your shipments</p>
        </div>
        <Link to="/customer/create-shipment" className="btn-primary flex items-center gap-2">
          <FiPlus size={16} /> New Shipment
        </Link>
      </div>

      {/* Unpaid alert */}
      {shipmentStats.unpaid_pending > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <FiAlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
            <div>
              <p className="font-semibold text-yellow-800 dark:text-yellow-400 text-sm">
                {shipmentStats.unpaid_pending} shipment{shipmentStats.unpaid_pending > 1 ? 's' : ''} awaiting payment
              </p>
              <p className="text-yellow-700 dark:text-yellow-500 text-xs">
                Complete payment to confirm your shipment{shipmentStats.unpaid_pending > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Link
            to="/customer/shipments"
            className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
          >
            <FiDollarSign size={13} /> Pay Now
          </Link>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : stats.map((stat) => <StatCard key={stat.title} {...stat} />)
        }
      </div>

      {/* Recent Shipments */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Recent Shipments</h2>
          <Link to="/customer/shipments" className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1">
            View all <FiArrowRight size={14} />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-dark-700 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : recentShipments.length === 0 ? (
          <div className="text-center py-12">
            <FiPackage className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500">No shipments yet</p>
            <Link to="/customer/create-shipment" className="btn-primary mt-4 inline-flex items-center gap-2">
              <FiPlus size={16} /> Create your first shipment
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-dark-700">
                  {['Tracking #', 'Route', 'Status', 'Date', 'Amount', ''].map((h) => (
                    <th key={h} className="text-left py-3 text-gray-500 font-medium text-xs uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentShipments.map((s) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-gray-50 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700"
                  >
                    <td className="py-3">
                      <Link to={`/customer/track/${s.id}`} className="text-primary-500 font-mono text-xs font-medium hover:underline">
                        {s.trackingNumber}
                      </Link>
                    </td>
                    <td className="py-3 text-gray-600 dark:text-gray-400 text-xs">
                      {s.pickupCity} → {s.destCity}
                    </td>
                    <td className="py-3"><StatusBadge status={s.status} /></td>
                    <td className="py-3 text-gray-500 text-xs">{formatDate(s.createdAt)}</td>
                    <td className="py-3 font-medium text-xs">{formatCurrency(s.totalPrice)}</td>
                    <td className="py-3">
                      {s.status === 'pending' && !s.isPaid && (
                        <Link
                          to="/customer/payment"
                          state={{ shipmentId: s.id, trackingNumber: s.trackingNumber, amount: s.totalPrice }}
                          className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded-lg font-medium transition-colors"
                        >
                          Pay
                        </Link>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
