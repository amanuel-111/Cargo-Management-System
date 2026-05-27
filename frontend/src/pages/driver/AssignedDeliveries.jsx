import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiPackage, FiMapPin, FiArrowRight, FiSearch, FiFilter } from 'react-icons/fi';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import { SkeletonTable } from '../../components/common/LoadingSkeleton';
import { formatDate } from '../../utils/helpers';

const STATUSES = ['assigned','picked_up','in_transit','out_for_delivery','delivered','failed'];

const AssignedDeliveries = () => {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['driver-deliveries', status, search],
    queryFn: () =>
      api.get(`/shipments?status=${status}&search=${encodeURIComponent(search)}&limit=50`)
        .then((r) => r.data),
  });

  const shipments = data?.data || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Deliveries</h1>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by tracking number or city..."
              className="input-field pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-400" size={16} />
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field w-44">
              <option value="">All Status</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <SkeletonTable />
      ) : shipments.length === 0 ? (
        <div className="card text-center py-12">
          <FiPackage className="mx-auto text-gray-300 mb-3" size={40} />
          <p className="text-gray-500">No deliveries found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {shipments.map((s) => (
            <div key={s.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm font-semibold text-primary-500">{s.trackingNumber}</span>
                    <StatusBadge status={s.status} />
                    {s.priority === 'urgent' && (
                      <span className="badge bg-red-100 text-red-700 text-xs">Urgent</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FiMapPin className="text-green-500 flex-shrink-0" size={13} />
                    <span>{s.pickupCity}</span>
                    <span className="text-xs text-gray-400">{s.pickupAddress}</span>
                    <FiArrowRight size={12} className="text-gray-400 flex-shrink-0" />
                    <FiMapPin className="text-red-500 flex-shrink-0" size={13} />
                    <span>{s.destCity}</span>
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>Weight: {s.cargoWeight} kg</span>
                    <span className="capitalize">Category: {s.cargoCategory}</span>
                    <span>Date: {formatDate(s.createdAt)}</span>
                  </div>
                  {s.customer && (
                    <p className="text-xs text-gray-400 mt-1">
                      Customer: {s.customer.firstName} {s.customer.lastName} · {s.customer.phone}
                    </p>
                  )}
                </div>
                <Link to={`/driver/delivery/${s.id}`} className="btn-primary text-sm py-2 ml-4 flex-shrink-0">
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
