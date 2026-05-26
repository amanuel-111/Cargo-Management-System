import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiMapPin, FiPackage, FiTruck, FiCheckCircle, FiClock } from 'react-icons/fi';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDateTime } from '../../utils/helpers';
import toast from 'react-hot-toast';

const statusSteps = ['pending', 'confirmed', 'assigned', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'];

const TrackPage = () => {
  const { trackingNumber: paramTracking } = useParams();
  const navigate = useNavigate();
  const [trackingNum, setTrackingNum] = useState(paramTracking || '');
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (paramTracking) handleTrack(null, paramTracking);
  }, [paramTracking]);

  const handleTrack = async (e, num) => {
    if (e) e.preventDefault();
    const tn = num || trackingNum.trim();
    if (!tn) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/shipments/track/${tn}`);
      setShipment(data.data);
    } catch (err) {
      toast.error('Shipment not found. Check your tracking number.');
      setShipment(null);
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = shipment ? statusSteps.indexOf(shipment.status) : -1;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Shipment</h1>
          <p className="text-gray-500">Enter your tracking number to get real-time updates</p>
        </div>

        {/* Search */}
        <form onSubmit={handleTrack} className="flex gap-3 mb-8">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={trackingNum}
              onChange={(e) => setTrackingNum(e.target.value)}
              placeholder="Enter tracking number (e.g. STC-ABC123-XY)"
              className="input-field pl-11 py-3"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary px-6 py-3">
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>

        {/* Result */}
        {shipment && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Header */}
            <div className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">Tracking Number</p>
                  <p className="text-xl font-bold text-gray-900">{shipment.trackingNumber}</p>
                </div>
                <StatusBadge status={shipment.status} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <FiMapPin className="text-green-500 mt-0.5 flex-shrink-0" size={16} />
                  <div>
                    <p className="text-xs text-gray-500">From</p>
                    <p className="text-sm font-medium">{shipment.pickup?.city}</p>
                    <p className="text-xs text-gray-400">{shipment.pickup?.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <FiMapPin className="text-red-500 mt-0.5 flex-shrink-0" size={16} />
                  <div>
                    <p className="text-xs text-gray-500">To</p>
                    <p className="text-sm font-medium">{shipment.destination?.city}</p>
                    <p className="text-xs text-gray-400">{shipment.destination?.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-6">Shipment Progress</h3>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                <div
                  className="absolute left-4 top-0 w-0.5 bg-primary-500 transition-all duration-500"
                  style={{ height: `${Math.max(0, (currentStepIndex / (statusSteps.length - 1)) * 100)}%` }}
                />
                <div className="space-y-6">
                  {statusSteps.map((step, i) => {
                    const isCompleted = i <= currentStepIndex;
                    const isCurrent = i === currentStepIndex;
                    return (
                      <div key={step} className="flex items-center gap-4 relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 flex-shrink-0 ${
                          isCompleted ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-400'
                        } ${isCurrent ? 'ring-4 ring-primary-100' : ''}`}>
                          {isCompleted ? <FiCheckCircle size={16} /> : <FiClock size={14} />}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                            {step.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                          </p>
                          {isCurrent && (
                            <p className="text-xs text-primary-500">Current Status</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Driver info */}
            {shipment.driver && (
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">Driver Information</h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <FiTruck className="text-primary-500" size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{shipment.driver.firstName} {shipment.driver.lastName}</p>
                    <p className="text-sm text-gray-500">{shipment.driver.phone}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm text-gray-600">{shipment.driver.rating || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Status History */}
            {shipment.statusHistory?.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">Status History</h3>
                <div className="space-y-3">
                  {[...shipment.statusHistory].reverse().map((h, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">{h.status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
                        {h.note && <p className="text-gray-500 text-xs">{h.note}</p>}
                        <p className="text-gray-400 text-xs">{formatDateTime(h.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TrackPage;
