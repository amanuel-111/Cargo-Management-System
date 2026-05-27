import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCheckCircle, FiXCircle, FiEye, FiSearch, FiFilter,
  FiDollarSign, FiClock, FiAlertCircle,
} from 'react-icons/fi';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import { SkeletonTable } from '../../components/common/LoadingSkeleton';
import { formatDate, formatCurrency, timeAgo } from '../../utils/helpers';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending:  'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100  text-green-700',
  rejected: 'bg-red-100    text-red-700',
};

const METHOD_LABELS = { cbe: 'CBE Bank', telebirr: 'Telebirr', chapa: 'Chapa' };

const PaymentApproval = () => {
  const queryClient = useQueryClient();
  const [page,      setPage]      = useState(1);
  const [status,    setStatus]    = useState('pending');
  const [search,    setSearch]    = useState('');
  const [selected,  setSelected]  = useState(null);   // payment being reviewed
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['payments', page, status],
    queryFn: () =>
      api.get(`/payments?page=${page}&limit=15&status=${status}`).then((r) => r.data),
    keepPreviousData: true,
  });

  const approveMutation = useMutation({
    mutationFn: (id) => api.put(`/payments/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries(['payments']);
      queryClient.invalidateQueries(['fleet-pending-shipments']);
      toast.success('Payment approved — shipment confirmed!');
      setSelected(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Approval failed'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => api.put(`/payments/${id}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries(['payments']);
      toast.success('Payment rejected — customer notified');
      setSelected(null);
      setShowReject(false);
      setRejectReason('');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Rejection failed'),
  });

  const payments = data?.data || [];

  // client-side search filter
  const filtered = search
    ? payments.filter((p) =>
        p.Shipment?.trackingNumber?.toLowerCase().includes(search.toLowerCase()) ||
        p.customer?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
        p.customer?.lastName?.toLowerCase().includes(search.toLowerCase())
      )
    : payments;

  const StatusTab = ({ value, label, count }) => (
    <button
      onClick={() => { setStatus(value); setPage(1); }}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
        status === value
          ? 'bg-primary-500 text-white shadow-sm'
          : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
      }`}
    >
      {label}
      {count !== undefined && (
        <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
          status === value ? 'bg-white/20' : 'bg-gray-200 dark:bg-dark-600'
        }`}>
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Approval</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FiDollarSign size={16} className="text-primary-500" />
          Review and approve customer payment submissions
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <StatusTab value="pending"  label="Pending"  count={data?.total} />
        <StatusTab value="approved" label="Approved" />
        <StatusTab value="rejected" label="Rejected" />
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by tracking number or customer name..."
            className="input-field pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {isLoading ? (
          <SkeletonTable rows={6} />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FiDollarSign className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500">
              {status === 'pending' ? 'No pending payments to review' : `No ${status} payments`}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-dark-700">
                    {['Customer', 'Shipment', 'Amount', 'Method', 'Submitted', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="text-left py-3 px-2 text-gray-500 font-medium text-xs uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filtered.map((p) => (
                      <motion.tr
                        key={p.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-gray-50 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700"
                      >
                        <td className="py-3 px-2">
                          <p className="font-medium text-gray-900 dark:text-white text-xs">
                            {p.customer?.firstName} {p.customer?.lastName}
                          </p>
                          <p className="text-gray-400 text-xs">{p.customer?.phone}</p>
                        </td>
                        <td className="py-3 px-2">
                          <p className="font-mono text-xs text-primary-500 font-semibold">
                            {p.Shipment?.trackingNumber}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {p.Shipment?.pickupCity} → {p.Shipment?.destCity}
                          </p>
                        </td>
                        <td className="py-3 px-2 font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(p.amount)}
                        </td>
                        <td className="py-3 px-2">
                          <span className="badge bg-blue-100 text-blue-700 text-xs">
                            {METHOD_LABELS[p.method] || p.method}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-gray-500 text-xs">
                          <p>{formatDate(p.createdAt)}</p>
                          <p className="text-gray-400">{timeAgo(p.createdAt)}</p>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`badge text-xs ${STATUS_COLORS[p.status]}`}>
                            {p.status}
                          </span>
                          {p.status === 'rejected' && p.rejectionReason && (
                            <p className="text-xs text-red-400 mt-0.5 max-w-24 truncate" title={p.rejectionReason}>
                              {p.rejectionReason}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setSelected(p)}
                              className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-500 transition-colors"
                              title="View details"
                            >
                              <FiEye size={14} />
                            </button>
                            {p.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => approveMutation.mutate(p.id)}
                                  disabled={approveMutation.isPending}
                                  className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                                  title="Approve"
                                >
                                  <FiCheckCircle size={14} />
                                </button>
                                <button
                                  onClick={() => { setSelected(p); setShowReject(true); }}
                                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                                  title="Reject"
                                >
                                  <FiXCircle size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            <Pagination currentPage={page} totalPages={data?.pages || 1} onPageChange={setPage} />
          </>
        )}
      </div>

      {/* Detail / Approve Modal */}
      <Modal
        isOpen={!!selected && !showReject}
        onClose={() => setSelected(null)}
        title="Payment Details"
        size="md"
      >
        {selected && (
          <div className="space-y-4">
            {/* Customer */}
            <div className="bg-gray-50 dark:bg-dark-700 rounded-xl p-4">
              <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Customer</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {selected.customer?.firstName} {selected.customer?.lastName}
              </p>
              <p className="text-sm text-gray-500">{selected.customer?.email}</p>
              <p className="text-sm text-gray-500">{selected.customer?.phone}</p>
            </div>

            {/* Shipment */}
            <div className="bg-gray-50 dark:bg-dark-700 rounded-xl p-4">
              <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Shipment</p>
              <p className="font-mono text-primary-500 font-semibold">{selected.Shipment?.trackingNumber}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {selected.Shipment?.pickupCity} → {selected.Shipment?.destCity}
              </p>
            </div>

            {/* Payment info */}
            <div className="bg-gray-50 dark:bg-dark-700 rounded-xl p-4">
              <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Payment Info</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-400 text-xs">Amount</span>
                  <p className="font-bold text-primary-600 text-lg">{formatCurrency(selected.amount)}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-xs">Method</span>
                  <p className="font-semibold text-gray-900 dark:text-white">{METHOD_LABELS[selected.method] || selected.method}</p>
                </div>
                {selected.transactionId && (
                  <div className="col-span-2">
                    <span className="text-gray-400 text-xs">Transaction ID</span>
                    <p className="font-mono text-sm text-gray-700 dark:text-gray-300">{selected.transactionId}</p>
                  </div>
                )}
                {selected.note && (
                  <div className="col-span-2">
                    <span className="text-gray-400 text-xs">Note</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selected.note}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <span className="text-gray-400 text-xs">Submitted</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(selected.createdAt)} · {timeAgo(selected.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Screenshot */}
            {selected.screenshotUrl && (
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Payment Screenshot</p>
                <img
                  src={selected.screenshotUrl}
                  alt="Payment proof"
                  className="w-full rounded-xl border border-gray-200 dark:border-dark-600 max-h-64 object-contain bg-gray-50"
                />
              </div>
            )}

            {/* Status */}
            <div className="flex items-center gap-2">
              <span className={`badge ${STATUS_COLORS[selected.status]}`}>{selected.status}</span>
              {selected.reviewedBy && (
                <span className="text-xs text-gray-400">
                  Reviewed by {selected.reviewedBy.firstName} {selected.reviewedBy.lastName}
                </span>
              )}
            </div>

            {/* Actions */}
            {selected.status === 'pending' && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowReject(true); }}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2 text-red-500 border-red-200 hover:bg-red-50"
                >
                  <FiXCircle size={15} /> Reject
                </button>
                <button
                  onClick={() => approveMutation.mutate(selected.id)}
                  disabled={approveMutation.isPending}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  {approveMutation.isPending ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Approving...</>
                  ) : (
                    <><FiCheckCircle size={15} />Approve Payment</>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showReject && !!selected}
        onClose={() => { setShowReject(false); setRejectReason(''); }}
        title="Reject Payment"
        size="sm"
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
              <FiAlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="font-medium text-red-700 dark:text-red-400 text-sm">Reject this payment?</p>
                <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                  The customer will be notified and asked to resubmit.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reason for rejection
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="input-field resize-none"
                placeholder="e.g. Screenshot unclear, wrong amount, transaction ID not matching..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowReject(false); setRejectReason(''); }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => rejectMutation.mutate({ id: selected.id, reason: rejectReason })}
                disabled={rejectMutation.isPending}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-5 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {rejectMutation.isPending ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Rejecting...</>
                ) : (
                  <><FiXCircle size={15} />Confirm Reject</>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PaymentApproval;
