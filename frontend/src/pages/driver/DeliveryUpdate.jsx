import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { FiMapPin, FiCamera, FiCheckCircle, FiTruck, FiArrowLeft, FiAlertCircle } from 'react-icons/fi';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import { SkeletonCard } from '../../components/common/LoadingSkeleton';
import { formatDateTime } from '../../utils/helpers';
import toast from 'react-hot-toast';

const STATUS_TRANSITIONS = {
  assigned:         ['picked_up'],
  picked_up:        ['in_transit'],
  in_transit:       ['out_for_delivery'],
  out_for_delivery: ['delivered', 'failed'],
};

const STATUS_LABELS = {
  picked_up:        'Mark as Picked Up',
  in_transit:       'Mark as In Transit',
  out_for_delivery: 'Out for Delivery',
  delivered:        'Mark as Delivered',
  failed:           'Mark as Failed',
};

const DeliveryUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const { data: shipment, isLoading } = useQuery({
    queryKey: ['shipment', id],
    queryFn: () => api.get(`/shipments/${id}`).then((r) => r.data.data),
    enabled: !!id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ status, note }) =>
      api.put(`/shipments/${id}/status`, { status, note }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries(['shipment', id]);
      queryClient.invalidateQueries(['driver-deliveries']);
      toast.success(`Status updated to: ${vars.status.replace(/_/g, ' ')}`);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const proofMutation = useMutation({
    mutationFn: (formData) =>
      api.post(`/shipments/${id}/proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['shipment', id]);
      toast.success('Proof of delivery uploaded!');
      navigate('/driver/deliveries');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Upload failed'),
  });

  const onProofSubmit = (data) => {
    const formData = new FormData();
    formData.append('deliveredTo', data.deliveredTo);
    if (data.notes) formData.append('notes', data.notes);
    if (proofFile) formData.append('photo', proofFile);
    proofMutation.mutate(formData);
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
  };

  if (isLoading) return (
    <div className="max-w-2xl mx-auto space-y-4">
      {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );

  if (!shipment) return (
    <div className="text-center py-20">
      <p className="text-gray-500 mb-4">Shipment not found</p>
      <Link to="/driver/deliveries" className="btn-secondary">← Back</Link>
    </div>
  );

  const nextStatuses = STATUS_TRANSITIONS[shipment.status] || [];

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/driver/deliveries" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-500">
          <FiArrowLeft size={18} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Delivery Update</h1>
        <StatusBadge status={shipment.status} />
      </div>

      {/* Shipment info */}
      <div className="card">
        <p className="font-mono text-primary-500 font-semibold mb-3">{shipment.trackingNumber}</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <FiMapPin className="text-green-500 mt-0.5 flex-shrink-0" size={14} />
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Pickup</p>
              <p className="font-medium text-gray-900 dark:text-white">{shipment.pickupCity}</p>
              <p className="text-xs text-gray-500">{shipment.pickupAddress}</p>
              {shipment.pickupContactName && (
                <p className="text-xs text-gray-400">{shipment.pickupContactName} · {shipment.pickupContactPhone}</p>
              )}
            </div>
          </div>
          <div className="flex items-start gap-2">
            <FiMapPin className="text-red-500 mt-0.5 flex-shrink-0" size={14} />
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Delivery</p>
              <p className="font-medium text-gray-900 dark:text-white">{shipment.destCity}</p>
              <p className="text-xs text-gray-500">{shipment.destAddress}</p>
              {shipment.destContactName && (
                <p className="text-xs text-gray-400">{shipment.destContactName} · {shipment.destContactPhone}</p>
              )}
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-dark-700 text-sm flex gap-4">
          <span className="text-gray-500">Cargo: <span className="font-medium text-gray-900 dark:text-white">{shipment.cargoDescription}</span></span>
          <span className="text-gray-500">Weight: <span className="font-medium">{shipment.cargoWeight} kg</span></span>
          <span className={`badge text-xs ${shipment.priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
            {shipment.priority}
          </span>
        </div>
      </div>

      {/* Status update buttons */}
      {nextStatuses.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Update Status</h3>
          <div className="flex flex-wrap gap-3">
            {nextStatuses.map((status) => (
              <button
                key={status}
                onClick={() => updateStatusMutation.mutate({
                  status,
                  note: `Status updated to ${status.replace(/_/g, ' ')}`,
                })}
                disabled={updateStatusMutation.isPending}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  status === 'failed'
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'btn-primary'
                }`}
              >
                {status === 'failed' ? <FiAlertCircle size={15} /> : <FiTruck size={15} />}
                {STATUS_LABELS[status] || status}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Proof of delivery */}
      {shipment.status === 'out_for_delivery' && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Upload Proof of Delivery</h3>
          <form onSubmit={handleSubmit(onProofSubmit)} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Delivered To *
              </label>
              <input
                {...register('deliveredTo', { required: 'Recipient name is required' })}
                className={`input-field ${errors.deliveredTo ? 'border-red-400' : ''}`}
                placeholder="Recipient name"
              />
              {errors.deliveredTo && (
                <p className="text-red-500 text-xs mt-1">{errors.deliveredTo.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Delivery Photo
              </label>
              {proofPreview ? (
                <div className="relative rounded-xl overflow-hidden border border-gray-200">
                  <img src={proofPreview} alt="Proof" className="w-full max-h-48 object-cover" />
                  <button
                    type="button"
                    onClick={() => { setProofFile(null); setProofPreview(null); }}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                  >✕</button>
                </div>
              ) : (
                <label className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-200 dark:border-dark-600 rounded-xl cursor-pointer hover:border-primary-300 transition-colors">
                  <FiCamera className="text-gray-400" size={20} />
                  <span className="text-sm text-gray-500">Click to upload delivery photo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
                </label>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
              <textarea
                {...register('notes')}
                rows={2}
                className="input-field resize-none"
                placeholder="Any delivery notes..."
              />
            </div>

            <button
              type="submit"
              disabled={proofMutation.isPending}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {proofMutation.isPending ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Uploading...</>
              ) : (
                <><FiCheckCircle size={16} />Confirm Delivery</>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Already delivered */}
      {shipment.status === 'delivered' && shipment.podTimestamp && (
        <div className="card bg-green-50 dark:bg-green-900/20 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <FiCheckCircle className="text-green-500" size={18} />
            <h3 className="font-semibold text-green-700 dark:text-green-400">Delivery Confirmed</h3>
          </div>
          {shipment.podDeliveredTo && (
            <p className="text-sm text-gray-600 dark:text-gray-400">Delivered to: <span className="font-medium">{shipment.podDeliveredTo}</span></p>
          )}
          {shipment.podPhoto && (
            <img src={shipment.podPhoto} alt="Proof" className="mt-3 rounded-xl max-h-48 object-cover w-full" />
          )}
        </div>
      )}

      {/* Status history */}
      {shipment.statusHistory?.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Status History</h3>
          <div className="space-y-2">
            {[...shipment.statusHistory].reverse().map((h, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
                <div>
                  <span className="font-medium capitalize text-gray-900 dark:text-white">
                    {h.status?.replace(/_/g, ' ')}
                  </span>
                  {h.note && <span className="text-gray-500 ml-2 text-xs">— {h.note}</span>}
                  <p className="text-xs text-gray-400">{formatDateTime(h.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryUpdate;
