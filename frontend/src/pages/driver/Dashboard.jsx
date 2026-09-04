import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiPackage, FiCheckCircle, FiTruck, FiToggleLeft, FiToggleRight, FiStar, FiMapPin, FiArrowRight } from 'react-icons/fi';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { SkeletonCard } from '../../components/common/LoadingSkeleton';
import { formatDate } from '../../utils/helpers';
import { useSelector } from 'react-redux';
import { toggleDriverAvailability } from '../../services/socketService';
import toast from 'react-hot-toast';

const DriverDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [isOnline, setIsOnline] = useState(user?.isOnline || false);

  const { data: shipmentsData, isLoading } = useQuery({
    queryKey: ['driver-shipments'],
    queryFn: () => api.get('/shipments?limit=5').then((r) => r.data),
  });

  const shipments     = shipmentsData?.data || [];
  const activeDeliveries = shipments.filter((s) =>
    ['assigned', 'picked_up', 'in_transit'].includes(s.status)
  );

  const handleToggleAvailability = async () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    toggleDriverAvailability(newStatus);
    try {
      await api.put('/users/profile', { isOnline: newStatus });
      toast.success(newStatus ? 'You are now online' : 'You are now offline');
    } catch {
      setIsOnline(!newStatus);
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Driver Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, {user?.firstName}</p>
        </div>
        <button
          onClick={handleToggleAvailability}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
            isOnline
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {isOnline ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
          {isOnline ? 'Online' : 'Offline'}
        </button>
      </div>

      {/* Active deliveries alert */}
      {activeDeliveries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold text-primary-700 dark:text-primary-400">
              {activeDeliveries.length} Active {activeDeliveries.length === 1 ? 'Delivery' : 'Deliveries'}
            </p>
            <Link to={`/driver/deliveries`} className="btn-primary text-sm py-1.5 px-3">
              View All
            </Link>
          </div>
          <div className="space-y-2 mt-3">
            {activeDeliveries.slice(0, 3).map((delivery) => (
              <div key={delivery.id} className="flex items-center justify-between bg-white dark:bg-dark-800 p-2 rounded border border-primary-100 dark:border-primary-800/50">
                <p className="text-sm text-primary-600 dark:text-primary-500">
                  <span className="font-mono font-semibold">{delivery.trackingNumber}</span> · {delivery.pickupCity} → {delivery.destCity}
                </p>
                <Link to={`/driver/delivery/${delivery.id}`} className="text-xs font-medium text-primary-600 hover:underline">
                  Update
                </Link>
              </div>
            ))}
            {activeDeliveries.length > 3 && (
              <p className="text-xs text-primary-600 text-center mt-2">+ {activeDeliveries.length - 3} more</p>
            )}
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard title="Total Deliveries"  value={user?.totalDeliveries || 0}                                                    icon={FiPackage}     color="primary" />
            <StatCard title="Completed"          value={shipments.filter((s) => s.status === 'delivered').length}                     icon={FiCheckCircle} color="green"   />
            <StatCard title="In Progress"        value={shipments.filter((s) => ['assigned','in_transit'].includes(s.status)).length} icon={FiTruck}       color="orange"  />
            <StatCard title="Rating"             value={user?.rating ? Number(user.rating).toFixed(1) : 'N/A'}                       icon={FiStar}        color="purple"  />
          </>
        )}
      </div>

      {/* Recent deliveries */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">My Deliveries</h2>
          <Link to="/driver/deliveries" className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1">
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
          <div className="text-center py-8 text-gray-500">
            <FiPackage className="mx-auto mb-2 text-gray-300" size={32} />
            <p>No deliveries assigned yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {shipments.slice(0, 5).map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-xl">
                <div>
                  <p className="font-medium text-sm text-gray-900 dark:text-white font-mono">{s.trackingNumber}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                    <FiMapPin size={10} className="text-green-500" />
                    <span>{s.pickupCity}</span>
                    <FiArrowRight size={10} />
                    <FiMapPin size={10} className="text-red-500" />
                    <span>{s.destCity}</span>
                  </div>
                  <p className="text-xs text-gray-400">{formatDate(s.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={s.status} />
                  <Link to={`/driver/delivery/${s.id}`} className="text-primary-500 hover:text-primary-600 text-xs font-medium">
                    Update
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
