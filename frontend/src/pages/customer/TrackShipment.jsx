import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiMapPin, FiTruck, FiCheckCircle, FiClock, FiPackage } from 'react-icons/fi';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { formatDateTime, formatCurrency } from '../../utils/helpers';
import { joinShipmentRoom, leaveShipmentRoom } from '../../services/socketService';

const statusSteps = ['pending', 'confirmed', 'assigned', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'];

const TrackShipment = () => {
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['shipment', id],
    queryFn: () => api.get(`/shipments/${id}`).then((r) => r.data.data),
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (id) {
      joinShipmentRoom(id);
      return () => leaveShipmentRoom(id);
    }
  }, [id]);

  if (isLoading) return <LoadingSkeleton />;
  if (!data) return <div className="text-center py-12 text-gray-500">Shipment not found</div>;

  const currentStepIndex = statusSteps.indexOf(data.status);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Track Shipment</h1>
        <StatusBadge status={data.status} />
      </div>

      {/* Tracking number */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Tracking Number</p>
            <p className="text-xl font-bold font-mono text-primary-500">{data.trackingNumber}</p>
          </div>
          {data.estimatedArrival && (
            <div className="text-right">
              <p className="text-sm text-gray-500">Estimated Arrival</p>
              <p className="font-semibold text-gray-900 dark:text-white">{formatDateTime(data.estimatedArrival)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Route */}
      <div className="card">
        <div className="grid grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FiMapPin className="text-green-600" size={14} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">PICKUP</p>
              <p className="font-semibold text-gray-900 dark:text-white">{data.pickup?.city}</p>
              <p className="text-xs text-gray-500">{data.pickup?.address}</p>
              {data.pickup?.contactName && <p className="text-xs text-gray-400 mt-1">{data.pickup.contactName} · {data.pickup.contactPhone}</p>}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FiMapPin className="text-red-600" size={14} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">DELIVERY</p>
              <p className="font-semibold text-gray-900 dark:text-white">{data.destination?.city}</p>
              <p className="text-xs text-gray-500">{data.destination?.address}</p>
              {data.destination?.contactName && <p className="text-xs text-gray-400 mt-1">{data.destination.contactName} · {data.destination.contactPhone}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Delivery Progress</h3>
        <div className="flex items-center justify-between">
          {statusSteps.map((step, i) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  i <= currentStepIndex ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {i < currentStepIndex ? <FiCheckCircle size={14} /> : <span className="text-xs">{i + 1}</span>}
                </div>
                <span className="text-xs text-gray-500 text-center hidden sm:block" style={{ maxWidth: 60 }}>
                  {step.replace(/_/g, ' ')}
                </span>
              </div>
              {i < statusSteps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 ${i < currentStepIndex ? 'bg-primary-500' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Driver */}
      {data.driver && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Driver</h3>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <FiTruck className="text-primary-500" size={20} />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{data.driver.firstName} {data.driver.lastName}</p>
              <p className="text-sm text-gray-500">{data.driver.phone}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-yellow-400 text-sm">★</span>
                <span className="text-sm text-gray-600">{data.driver.rating || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cargo */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Cargo Details</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-500">Description:</span> <span className="font-medium ml-1">{data.cargo?.description}</span></div>
          <div><span className="text-gray-500">Weight:</span> <span className="font-medium ml-1">{data.cargo?.weight} kg</span></div>
          <div><span className="text-gray-500">Category:</span> <span className="font-medium ml-1 capitalize">{data.cargo?.category}</span></div>
          <div><span className="text-gray-500">Quantity:</span> <span className="font-medium ml-1">{data.cargo?.quantity}</span></div>
        </div>
      </div>

      {/* Pricing */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Pricing</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Base Price</span><span>{formatCurrency(data.pricing?.basePrice)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Weight Charge</span><span>{formatCurrency(data.pricing?.weightPrice)}</span></div>
          <div className="flex justify-between font-semibold border-t border-gray-100 dark:border-dark-700 pt-2 mt-2">
            <span>Total</span><span className="text-primary-500">{formatCurrency(data.pricing?.totalPrice)}</span>
          </div>
        </div>
      </div>

      {/* Status History */}
      {data.statusHistory?.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Status History</h3>
          <div className="space-y-3">
            {[...data.statusHistory].reverse().map((h, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">{h.status?.replace(/_/g, ' ')}</p>
                  {h.note && <p className="text-gray-500 text-xs">{h.note}</p>}
                  <p className="text-gray-400 text-xs">{formatDateTime(h.timestamp)}</p>
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
