import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { FiTruck, FiPlus, FiSearch } from 'react-icons/fi';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { SkeletonTable } from '../../components/common/LoadingSkeleton';
import toast from 'react-hot-toast';

const ManageVehicles = () => {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['vehicles', search],
    queryFn: () => api.get(`/vehicles?search=${search}`).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/vehicles', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['vehicles']);
      toast.success('Vehicle added!');
      setShowModal(false);
      reset();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to add vehicle'),
  });

  const vehicles = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Vehicles</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <FiPlus size={16} /> Add Vehicle
        </button>
      </div>

      <div className="card">
        <div className="relative mb-4">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search vehicles..." className="input-field pl-9" />
        </div>

        {isLoading ? (
          <SkeletonTable />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-dark-700">
                  {['Plate', 'Type', 'Brand/Model', 'Capacity', 'Driver', 'Status'].map((h) => (
                    <th key={h} className="text-left py-3 px-2 text-gray-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v._id} className="border-b border-gray-50 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700">
                    <td className="py-3 px-2 font-mono font-semibold text-primary-500">{v.plateNumber}</td>
                    <td className="py-3 px-2 capitalize">{v.type}</td>
                    <td className="py-3 px-2">{v.brand} {v.model} ({v.year})</td>
                    <td className="py-3 px-2">{v.capacity} kg</td>
                    <td className="py-3 px-2 text-gray-500">
                      {v.assignedDriver ? `${v.assignedDriver.firstName} ${v.assignedDriver.lastName}` : 'Unassigned'}
                    </td>
                    <td className="py-3 px-2"><StatusBadge status={v.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {vehicles.length === 0 && (
              <div className="text-center py-12">
                <FiTruck className="mx-auto text-gray-300 mb-3" size={40} />
                <p className="text-gray-500">No vehicles found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Vehicle Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Vehicle">
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plate Number *</label>
              <input {...register('plateNumber', { required: true })} className="input-field" placeholder="AA-12345" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select {...register('type', { required: true })} className="input-field">
                {['truck', 'van', 'pickup', 'motorcycle', 'trailer', 'container'].map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
              <input {...register('brand', { required: true })} className="input-field" placeholder="Isuzu" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
              <input {...register('model', { required: true })} className="input-field" placeholder="NPR" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
              <input {...register('year', { required: true })} type="number" className="input-field" placeholder="2020" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (kg) *</label>
            <input {...register('capacity', { required: true })} type="number" className="input-field" placeholder="5000" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={createMutation.isLoading} className="btn-primary flex-1">
              {createMutation.isLoading ? 'Adding...' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageVehicles;
