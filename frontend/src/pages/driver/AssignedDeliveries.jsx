import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiPackage, FiMapPin, FiArrowRight } from 'react-icons/fi';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import { SkeletonTable } from '../../components/common/LoadingSkeleton';
import { formatDate } from '../../utils/helpers';

const AssignedDeliveries = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['driver-deliveries'],
    queryFn: () => api.get('/shipments').then((r) => r.data),
  });

  const shipments = data?.data || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Deliveries</h1>

      {isLoading ? (
        <SkeletonTable />
      ) : shipments.length === 0 ? (
        <div className="card text-center py-12">
          <FiPackage className="mx-auto text-gray-300 mb-3" size={40} />
          <p className="text-gray-500">No deliveries assigned</p>
        </div>
      ) : (
        <div className="space-y-3">
          {shipments.map((s) => (
            <div key={s._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm font-semibold text-primary-500">{s.trackingNumber}</span>
                    <StatusBadge status={s.status} />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FiMapPin className="text-green-500" size={14} />
                    <span>{s.pickup?.city}, {s.pickup?.address}</span>
                    <FiArrowRight size={12} className="text-gray-400" />
                    <FiMapPin className="text-red-500" size={14} />
                    <span>{s.destination?.city}</span>
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>Weight: {s.cargo?.weight} kg</span>
                    <span>Date: {formatDate(s.createdAt)}</span>
                  </div>
                </div>
                <Link to={`/driver/delivery/${s._id}`} className="btn-primary text-sm py-2 ml-4">
                  Manage
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignedDeliveries;
