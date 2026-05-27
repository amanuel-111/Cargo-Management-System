import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { FiTruck, FiPlus, FiSearch, FiFilter } from 'react-icons/fi';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { SkeletonTable } from '../../components/common/LoadingSkeleton';
import toast from 'react-hot-toast';

const VEHICLE_TYPES = ['truck','van','pickup','motorcycle','trailer','container'];
const FUEL_TYPES    = ['diesel','petrol','electric','hybrid'];

const ManageVehicles = () => {
  const [search,    setSearch]    = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['vehicles', search, statusFilter],
    queryFn: () =>
      api.get(`/vehicles?search=${encodeURIComponent(search)}&status=${statusFilter}`)
        .then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/vehicles', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['vehicles']);
      toast.success('Vehicle added successfully!');
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
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by plate, brand or model..."
              className="input-field pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-400" size={16} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-40">
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="in_transit">In Transit</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <SkeletonTable />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-dark-700">
                  {['Plate', 'Type', 'Brand / Model', 'Year', 'Capacity', 'Fuel', 'Driver', 'Status'].map((h) => (
                    <th key={h} className="text-left py-3 px-2 text-gray-500 font-medium text-xs uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v.id} className="border-b border-gray-50 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700">
                    <td className="py-3 px-2 font-mono font-semibold text-primary-500">{v.plateNumber}</td>
                    <td className="py-3 px-2 capitalize text-gray-700 dark:text-gray-300">{v.type}</td>
                    <td className="py-3 px-2 text-gray-700 dark:text-gray-300">{v.brand} {v.model}</td>
                    <td className="py-3 px-2 text-gray-500">{v.year}</td>
                    <td className="py-3 px-2 text-gray-500">{v.capacity} kg</td>
                    <td className="py-3 px-2 capitalize text-gray-500">{v.fuelType}</td>
                    <td className="py-3 px-2 text-gray-500 text-xs">
                      {v.assignedDriver
                        ? `${v.assignedDriver.firstName} ${v.assignedDriver.lastName}`
                        : <span className="text-gray-400">Unassigned</span>
                      }
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
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); reset(); }} title="Add New Vehicle">
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plate Number *</label>
              <input
                {...register('plateNumber', { required: 'Required' })}
                className={`input-field ${errors.plateNumber ? 'border-red-400' : ''}`}
                placeholder="AA-12345"
              />
              {errors.plateNumber && <p className="text-red-500 text-xs mt-1">{errors.plateNumber.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select {...register('type', { required: true })} className="input-field">
                {VEHICLE_TYPES.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
              <input
                {...register('brand', { required: 'Required' })}
                className={`input-field ${errors.brand ? 'border-red-400' : ''}`}
                placeholder="Isuzu"
              />
              {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
              <input
                {...register('model', { required: 'Required' })}
                className={`input-field ${errors.model ? 'border-red-400' : ''}`}
                placeholder="NPR"
              />
              {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
              <input
                {...register('year', {
                  required: 'Required',
                  min: { value: 1990, message: 'Min 1990' },
                  max: { value: new Date().getFullYear() + 1, message: 'Invalid year' },
                })}
                type="number"
                className={`input-field ${errors.year ? 'border-red-400' : ''}`}
                placeholder="2020"
              />
              {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (kg) *</label>
              <input
                {...register('capacity', { required: 'Required', min: { value: 1, message: 'Min 1 kg' } })}
                type="number"
                className={`input-field ${errors.capacity ? 'border-red-400' : ''}`}
                placeholder="5000"
              />
              {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
              <select {...register('fuelType')} className="input-field">
                {FUEL_TYPES.map((f) => (
                  <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowModal(false); reset(); }} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={createMutation.isPending} className="btn-primary flex-1">
              {createMutation.isPending ? 'Adding...' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageVehicles;
