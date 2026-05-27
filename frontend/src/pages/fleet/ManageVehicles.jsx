import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { FiTruck, FiPlus, FiSearch, FiFilter, FiEdit2, FiTool, FiLink } from 'react-icons/fi';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { SkeletonTable } from '../../components/common/LoadingSkeleton';
import toast from 'react-hot-toast';

const VEHICLE_TYPES   = ['truck','van','pickup','motorcycle','trailer','container'];
const FUEL_TYPES      = ['diesel','petrol','electric','hybrid'];
const VEHICLE_STATUSES = ['available','in_transit','maintenance','inactive'];

const ManageVehicles = () => {
  const queryClient = useQueryClient();
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAdd,      setShowAdd]      = useState(false);
  const [editVehicle,  setEditVehicle]  = useState(null);   // vehicle being edited
  const [assignVehicle, setAssignVehicle] = useState(null); // vehicle to assign driver
  const [selectedDriver, setSelectedDriver] = useState('');

  const addForm  = useForm();
  const editForm = useForm();

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
      addForm.reset();
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
      toast.success('Driver assigned to vehicle!');
      setAssignVehicle(null);
      setSelectedDriver('');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Assignment failed'),
  });

  const openEdit = (v) => {
    setEditVehicle(v);
    editForm.reset({
      plateNumber: v.plateNumber,
      type:        v.type,
      brand:       v.brand,
      model:       v.model,
      year:        v.year,
      capacity:    v.capacity,
      fuelType:    v.fuelType,
      status:      v.status,
    });
  };

  const vehicles = data?.data || [];

  const VehicleForm = ({ form, onSubmit, loading, submitLabel }) => (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Plate Number *</label>
          <input
            {...form.register('plateNumber', { required: 'Required' })}
            className={`input-field ${form.formState.errors.plateNumber ? 'border-red-400' : ''}`}
            placeholder="AA-12345"
          />
          {form.formState.errors.plateNumber && <p className="text-red-500 text-xs mt-1">{form.formState.errors.plateNumber.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
          <select {...form.register('type', { required: true })} className="input-field">
            {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
          <input {...form.register('brand', { required: 'Required' })} className={`input-field ${form.formState.errors.brand ? 'border-red-400' : ''}`} placeholder="Isuzu" />
          {form.formState.errors.brand && <p className="text-red-500 text-xs mt-1">{form.formState.errors.brand.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
          <input {...form.register('model', { required: 'Required' })} className={`input-field ${form.formState.errors.model ? 'border-red-400' : ''}`} placeholder="NPR" />
          {form.formState.errors.model && <p className="text-red-500 text-xs mt-1">{form.formState.errors.model.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
          <input
            {...form.register('year', { required: 'Required', min: { value: 1990, message: 'Min 1990' } })}
            type="number" className={`input-field ${form.formState.errors.year ? 'border-red-400' : ''}`} placeholder="2020"
          />
          {form.formState.errors.year && <p className="text-red-500 text-xs mt-1">{form.formState.errors.year.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (kg) *</label>
          <input
            {...form.register('capacity', { required: 'Required', min: { value: 1, message: 'Min 1' } })}
            type="number" className={`input-field ${form.formState.errors.capacity ? 'border-red-400' : ''}`} placeholder="5000"
          />
          {form.formState.errors.capacity && <p className="text-red-500 text-xs mt-1">{form.formState.errors.capacity.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
          <select {...form.register('fuelType')} className="input-field">
            {FUEL_TYPES.map((f) => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
          </select>
        </div>
      </div>
      {/* Status only shown in edit */}
      {editVehicle && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select {...form.register('status')} className="input-field">
            {VEHICLE_STATUSES.map((s) => <option key={s} value={s}>{s.replace('_',' ').replace(/\b\w/g,c=>c.toUpperCase())}</option>)}
          </select>
        </div>
      )}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => { setShowAdd(false); setEditVehicle(null); }} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Vehicles</h1>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <FiPlus size={16} /> Add Vehicle
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by plate, brand or model..." className="input-field pl-9" />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-400" size={16} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-40">
              <option value="">All Status</option>
              {VEHICLE_STATUSES.map((s) => <option key={s} value={s}>{s.replace('_',' ').replace(/\b\w/g,c=>c.toUpperCase())}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {isLoading ? <SkeletonTable /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-dark-700">
                  {['Plate','Type','Brand / Model','Year','Capacity','Fuel','Driver','Status','Actions'].map((h) => (
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
                    <td className="py-3 px-2 text-xs">
                      {v.assignedDriver
                        ? <span className="text-gray-700 dark:text-gray-300">{v.assignedDriver.firstName} {v.assignedDriver.lastName}</span>
                        : <span className="text-gray-400">Unassigned</span>
                      }
                    </td>
                    <td className="py-3 px-2"><StatusBadge status={v.status} /></td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(v)} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-500" title="Edit">
                          <FiEdit2 size={13} />
                        </button>
                        <button onClick={() => { setAssignVehicle(v); setSelectedDriver(''); }} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500" title="Assign driver">
                          <FiLink size={13} />
                        </button>
                        <button
                          onClick={() => updateMutation.mutate({ id: v.id, status: v.status === 'maintenance' ? 'available' : 'maintenance' })}
                          className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-600"
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
            {vehicles.length === 0 && (
              <div className="text-center py-12">
                <FiTruck className="mx-auto text-gray-300 mb-3" size={40} />
                <p className="text-gray-500">No vehicles found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); addForm.reset(); }} title="Add New Vehicle">
        <VehicleForm form={addForm} onSubmit={(d) => createMutation.mutate(d)} loading={createMutation.isPending} submitLabel="Add Vehicle" />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editVehicle} onClose={() => setEditVehicle(null)} title="Edit Vehicle">
        <VehicleForm form={editForm} onSubmit={(d) => updateMutation.mutate({ id: editVehicle.id, ...d })} loading={updateMutation.isPending} submitLabel="Save Changes" />
      </Modal>

      {/* Assign Driver Modal */}
      <Modal isOpen={!!assignVehicle} onClose={() => { setAssignVehicle(null); setSelectedDriver(''); }} title="Assign Driver to Vehicle" size="sm">
        {assignVehicle && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-dark-700 rounded-xl p-3">
              <p className="font-mono font-semibold text-primary-500">{assignVehicle.plateNumber}</p>
              <p className="text-xs text-gray-500">{assignVehicle.brand} {assignVehicle.model} · {assignVehicle.capacity} kg</p>
              <p className="text-xs text-gray-400 mt-1">Current driver: {assignVehicle.assignedDriver ? `${assignVehicle.assignedDriver.firstName} ${assignVehicle.assignedDriver.lastName}` : 'None'}</p>
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
