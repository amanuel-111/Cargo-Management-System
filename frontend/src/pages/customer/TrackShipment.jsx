import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiMapPin, FiTruck, FiCheckCircle, FiPackage, FiArrowLeft, FiStar } from 'react-icons/fi';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import { SkeletonCard } from '../../components/common/LoadingSkeleton';
import { formatDate, formatDateTime, formatCurrency } from '../../utils/helpers';
import { joinShipmentRoom, leaveShipmentRoom } from '../../services/socketService';

const STATUS_STEPS = ['pending','confirmed','assigned','picked_up','in_transit','out_for_delivery','delivered'];

const TrackShipment = () => {
  const { id } = useParams();

  const { data: shipment, isLoading } = useQuery({
    queryKey: ['shipment', id],
    queryFn: () => api.get(`/shipments/${id}`).then((r) => r.data.data),
    refetchInterval: 30000,
    enabled: !!id,
  });

  useEffect(() => {
    if (id) {
      joinShipmentRoom(id);
      return () => leaveShipmentRoom(id);
    }
  }, [id]);

  if (isLoading) return (
    <div className="max-w-3xl mx-auto space-y-4">
      {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );

  if (!shipment) return (
    <div className="text-center py-20">
      <FiPackage className="mx-auto text-gray-300 mb-3" size={48} />
      <p className="text-gray-500 mb-4">Shipment not found</p>
      <Link to="/customer/shipments" className="btn-secondary">← Back to Shipments</Link>
    </div>
  );

  const currentStep = STATUS_STEPS.indexOf(shipment.status);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/customer/shipments" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-500">
            <FiArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Track Shipment</h1>
        </div>
        <StatusBadge status={shipment.status} />
      </div>

      {/* Tracking number */}
      <div className="card flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Tracking Number</p>
          <p className="text-xl font-bold font-mono text-primary-500">{shipment.trackingNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Priority</p>
          <span className={`badge ${shipment.priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
            {shipment.priority}
          </span>
        </div>
      </div>

      {/* Route */}
      <div className="card">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-4">Route</p>
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-1 pt-1">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <div className="w-0.5 h-10 bg-gray-200" />
            <div className="w-3 h-3 rounded-full bg-red-500" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Pickup</p>
              <p className="font-semibold text-gray-900 dark:text-white">{shipment.pickupCity}</p>
              <p className="text-xs text-gray-500">{shipment.pickupAddress}</p>
              {shipment.pickupContactName && (
                <p className="text-xs text-gray-400">{shipment.pickupContactName} · {shipment.pickupContactPhone}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Delivery</p>
              <p className="font-semibold text-gray-900 dark:text-white">{shipment.destCity}</p>
              <p className="text-xs text-gray-500">{shipment.destAddress}</p>
              {shipment.destContactName && (
                <p className="text-xs text-gray-400">{shipment.destContactName} · {shipment.destContactPhone}</p>
              )}
            </div>
          </div>
          {shipment.estimatedDistance > 0 && (
            <div className="text-right">
              <p className="text-xs text-gray-400">Distance</p>
              <p className="font-bold text-gray-700 dark:text-white">{shipment.estimatedDistance} km</p>
            </div>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="card">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-5">Delivery Progress</p>
        <div className="flex items-center">
          {STATUS_STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  i <= currentStep ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {i < currentStep ? <FiCheckCircle size={14} /> : <span className="text-xs font-bold">{i + 1}</span>}
                </div>
                <span className="text-xs text-gray-400 text-center hidden sm:block" style={{ maxWidth: 56 }}>
                  {s.replace(/_/g, ' ')}
                </span>
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 transition-colors ${i < currentStep ? 'bg-primary-500' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Driver */}
      {shipment.driver && (
        <div className="card">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Assigned Driver</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              {shipment.driver.avatar ? (
                <img src={shipment.driver.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <FiTruck className="text-primary-500" size={20} />
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {shipment.driver.firstName} {shipment.driver.lastName}
              </p>
              <p className="text-sm text-gray-500">{shipment.driver.phone}</p>
              <div className="flex items-center gap-1 mt-1">
                <FiStar className="text-yellow-400" size={12} />
                <span className="text-xs text-gray-600">{shipment.driver.rating || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cargo */}
      <div className="card">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Cargo Details</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-xs text-gray-400">Description</span>
            <p className="font-medium text-gray-900 dark:text-white">{shipment.cargoDescription}</p>
          </div>
          <div>
            <span className="text-xs text-gray-400">Category</span>
            <p className="font-medium capitalize text-gray-900 dark:text-white">{shipment.cargoCategory}</p>
          </div>
          <div>
            <span className="text-xs text-gray-400">Weight</span>
            <p className="font-medium text-gray-900 dark:text-white">{shipment.cargoWeight} kg</p>
          </div>
          <div>
            <span className="text-xs text-gray-400">Quantity</span>
            <p className="font-medium text-gray-900 dark:text-white">{shipment.cargoQuantity}</p>
          </div>
          {shipment.specialInstructions && (
            <div className="col-span-2">
              <span className="text-xs text-gray-400">Special Instructions</span>
              <p className="font-medium text-gray-900 dark:text-white">{shipment.specialInstructions}</p>
            </div>
          )}
        </div>
      </div>

      {/* Pricing */}
      <div className="card">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Pricing</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Distance ({shipment.estimatedDistance || 0} km × ETB 25)</span>
            <span>{formatCurrency(shipment.distancePrice)}</span>
          </div>
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Weight ({shipment.cargoWeight} kg × ETB {shipment.priority === 'urgent' ? 40 : 35})</span>
            <span>{formatCurrency(shipment.weightPrice)}</span>
          </div>
          <div className="flex justify-between font-bold border-t border-gray-100 dark:border-dark-700 pt-2 mt-1">
            <span className="text-gray-900 dark:text-white">Total</span>
            <span className="text-primary-600 text-lg">{formatCurrency(shipment.totalPrice)}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`badge text-xs ${shipment.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {shipment.isPaid ? '✓ Paid' : 'Payment Pending'}
            </span>
            {shipment.paymentMethod && (
              <span className="text-xs text-gray-400 capitalize">{shipment.paymentMethod}</span>
            )}
          </div>
        </div>
      </div>

      {/* Status History */}
      {shipment.statusHistory?.length > 0 && (
        <div className="card">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-4">Status History</p>
          <div className="space-y-3">
            {[...shipment.statusHistory].reverse().map((h, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">
                    {h.status?.replace(/_/g, ' ')}
                  </p>
                  {h.note && <p className="text-gray-500 text-xs">{h.note}</p>}
                  <p className="text-gray-400 text-xs">{formatDateTime(h.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackShipment;
