import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  FiUsers, FiSearch, FiStar, FiTruck, FiPackage,
  FiUserX, FiUserCheck, FiLink, FiInfo, FiMapPin,
} from 'react-icons/fi';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import { SkeletonCard } from '../../components/common/LoadingSkeleton';
import { getInitials, formatDate, formatCurrency } from '../../utils/helpers';
import { getSocket } from '../../services/socketService';
import toast from 'react-hot-toast';

const ManageDrivers = () => {
  const queryClient = useQueryClient();
  const [search,      setSearch]      = useState('');
  const [onlineOnly,  setOnlineOnly]  = useState(false);
  const [selected,    setSelected]    = useState(null);   // driver detail modal
  const [assignModal, setAssignModal] = useState(null);   // driver to assign vehicle
  const [selectedVehicle, setSelectedVehicle] = useState('');
  // Live online status updates via socket
  const [onlineMap, setOnlineMap] = useState({});

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['drivers', search],
    queryFn: () =>
      api.get(`/users/drivers${search ? `?search=${encodeURIComponent(search)}` : ''}`)
        .then((r) => r.data),
    refetchInterval: 60000,
  });

  const { data: statsData } = useQuery({
    queryKey: ['driver-stats', selected?.id],
    queryFn: () => api.get(`/users/drivers/${selected.id}/stats`).then((r) => r.data.data),
    enabled: !!selected,
  });

  const { data: vehiclesData } = useQuery({
    queryKey: ['available-vehicles-assign'],
    queryFn: () => api.get('/vehicles?status=available').then((r) => r.data),
    enabled: !!assignModal,
  });

  // Listen for real-time availability changes
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = ({ driverId, isOnline }) => {
      setOnlineMap((prev) => ({ ...prev, [driverId]: isOnline }));
    };
    socket.on('driverAvailabilityChange', handler);
    return () => socket.off('driverAvailabilityChange', handler);
  }, []);

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }) => api.put(`/users/${id}`, { isActive }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries(['drivers']);
      toast.success(vars.isActive ? 'Driver activated' : 'Driver deactivated');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const assignVehicleMutation = useMutation({
    mutationFn: ({ vehicleId, driverId }) =>
      api.put(`/vehicles/${vehicleId}/assign-driver`, { driverId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['drivers']);
      queryClient.invalidateQueries(['available-vehicles-assign']);
      toast.success('Vehicle assigned to driver!');
      setAssignModal(null);
      setSelectedVehicle('');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Assignment failed'),
  });

  const drivers = (data?.data || []).filter((d) =>
    onlineOnly ? (onlineMap[d.id] ?? d.isOnline) : true
  );

  const isOnline = (driver) => onlineMap[driver.id] ?? driver.isOnline;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Drivers</h1>
        <span className="badge bg-blue-100 text-blue-700">{data?.count || 0} total</span>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or phone..."
              className="input-field pl-9"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlineOnly}
              onChange={(e) => setOnlineOnly(e.target.checked)}
              className="w-4 h-4 accent-primary-500"
            />
            Online only
          </label>
        </div>
      </div>

      {/* Driver cards */}
      <div className="card">
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : drivers.length === 0 ? (
          <div className="text-center py-12">
            <FiUsers className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500">No drivers found</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {drivers.map((driver) => {
              const online = isOnline(driver);
              return (
                <motion.div
                  key={driver.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-gray-50 dark:bg-dark-700 rounded-xl p-4 border-2 transition-colors ${
                    online ? 'border-green-200 dark:border-green-800' : 'border-transparent'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-11 h-11 rounded-full bg-primary-100 flex items-center justify-center">
                        {driver.avatar ? (
                          <img src={driver.avatar} alt="" className="w-11 h-11 rounded-full object-cover" />
                        ) : (
                          <span className="text-primary-600 font-semibold text-sm">
                            {getInitials(driver.firstName, driver.lastName)}
                          </span>
                        )}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                        online ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                        {driver.firstName} {driver.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{driver.phone}</p>
                      <span className={`text-xs font-medium ${online ? 'text-green-600' : 'text-gray-400'}`}>
                        {online ? '● Online' : '○ Offline'}
                      </span>
                    </div>
                    <span className={`badge text-xs ${driver.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {driver.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                    <div className="bg-white dark:bg-dark-800 rounded-lg p-2">
                      <div className="flex items-center justify-center gap-0.5 text-yellow-500 mb-0.5">
                        <FiStar size={11} />
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {driver.rating ? Number(driver.rating).toFixed(1) : 'N/A'}
                        </span>
                      </div>
                      <p className="text-gray-400">Rating</p>
                    </div>
                    <div className="bg-white dark:bg-dark-800 rounded-lg p-2">
                      <div className="flex items-center justify-center gap-0.5 mb-0.5">
                        <FiPackage size={11} className="text-primary-500" />
                        <span className="font-semibold text-gray-900 dark:text-white">{driver.totalDeliveries || 0}</span>
                      </div>
                      <p className="text-gray-400">Trips</p>
                    </div>
                    <div className="bg-white dark:bg-dark-800 rounded-lg p-2">
                      <div className="flex items-center justify-center gap-0.5 mb-0.5">
                        <FiTruck size={11} className="text-blue-500" />
                        <span className="font-semibold text-gray-900 dark:text-white text-xs">
                          {driver.vehicleAssigned?.plateNumber || '—'}
                        </span>
                      </div>
                      <p className="text-gray-400">Vehicle</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelected(driver)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 text-xs font-medium transition-colors"
                    >
                      <FiInfo size={12} /> Details
                    </button>
                    <button
                      onClick={() => { setAssignModal(driver); setSelectedVehicle(''); }}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-medium transition-colors"
                    >
                      <FiLink size={12} /> Assign Vehicle
                    </button>
                    <button
                      onClick={() => toggleActiveMutation.mutate({ id: driver.id, isActive: !driver.isActive })}
                      className={`p-1.5 rounded-lg text-xs transition-colors ${
                        driver.isActive
                          ? 'bg-red-50 text-red-500 hover:bg-red-100'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                      title={driver.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {driver.isActive ? <FiUserX size={14} /> : <FiUserCheck size={14} />}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Driver Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Driver Details" size="md">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                {selected.avatar ? (
                  <img src={selected.avatar} alt="" className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <span className="text-primary-600 font-bold text-xl">{getInitials(selected.firstName, selected.lastName)}</span>
                )}
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white text-lg">{selected.firstName} {selected.lastName}</p>
                <p className="text-gray-500 text-sm">{selected.email}</p>
                <p className="text-gray-500 text-sm">{selected.phone}</p>
              </div>
            </div>

            {/* Performance stats */}
            {statsData && (
              <div className="bg-gray-50 dark:bg-dark-700 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Performance</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-400 text-xs">Total Trips</span><p className="font-bold text-gray-900 dark:text-white">{statsData.total}</p></div>
                  <div><span className="text-gray-400 text-xs">Delivered</span><p className="font-bold text-green-600">{statsData.delivered}</p></div>
                  <div><span className="text-gray-400 text-xs">In Transit</span><p className="font-bold text-orange-500">{statsData.inTransit}</p></div>
                  <div><span className="text-gray-400 text-xs">Failed</span><p className="font-bold text-red-500">{statsData.failed}</p></div>
                  <div className="col-span-2">
                    <span className="text-gray-400 text-xs">Success Rate</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${statsData.successRate}%` }} />
                      </div>
                      <span className="font-bold text-green-600 text-sm">{statsData.successRate}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Driver info */}
            <div className="bg-gray-50 dark:bg-dark-700 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Driver Info</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-400 text-xs">Rating</span><p className="font-semibold">{selected.rating ? Number(selected.rating).toFixed(1) : 'N/A'} ★</p></div>
                <div><span className="text-gray-400 text-xs">Earnings</span><p className="font-semibold">{formatCurrency(selected.earnings || 0)}</p></div>
                {selected.licenseNumber && (
                  <div><span className="text-gray-400 text-xs">License</span><p className="font-semibold">{selected.licenseNumber}</p></div>
                )}
                {selected.licenseExpiry && (
                  <div><span className="text-gray-400 text-xs">License Expiry</span><p className="font-semibold">{formatDate(selected.licenseExpiry)}</p></div>
                )}
                <div><span className="text-gray-400 text-xs">Assigned Vehicle</span><p className="font-semibold">{selected.vehicleAssigned?.plateNumber || 'None'}</p></div>
                <div><span className="text-gray-400 text-xs">Joined</span><p className="font-semibold">{formatDate(selected.createdAt)}</p></div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Assign Vehicle Modal */}
      <Modal isOpen={!!assignModal} onClose={() => { setAssignModal(null); setSelectedVehicle(''); }} title="Assign Vehicle to Driver" size="sm">
        {assignModal && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-dark-700 rounded-xl p-3">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{assignModal.firstName} {assignModal.lastName}</p>
              <p className="text-xs text-gray-500">Current vehicle: {assignModal.vehicleAssigned?.plateNumber || 'None'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Available Vehicle</label>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {(vehiclesData?.data || []).length === 0 ? (
                  <p className="text-center text-gray-500 text-sm py-4">No available vehicles</p>
                ) : (
                  (vehiclesData?.data || []).map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVehicle(String(v.id))}
                      className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                        selectedVehicle === String(v.id)
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-dark-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-mono font-semibold text-sm text-gray-900 dark:text-white">{v.plateNumber}</p>
                          <p className="text-xs text-gray-500 capitalize">{v.brand} {v.model} · {v.type}</p>
                        </div>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">{v.capacity} kg</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setAssignModal(null); setSelectedVehicle(''); }} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={() => assignVehicleMutation.mutate({ vehicleId: Number(selectedVehicle), driverId: assignModal.id })}
                disabled={!selectedVehicle || assignVehicleMutation.isPending}
                className="btn-primary flex-1"
              >
                {assignVehicleMutation.isPending ? 'Assigning...' : 'Assign Vehicle'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageDrivers;
