import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiPackage, FiTruck, FiCheckCircle, FiClock, FiPlus, FiArrowRight } from 'react-icons/fi';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { SkeletonCard } from '../../components/common/LoadingSkeleton';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { useSelector } from 'react-redux';

const CustomerDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  const { data: shipmentsData, isLoading } = useQuery({
    queryKey: ['customer-shipments'],
    queryFn: () => api.get('/shipments?limit=5').then((r) => r.data),
  });

  const shipments = shipmentsData?.data || [];
  const total = shipmentsData?.total || 0;

  const stats = [
    { title: 'Total Shipments', value: total, icon: FiPackage, color: 'primary' },
    { title: 'In Transit', value: shipments.filter((s) => s.status === 'in_transit').length, icon: FiTruck, color: 'orange' },
    { title: 'Delivered', value: shipments.filter((s) => s.status === 'delivered').length, icon: FiCheckCircle, color: 'green' },
    { title: 'Pending', value: shipments.filter((s) => s.status === 'pending').length, icon: FiClock, color: 'blue' },
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

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          stats.map((stat) => <StatCard key={stat.title} {...stat} />)
        )}
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
        ) : shipments.length === 0 ? (
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
                  <th className="text-left py-3 text-gray-500 font-medium">Tracking #</th>
                  <th className="text-left py-3 text-gray-500 font-medium">Route</th>
                  <th className="text-left py-3 text-gray-500 font-medium">Status</th>
                  <th className="text-left py-3 text-gray-500 font-medium">Date</th>
                  <th className="text-left py-3 text-gray-500 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((s) => (
                  <motion.tr
                    key={s._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-gray-50 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700"
                  >
                    <td className="py-3">
                      <Link to={`/customer/track/${s._id}`} className="text-primary-500 font-medium hover:underline">
                        {s.trackingNumber}
                      </Link>
                    </td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">
                      {s.pickup?.city} → {s.destination?.city}
                    </td>
                    <td className="py-3"><StatusBadge status={s.status} /></td>
                    <td className="py-3 text-gray-500">{formatDate(s.createdAt)}</td>
                    <td className="py-3 font-medium">{formatCurrency(s.pricing?.totalPrice)}</td>
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
