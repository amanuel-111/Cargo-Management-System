import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiPackage, FiUser, FiTruck, FiCheckCircle, FiAlertCircle, FiStar } from 'react-icons/fi';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { SkeletonTable } from '../../components/common/LoadingSkeleton';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const ShipmentAssignment = () => {
  const queryClient = useQueryClient();
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [selectedDriver,   setSelectedDriver]   = useState('');
  const [selectedVehicle,  setSelectedVehicle]  = useState('');

  // Fetch confirmed (paid) shipments that are not yet assigned
  const { data: shipmentsData, isLoading } = useQuery({
    queryKey: ['unassigned-shipments'],
    queryFn: () =>
      api.get('/shipments?status=confirmed&limit=50').then((r) => r.data),
  });

  // Also fetch pending (unpaid) so fleet manager can see them
  const { data: pendingData } = useQuery({
    queryKey: ['pending-shipments'],
    queryFn: () =>
      api.get('/shipments?status=pending&limit=50').then((r) => r.data),
  });

  // Available drivers (active, not currently on a delivery)
  const { data: driversData } = useQuery({
    queryKey: ['available-drivers'],
    queryFn: () =>
      api.get('/users/drivers').then((r) => r.data),
  });

  // Available vehicles
  const { data: vehiclesData } = useQuery({
    queryKey: ['available-vehicles'],
    queryFn: () =>
      api.get('/vehicles?status=available').then((r) => r.data),
  });

  const assignMutation = useMutation({
    mutationFn: ({ shipmentId, driverId, vehicleId }) =>
      api.put(`/shipments/${shipmentId}/assign`, { driverId, vehicleId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['unassigned-shipments']);
      queryClient.invalidateQueries(['available-drivers']);
      queryClient.invalidateQueries(['available-vehicles']);
      toast.success('Shipment assigned successfully!');
      setSelectedShipment(null);
      setSelectedDriver('');
      setSelectedVehicle('');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Assignment failed'),
  });

  const confirmed = shipmentsData?.data || [];
  const pending   = pendingData?.data   || [];
  const drivers   = driversData?.data   || [];
  const vehicles  = vehiclesData?.data  || [];

  const handleAssign = () => {
    if (!selectedDriver)  { toast.error('Please select a driver');  return; }
    if (!selectedVehicle) { toast.error('Please select a vehicle'); return; }
    assignMutation.mutate({
      shipmentId: selectedShipment.id,   // ✅ integer id, not _id
      driverId:   Number(selectedDriver),
      vehicleId:  Number(selectedVehicle),
    });
  };

  const ShipmentTable = ({ shipments, showAssign, emptyMsg, emptyIcon }) => (
    shipments.length === 0 ? (
      <div className="text-center py-10">
        {emptyIcon}
        <p className="text-gray-500 mt-2">{emptyMsg}</p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-dark-700">
              {['Tracking #', 'Customer', 'Route', 'Weight', 'Amount', 'Priority', 'Date', showAssign ? 'Action' : 'Status'].map((h) => (
                <th key={h} className="text-left py-3 px-2 text-gray-500 font-medium text-xs uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shipments.map((s) => (
              <tr key={s.id} className="border-b border-gray-50 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700">
                <td className="py-3 px-2 font-mono text-xs text-primary-500 font-semibold">{s.trackingNumber}</td>
                <td className="py-3 px-2 text-xs">
                  {s.customer?.firstName} {s.customer?.lastName}
                  <div className="text-gray-400">{s.customer?.phone}</div>
                </td>
                <td className="py-3 px-2 text-xs">
                  <div className="font-medium">{s.pickupCity}</div>
                  <div className="text-gray-400">→ {s.destCity}</div>
                </td>
                <td className="py-3 px-2 text-xs text-gray-600">{s.cargoWeight} kg</td>
                <td className="py-3 px-2 text-xs font-semibold text-gray-900 dark:text-white">
                  ETB {Number(s.totalPrice || 0).toLocaleString()}
                </td>
                <td className="py-3 px-2">
                  <span className={`badge text-xs ${
                    s.priority === 'urgent'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {s.priority}
                  </span>
                </td>
                <td className="py-3 px-2 text-xs text-gray-500">{formatDate(s.createdAt)}</td>
                <td className="py-3 px-2">
                  {showAssign ? (
                    <button
                      onClick={() => { setSelectedShipment(s); setSelectedDriver(''); setSelectedVehicle(''); }}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      Assign
                    </button>
                  ) : (
                    <span className="badge bg-yellow-100 text-yellow-700 text-xs">Awaiting Payment</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shipment Assignment</h1>

      {/* Confirmed (paid) — ready to assign */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Ready to Assign
            {confirmed.length > 0 && (
              <span className="ml-2 bg-primary-100 text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {confirmed.length}
              </span>
            )}
          </h3>
          <span className="text-xs text-gray-400">Payment confirmed shipments</span>
        </div>
        {isLoading ? (
          <SkeletonTable />
        ) : (
          <ShipmentTable
            shipments={confirmed}
            showAssign={true}
            emptyMsg="All confirmed shipments are assigned!"
            emptyIcon={<FiCheckCircle className="mx-auto text-green-400" size={40} />}
          />
        )}
      </div>

      {/* Pending (unpaid) — for visibility only */}
      {pending.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Awaiting Payment
              <span className="ml-2 bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {pending.length}
              </span>
            </h3>
            <a href="/fleet/payments" className="text-xs text-primary-500 hover:text-primary-600 font-medium">
              Review Payments →
            </a>
          </div>
          <ShipmentTable
            shipments={pending}
            showAssign={false}
            emptyMsg=""
            emptyIcon={null}
          />
        </div>
      )}

      {/* Assignment Modal */}
      <Modal isOpen={!!selectedShipment} onClose={() => setSelectedShipment(null)} title="Assign Shipment">
        {selectedShipment && (
          <div className="space-y-4">
            {/* Shipment summary */}
            <div className="bg-gray-50 dark:bg-dark-700 rounded-xl p-4">
              <p className="font-mono text-primary-500 font-semibold text-sm">{selectedShipment.trackingNumber}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                {selectedShipment.pickupCity} → {selectedShipment.destCity}
              </p>
              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                <span>{selectedShipment.cargoWeight} kg</span>
                <span className="capitalize">{selectedShipment.cargoCategory}</span>
                <span className={`font-semibold ${selectedShipment.priority === 'urgent' ? 'text-red-600' : 'text-gray-600'}`}>
                  {selectedShipment.priority}
                </span>
              </div>
            </div>

            {/* Driver select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FiUser className="inline mr-1.5" size={14} />
                Select Driver *
              </label>
              {drivers.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 rounded-lg p-3">
                  <FiAlertCircle size={16} />
                  No available drivers found
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {drivers.map((d) => (
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
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">
                            {d.firstName} {d.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{d.phone}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-xs text-yellow-500">
                            <FiStar size={11} />
                            <span>{d.rating || 'N/A'}</span>
                          </div>
                          <p className="text-xs text-gray-400">{d.totalDeliveries} deliveries</p>
                          <span className={`text-xs font-medium ${d.isOnline ? 'text-green-600' : 'text-gray-400'}`}>
                            {d.isOnline ? '● Online' : '○ Offline'}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Vehicle select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FiTruck className="inline mr-1.5" size={14} />
                Select Vehicle *
              </label>
              {vehicles.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 rounded-lg p-3">
                  <FiAlertCircle size={16} />
                  No available vehicles found
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {vehicles.map((v) => (
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
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white font-mono">
                            {v.plateNumber}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {v.brand} {v.model} · {v.type}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            {v.capacity} kg
                          </p>
                          <p className="text-xs text-green-600 font-medium">Available</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedShipment(null)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssign}
                disabled={!selectedDriver || !selectedVehicle || assignMutation.isPending}
                className="btn-primary flex-1"
              >
                {assignMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Assigning...
                  </span>
                ) : 'Confirm Assignment'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ShipmentAssignment;
