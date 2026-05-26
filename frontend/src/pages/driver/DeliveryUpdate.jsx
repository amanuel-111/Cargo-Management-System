import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { FiMapPin, FiCamera, FiCheckCircle, FiTruck } from 'react-icons/fi';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { formatDateTime } from '../../utils/helpers';
import toast from 'react-hot-toast';

const statusTransitions = {
  assigned: ['picked_up'],
  picked_up: ['in_transit'],
  in_transit: ['out_for_delivery'],
  out_for_delivery: ['delivered', 'failed'],
};

const DeliveryUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [proofFile, setProofFile] = useState(null);
  const { register, handleSubmit } = useForm();

  const { data: shipment, isLoading } = useQuery({
    queryKey: ['shipment', id],
    queryFn: () => api.get(`/shipments/${id}`).then((r) => r.data.data),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ status, note }) => api.put(`/shipments/${id}/status`, { status, note }),
    onSuccess: () => {
      queryClient.invalidateQueries(['shipment', id]);
      queryClient.invalidateQueries(['driver-deliveries']);
      toast.success('Status updated!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const proofMutation = useMutation({
    mutationFn: (formData) => api.post(`/shipments/${id}/proof`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
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
    formData.append('notes', data.notes || '');
    if (proofFile) formData.append('photo', proofFile);
    proofMutation.mutate(formData);
  };

  if (isLoading) return <LoadingSkeleton />;
  if (!shipment) return <div className="text-center py-12 text-gray-500">Shipment not found</div>;

  const nextStatuses = statusTransitions[shipment.status] || [];

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Delivery Update</h1>
        <StatusBadge status={shipment.status} />
      </div>

      {/* Shipment info */}
      <div className="card">
        <p className="font-mono text-primary-500 font-semibold mb-3">{shipment.trackingNumber}</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <FiMapPin className="text-green-500 mt-0.5" size={14} />
            <div>
              <p className="text-xs text-gray-500">Pickup</p>
              <p className="font-medium">{shipment.pickup?.city}</p>
              <p className="text-xs text-gray-400">{shipment.pickup?.address}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <FiMapPin className="text-red-500 mt-0.5" size={14} />
            <div>
              <p className="text-xs text-gray-500">Delivery</p>
              <p className="font-medium">{shipment.destination?.city}</p>
              <p className="text-xs text-gray-400">{shipment.destination?.address}</p>
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-dark-700 text-sm">
          <span className="text-gray-500">Cargo: </span>
          <span className="font-medium">{shipment.cargo?.description}</span>
          <span className="text-gray-400 ml-2">({shipment.cargo?.weight} kg)</span>
        </div>
      </div>

      {/* Status update */}
      {nextStatuses.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Update Status</h3>
          <div className="flex flex-wrap gap-3">
            {nextStatuses.map((status) => (
              <button
                key={status}
                onClick={() => updateStatusMutation.mutate({ status, note: `Status updated to ${status}` })}
                disabled={updateStatusMutation.isLoading}
                className="btn-primary flex items-center gap-2"
              >
                <FiTruck size={16} />
                Mark as {status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Proof of delivery */}
      {shipment.status === 'out_for_delivery' && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Upload Proof of Delivery</h3>
          <form onSubmit={handleSubmit(onProofSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Delivered To *</label>
              <input {...register('deliveredTo', { required: true })} className="input-field" placeholder="Recipient name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Delivery Photo</label>
              <label className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-200 dark:border-dark-600 rounded-xl cursor-pointer hover:border-primary-300 transition-colors">
                <FiCamera className="text-gray-400" size={20} />
                <span className="text-sm text-gray-500">{proofFile ? proofFile.name : 'Click to upload photo'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setProofFile(e.target.files[0])} />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
              <textarea {...register('notes')} rows={2} className="input-field resize-none" placeholder="Any delivery notes..." />
            </div>
            <button type="submit" disabled={proofMutation.isLoading} className="btn-primary w-full flex items-center justify-center gap-2">
              <FiCheckCircle size={16} />
              {proofMutation.isLoading ? 'Uploading...' : 'Confirm Delivery'}
            </button>
          </form>
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
                  <span className="font-medium capitalize">{h.status?.replace(/_/g, ' ')}</span>
                  {h.note && <span className="text-gray-500 ml-2">- {h.note}</span>}
                  <p className="text-xs text-gray-400">{formatDateTime(h.timestamp)}</p>
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
