import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiSearch, FiPackage, FiEye, FiPlus } from 'react-icons/fi';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import { SkeletonTable } from '../../components/common/LoadingSkeleton';
import { formatDate, formatCurrency } from '../../utils/helpers';

const STATUS_FILTERS = [
  { label: 'Pending',     value: 'pending',          color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
  { label: 'Confirmed',   value: 'confirmed',         color: 'bg-blue-100 text-blue-700 hover:bg-blue-200'       },
  { label: 'Assigned',    value: 'assigned',          color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
  { label: 'In Transit',  value: 'in_transit',        color: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
  { label: 'Delivered',   value: 'delivered',         color: 'bg-green-100 text-green-700 hover:bg-green-200'    },
  { label: 'Cancelled',   value: 'cancelled',         color: 'bg-gray-100 text-gray-600 hover:bg-gray-200'       },
  { label: 'All',         value: '',                  color: 'bg-gray-100 text-gray-600 hover:bg-gray-200'       },
];

const ShipmentHistory = () => {
  const [page,   setPage]   = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('pending'); // default: pending

  const { data, isLoading } = useQuery({
    queryKey: ['shipments', page, search, status],
    queryFn: () =>
      api.get(`/shipments?page=${page}&limit=10&search=${encodeURIComponent(search)}&status=${status}`)
        .then((r) => r.data),
    keepPreviousData: true,
  });

  const shipments = data?.data || [];

  const handleStatusChange = (val) => {
    setStatus(val);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Shipments</h1>
        <Link to="/customer/create-shipment" className="btn-primary flex items-center gap-2 text-sm">
          <FiPlus size={14} /> New Shipment
        </Link>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by tracking number or city..."
            className="input-field pl-9"
          />
        </div>
      </div>

      {/* Status filter buttons */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => handleStatusChange(f.value)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border-2 ${
              status === f.value
                ? `${f.color} border-current shadow-sm scale-105`
                : 'bg-white dark:bg-dark-800 text-gray-500 border-gray-200 dark:border-dark-600 hover:border-gray-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card">
        {isLoading ? (
          <SkeletonTable rows={5} />
        ) : shipments.length === 0 ? (
          <div className="text-center py-12">
            <FiPackage className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500 font-medium">
              {status ? `No ${status.replace(/_/g, ' ')} shipments` : 'No shipments found'}
            </p>
            {status === 'pending' && (
              <Link to="/customer/create-shipment" className="btn-primary mt-4 inline-flex items-center gap-2 text-sm">
                <FiPlus size={14} /> Create your first shipment
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-dark-700 bg-gray-50 dark:bg-dark-800">
                    {['Tracking #', 'Route', 'Cargo', 'Status', 'Priority', 'Date', 'Amount', ''].map((h) => (
                      <th key={h} className="text-left py-3 px-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-dark-700">
                  {shipments.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-mono text-xs text-primary-500 font-bold">{s.trackingNumber}</span>
                      </td>
                      <td className="py-3 px-3 text-xs">
                        <div className="font-medium text-gray-800 dark:text-gray-200">{s.pickupCity}</div>
                        <div className="text-gray-400">→ {s.destCity}</div>
                      </td>
                      <td className="py-3 px-3 text-xs text-gray-500">
                        <div>{s.cargoDescription?.substring(0, 22)}{s.cargoDescription?.length > 22 ? '…' : ''}</div>
                        <div className="text-gray-400">{s.cargoWeight} kg</div>
                      </td>
                      <td className="py-3 px-3"><StatusBadge status={s.status} /></td>
                      <td className="py-3 px-3">
                        <span className={`badge text-xs ${s.priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                          {s.priority}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-500 text-xs">{formatDate(s.createdAt)}</td>
                      <td className="py-3 px-3 font-semibold text-xs text-gray-900 dark:text-white">
                        {formatCurrency(s.totalPrice)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <Link
                            to={`/customer/track/${s.id}`}
                            className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 text-primary-500 inline-flex transition-colors"
                            title="Track shipment"
                          >
                            <FiEye size={15} />
                          </Link>
                          {s.status === 'pending' && !s.isPaid && (
                            <Link
                              to="/customer/payment"
                              state={{ shipmentId: s.id, trackingNumber: s.trackingNumber, amount: s.totalPrice }}
                              className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-2.5 py-1 rounded-lg font-semibold transition-colors"
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
