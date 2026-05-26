import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiPackage, FiUser, FiTruck, FiCheckCircle } from 'react-icons/fi';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { SkeletonTable } from '../../components/common/LoadingSkeleton';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const ShipmentAssignment = () => {
  const queryClient = useQueryClient();
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');

  const { data: shipmentsData, isLoading } = useQuery({
    queryKey: ['unassigned-shipments'],
    queryFn: () => api.get('/shipments?status=pending&limit=20').then((r) => r.data),
  });

  const { data: driversData } = useQuery({
    queryKey: ['available-drivers'],
    queryFn: () => api.get('/users/drivers?available=true').then((r) => r.data),
  });

  const { data: vehiclesData } = useQuery({
    queryKey: ['available-vehicles'],
    queryFn: () => api.get('/vehicles?status=available').then((r) => r.data),
  });

  const assignMutation = useMutation({
    mutationFn: ({ shipmentId, driverId, vehicleId }) =>
      api.put(`/shipments/${shipmentId}/assign`, { driverId, vehicleId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['unassigned-shipments']);
      toast.success('Shipment assigned successfully!');
      setSelectedShipment(null);
      setSelectedDriver('');
      setSelectedVehicle('');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Assignment failed'),
  });

  const shipments = shipmentsData?.data || [];
  const drivers = driversData?.data || [];
  const vehicles = vehiclesData?.data || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shipment Assignment</h1>

      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Pending Shipments</h3>
        {isLoading ? (
          <SkeletonTable />
        ) : shipments.length === 0 ? (
          <div className="text-center py-12">
            <FiCheckCircle className="mx-auto text-green-400 mb-3" size={40} />
            <p className="text-gray-500">All shipments are assigned!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-dark-700">
                  {['Tracking #', 'Customer', 'Route', 'Cargo', 'Priority', 'Date', 'Action'].map((h) => (
                    <th key={h} className="text-left py-3 px-2 text-gray-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shipments.map((s) => (
                  <tr key={s._id} className="border-b border-gray-50 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700">
                    <td className="py-3 px-2 font-mono text-xs text-primary-500">{s.trackingNumber}</td>
                    <td className="py-3 px-2 text-xs">{s.customer?.firstName} {s.customer?.lastName}</td>
                    <td className="py-3 px-2 text-xs">
                      <div>{s.pickup?.city}</div>
                      <div className="text-gray-400">→ {s.destination?.city}</div>
                    </td>
                    <td className="py-3 px-2 text-xs text-gray-500">{s.cargo?.weight} kg</td>
                    <td className="py-3 px-2">
                      <span className={`badge text-xs ${s.priority === 'urgent' ? 'bg-red-100 text-red-700' : s.priority === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                        {s.priority}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-xs text-gray-500">{formatDate(s.createdAt)}</td>
                    <td className="py-3 px-2">
                      <button
                        onClick={() => setSelectedShipment(s)}
                        className="btn-primary text-xs py-1.5 px-3"
                      >
                        Assign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      <Modal isOpen={!!selectedShipment} onClose={() => setSelectedShipment(null)} title="Assign Shipment">
        {selectedShipment && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-dark-700 rounded-xl p-4">
              <p className="font-mono text-primary-500 font-semibold">{selectedShipment.trackingNumber}</p>
              <p className="text-sm text-gray-600 mt-1">{selectedShipment.pickup?.city} → {selectedShipment.destination?.city}</p>
              <p className="text-xs text-gray-500">{selectedShipment.cargo?.weight} kg · {selectedShipment.cargo?.description}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FiUser className="inline mr-1" size={14} /> Select Driver *
              </label>
              <select value={selectedDriver} onChange={(e) => setSelectedDriver(e.target.value)} className="input-field">
                <option value="">Choose a driver...</option>
                {drivers.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.firstName} {d.lastName} · ★{d.rating || 'N/A'} · {d.totalDeliveries} deliveries
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FiTruck className="inline mr-1" size={14} /> Select Vehicle *
              </label>
              <select value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)} className="input-field">
                <option value="">Choose a vehicle...</option>
                {vehicles.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.plateNumber} · {v.brand} {v.model} · {v.capacity} kg
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setSelectedShipment(null)} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={() => assignMutation.mutate({ shipmentId: selectedShipment._id, driverId: selectedDriver, vehicleId: selectedVehicle })}
                disabled={!selectedDriver || !selectedVehicle || assignMutation.isLoading}
                className="btn-primary flex-1"
              >
                {assignMutation.isLoading ? 'Assigning...' : 'Confirm Assignment'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ShipmentAssignment;
