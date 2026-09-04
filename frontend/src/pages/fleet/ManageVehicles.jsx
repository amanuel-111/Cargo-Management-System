import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { FiTruck, FiPlus, FiSearch, FiFilter, FiEdit2, FiTool, FiLink } from 'react-icons/fi';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { SkeletonTable } from '../../components/common/LoadingSkeleton';
import toast from 'react-hot-toast';

const VEHICLE_TYPES    = ['truck','van','pickup','motorcycle','trailer','container'];
const FUEL_TYPES       = ['diesel','petrol','electric','hybrid'];
const VEHICLE_STATUSES = ['available','in_transit','maintenance','inactive'];

// ── Standalone form component (outside parent to avoid re-mount) ──
const VehicleForm = ({ onSubmit, loading, submitLabel, showStatus, onCancel, defaultValues }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plate Number *</label>
          <input
            {...register('plateNumber', { required: 'Required' })}
            className={`input-field ${errors.plateNumber ? 'border-red-400' : ''}`}
            placeholder="AA-12345"
          />
          {errors.plateNumber && <p className="text-red-500 text-xs mt-1">{errors.plateNumber.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
          <select {...register('type', { required: true })} className="input-field">
            {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand *</label>
          <input {...register('brand', { required: 'Required' })} className={`input-field ${errors.brand ? 'border-red-400' : ''}`} placeholder="Isuzu" />
          {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Model *</label>
          <input {...register('model', { required: 'Required' })} className={`input-field ${errors.model ? 'border-red-400' : ''}`} placeholder="NPR" />
          {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year *</label>
          <input
            {...register('year', { required: 'Required', min: { value: 1990, message: 'Min 1990' } })}
            type="number"
            className={`input-field ${errors.year ? 'border-red-400' : ''}`}
            placeholder="2020"
          />
          {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capacity (kg) *</label>
          <input
            {...register('capacity', { required: 'Required', min: { value: 1, message: 'Min 1' } })}
            type="number"
            className={`input-field ${errors.capacity ? 'border-red-400' : ''}`}
            placeholder="5000"
          />
          {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fuel Type</label>
          <select {...register('fuelType')} className="input-field">
            {FUEL_TYPES.map((f) => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Traccar Device ID (GPS)</label>
        <input
          {...register('traccarDeviceId')}
          className="input-field"
          placeholder="e.g. 123456 (Unique Device Identifier)"
        />
        <p className="text-xs text-gray-500 mt-1">Leave blank if this vehicle does not have a GPS tracker installed.</p>
      </div>

      {showStatus && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <select {...register('status')} className="input-field">
            {VEHICLE_STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
};

// ── Main component ────────────────────────────────────────────
const ManageVehicles = () => {
  const queryClient = useQueryClient();
  const [search,        setSearch]        = useState('');
  const [statusFilter,  setStatusFilter]  = useState('available');
  const [showAdd,       setShowAdd]       = useState(false);
  const [editVehicle,   setEditVehicle]   = useState(null);
  const [assignVehicle, setAssignVehicle] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['vehicles', search, statusFilter],
    queryFn: () =>
      api.get(`/vehicles?search=${encodeURIComponent(search)}&status=${statusFilter}`)
        .then((r) => r.data),
  });

  const { data: driversData } = useQuery({
    queryKey: ['drivers-for-assign'],
    queryFn: () => api.get('/users/drivers').then((r) => r.data),
    enabled: !!assignVehicle,
  });

  const createMutation = useMutation({
    mutationFn: (d) => api.post('/vehicles', d),
    onSuccess: () => {
      queryClient.invalidateQueries(['vehicles']);
      toast.success('Vehicle added!');
      setShowAdd(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to add vehicle'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...d }) => api.put(`/vehicles/${id}`, d),
    onSuccess: () => {
      queryClient.invalidateQueries(['vehicles']);
      toast.success('Vehicle updated!');
      setEditVehicle(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const assignDriverMutation = useMutation({
    mutationFn: ({ vehicleId, driverId }) =>
      api.put(`/vehicles/${vehicleId}/assign-driver`, { driverId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['vehicles']);
      toast.success('Driver assigned!');
      setAssignVehicle(null);
      setSelectedDriver('');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Assignment failed'),
  });

  const vehicles = data?.data || [];

  // Status badge color overrides for vehicle statuses
  const statusColor = (s) => ({
    available:   'bg-green-100 text-green-700',
    in_transit:  'bg-orange-100 text-orange-700',
    maintenance: 'bg-yellow-100 text-yellow-700',
    inactive:    'bg-gray-100 text-gray-500',
  }[s] || 'bg-gray-100 text-gray-600');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Vehicles</h1>
          <p className="text-gray-500 text-sm mt-1">{data?.total || 0} vehicles in fleet</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <FiPlus size={16} /> Add Vehicle
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Available',    status: 'available',   color: 'bg-green-50  border-green-200  text-green-700'  },
          { label: 'In Transit',   status: 'in_transit',  color: 'bg-orange-50 border-orange-200 text-orange-700' },
          { label: 'Maintenance',  status: 'maintenance', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
          { label: 'Inactive',     status: 'inactive',    color: 'bg-gray-50   border-gray-200   text-gray-600'   },
        ].map(({ label, status, color }) => {
          const count = vehicles.filter((v) => v.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? '' : status)}
              className={`rounded-xl p-3 border-2 text-center transition-all ${color} ${statusFilter === status ? 'ring-2 ring-offset-1 ring-current' : ''}`}
            >
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs font-medium mt-0.5">{label}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
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
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-44">
              <option value="">All Status</option>
              {VEHICLE_STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Vehicle table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <SkeletonTable rows={5} />
        ) : vehicles.length === 0 ? (
          <div className="text-center py-16">
            <FiTruck className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-500 font-medium">No vehicles found</p>
            <p className="text-gray-400 text-sm mt-1">
              {search || statusFilter ? 'Try adjusting your filters' : 'Add your first vehicle to get started'}
            </p>
            {!search && !statusFilter && (
              <button onClick={() => setShowAdd(true)} className="btn-primary mt-4 inline-flex items-center gap-2 text-sm">
                <FiPlus size={14} /> Add Vehicle
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-dark-700 bg-gray-50 dark:bg-dark-800">
                  {['Plate', 'Type', 'Brand / Model', 'Year', 'Capacity', 'Fuel', 'Assigned Driver', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left py-3 px-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-dark-700">
                {vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-primary-600 dark:text-primary-400">{v.plateNumber}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="capitalize text-gray-700 dark:text-gray-300">{v.type}</span>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-medium text-gray-900 dark:text-white">{v.brand} {v.model}</p>
                    </td>
                    <td className="py-3 px-3 text-gray-500">{v.year}</td>
                    <td className="py-3 px-3">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{Number(v.capacity).toLocaleString()} kg</span>
                    </td>
                    <td className="py-3 px-3 capitalize text-gray-500">{v.fuelType}</td>
                    <td className="py-3 px-3">
                      {v.assignedDriver ? (
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-xs">
                            {v.assignedDriver.firstName} {v.assignedDriver.lastName}
                          </p>
                          <p className="text-gray-400 text-xs">{v.assignedDriver.phone}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`badge text-xs font-medium ${statusColor(v.status)}`}>
                        {v.status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditVehicle(v)}
                          className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 text-primary-500 transition-colors"
                          title="Edit vehicle"
                        >
                          <FiEdit2 size={13} />
                        </button>
                        <button
                          onClick={() => { setAssignVehicle(v); setSelectedDriver(''); }}
                          className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-colors"
                          title="Assign driver"
                        >
                          <FiLink size={13} />
                        </button>
                        <button
                          onClick={() => updateMutation.mutate({
                            id: v.id,
                            status: v.status === 'maintenance' ? 'available' : 'maintenance',
                          })}
                          className={`p-1.5 rounded-lg transition-colors ${
                            v.status === 'maintenance'
                              ? 'hover:bg-green-50 text-green-600'
                              : 'hover:bg-yellow-50 text-yellow-600'
                          }`}
                          title={v.status === 'maintenance' ? 'Mark available' : 'Send to maintenance'}
                        >
                          <FiTool size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Vehicle Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Vehicle">
        <VehicleForm
          key="add"
          onSubmit={(d) => createMutation.mutate(d)}
          loading={createMutation.isPending}
          submitLabel="Add Vehicle"
          showStatus={false}
          onCancel={() => setShowAdd(false)}
          defaultValues={{ type: 'truck', fuelType: 'diesel' }}
        />
      </Modal>

      {/* Edit Vehicle Modal */}
      <Modal isOpen={!!editVehicle} onClose={() => setEditVehicle(null)} title="Edit Vehicle">
        {editVehicle && (
          <VehicleForm
            key={`edit-${editVehicle.id}`}
            onSubmit={(d) => updateMutation.mutate({ id: editVehicle.id, ...d })}
            loading={updateMutation.isPending}
            submitLabel="Save Changes"
            showStatus={true}
            onCancel={() => setEditVehicle(null)}
            defaultValues={{
              plateNumber: editVehicle.plateNumber,
              type:        editVehicle.type,
              brand:       editVehicle.brand,
              model:       editVehicle.model,
              year:        editVehicle.year,
              capacity:    editVehicle.capacity,
              fuelType:    editVehicle.fuelType,
              status:      editVehicle.status,
              traccarDeviceId: editVehicle.traccarDeviceId,
            }}
          />
        )}
      </Modal>

      {/* Assign Driver Modal */}
      <Modal isOpen={!!assignVehicle} onClose={() => { setAssignVehicle(null); setSelectedDriver(''); }} title="Assign Driver to Vehicle" size="sm">
        {assignVehicle && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-dark-700 rounded-xl p-3">
              <p className="font-mono font-bold text-primary-600">{assignVehicle.plateNumber}</p>
              <p className="text-xs text-gray-500">{assignVehicle.brand} {assignVehicle.model} · {Number(assignVehicle.capacity).toLocaleString()} kg</p>
              <p className="text-xs text-gray-400 mt-1">
                Current driver: {assignVehicle.assignedDriver
                  ? `${assignVehicle.assignedDriver.firstName} ${assignVehicle.assignedDriver.lastName}`
                  : 'None'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Driver</label>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {(driversData?.data || []).length === 0 ? (
                  <p className="text-center text-gray-500 text-sm py-4">No drivers available</p>
                ) : (
                  (driversData?.data || []).map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setSelectedDriver(String(d.id))}
                      className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                        selectedDriver === String(d.id)
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-dark-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{d.firstName} {d.lastName}</p>
                          <p className="text-xs text-gray-500">{d.phone}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{d.totalDeliveries || 0} trips</p>
                          <span className={`text-xs font-medium ${d.isOnline ? 'text-green-600' : 'text-gray-400'}`}>
                            {d.isOnline ? '● Online' : '○ Offline'}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setAssignVehicle(null); setSelectedDriver(''); }} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={() => assignDriverMutation.mutate({ vehicleId: assignVehicle.id, driverId: Number(selectedDriver) })}
                disabled={!selectedDriver || assignDriverMutation.isPending}
                className="btn-primary flex-1"
              >
                {assignDriverMutation.isPending ? 'Assigning...' : 'Assign Driver'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageVehicles;
