import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiSearch, FiFilter, FiPackage, FiEye, FiPlus } from 'react-icons/fi';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import { SkeletonTable } from '../../components/common/LoadingSkeleton';
import { formatDate, formatCurrency } from '../../utils/helpers';

const STATUSES = ['pending','confirmed','assigned','picked_up','in_transit','out_for_delivery','delivered','cancelled','failed'];

const ShipmentHistory = () => {
  const [page,   setPage]   = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['shipments', page, search, status],
    queryFn: () =>
      api.get(`/shipments?page=${page}&limit=10&search=${encodeURIComponent(search)}&status=${status}`)
        .then((r) => r.data),
    keepPreviousData: true,
  });

  const shipments = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Shipments</h1>
        <Link to="/customer/create-shipment" className="btn-primary flex items-center gap-2 text-sm">
          <FiPlus size={14} /> New Shipment
        </Link>
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
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="input-field w-44"
            >
              <option value="">All Status</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
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
            <Link to="/customer/create-shipment" className="btn-primary mt-4 inline-flex items-center gap-2 text-sm">
              <FiPlus size={14} /> Create a shipment
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-dark-700">
                    {['Tracking #', 'Route', 'Cargo', 'Status', 'Priority', 'Date', 'Amount', ''].map((h) => (
                      <th key={h} className="text-left py-3 px-2 text-gray-500 font-medium text-xs uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shipments.map((s) => (
                    <tr key={s.id} className="border-b border-gray-50 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700">
                      <td className="py-3 px-2">
                        <span className="font-mono text-xs text-primary-500 font-semibold">{s.trackingNumber}</span>
                      </td>
                      <td className="py-3 px-2 text-xs">
                        <div className="font-medium text-gray-800 dark:text-gray-200">{s.pickupCity}</div>
                        <div className="text-gray-400">→ {s.destCity}</div>
                      </td>
                      <td className="py-3 px-2 text-xs text-gray-500">
                        <div>{s.cargoDescription?.substring(0, 20)}{s.cargoDescription?.length > 20 ? '…' : ''}</div>
                        <div className="text-gray-400">{s.cargoWeight} kg</div>
                      </td>
                      <td className="py-3 px-2"><StatusBadge status={s.status} /></td>
                      <td className="py-3 px-2">
                        <span className={`badge text-xs ${s.priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                          {s.priority}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-gray-500 text-xs">{formatDate(s.createdAt)}</td>
                      <td className="py-3 px-2 font-semibold text-xs">{formatCurrency(s.totalPrice)}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1">
                          <Link
                            to={`/customer/track/${s.id}`}
                            className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-500 inline-flex"
                            title="Track shipment"
                          >
                            <FiEye size={15} />
                          </Link>
                          {s.status === 'pending' && !s.isPaid && (
                            <Link
                              to="/customer/payment"
                              state={{ shipmentId: s.id, trackingNumber: s.trackingNumber, amount: s.totalPrice }}
                              className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded-lg font-medium transition-colors"
                            >
                              Pay
                            </Link>
                          )}
                        </div>
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
