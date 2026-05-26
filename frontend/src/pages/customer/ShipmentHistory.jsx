import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiSearch, FiFilter, FiPackage, FiEye } from 'react-icons/fi';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import { SkeletonTable } from '../../components/common/LoadingSkeleton';
import { formatDate, formatCurrency } from '../../utils/helpers';

const ShipmentHistory = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['shipments', page, search, status],
    queryFn: () => api.get(`/shipments?page=${page}&limit=10&search=${search}&status=${status}`).then((r) => r.data),
    keepPreviousData: true,
  });

  const shipments = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shipment History</h1>
        <Link to="/customer/create-shipment" className="btn-primary text-sm">+ New Shipment</Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by tracking number or city..."
              className="input-field pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-400" size={16} />
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input-field w-40">
              <option value="">All Status</option>
              {['pending', 'confirmed', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'].map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {isLoading ? (
          <SkeletonTable rows={5} />
        ) : shipments.length === 0 ? (
          <div className="text-center py-12">
            <FiPackage className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500">No shipments found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-dark-700">
                    {['Tracking #', 'Route', 'Cargo', 'Status', 'Date', 'Amount', 'Action'].map((h) => (
                      <th key={h} className="text-left py-3 px-2 text-gray-500 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shipments.map((s) => (
                    <tr key={s._id} className="border-b border-gray-50 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700">
                      <td className="py-3 px-2">
                        <span className="font-mono text-xs text-primary-500">{s.trackingNumber}</span>
                      </td>
                      <td className="py-3 px-2 text-gray-600 dark:text-gray-400">
                        <div className="text-xs">{s.pickup?.city}</div>
                        <div className="text-xs text-gray-400">→ {s.destination?.city}</div>
                      </td>
                      <td className="py-3 px-2 text-gray-600 dark:text-gray-400 text-xs">
                        <div>{s.cargo?.description?.substring(0, 20)}...</div>
                        <div className="text-gray-400">{s.cargo?.weight} kg</div>
                      </td>
                      <td className="py-3 px-2"><StatusBadge status={s.status} /></td>
                      <td className="py-3 px-2 text-gray-500 text-xs">{formatDate(s.createdAt)}</td>
                      <td className="py-3 px-2 font-medium text-xs">{formatCurrency(s.pricing?.totalPrice)}</td>
                      <td className="py-3 px-2">
                        <Link to={`/customer/track/${s._id}`} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-500 inline-flex">
                          <FiEye size={15} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination currentPage={page} totalPages={data?.pages || 1} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
};

export default ShipmentHistory;
