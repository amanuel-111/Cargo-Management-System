import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiMapPin, FiTruck, FiCheckCircle, FiPackage, FiArrowLeft, FiStar, FiDollarSign } from 'react-icons/fi';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { SkeletonCard } from '../../components/common/LoadingSkeleton';
import { formatDate, formatDateTime, formatCurrency } from '../../utils/helpers';
import { joinShipmentRoom, leaveShipmentRoom } from '../../services/socketService';
import toast from 'react-hot-toast';

const STATUS_STEPS = ['pending','confirmed','assigned','picked_up','in_transit','out_for_delivery','delivered'];

const TrackShipment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showRateModal, setShowRateModal] = useState(false);
  const [ratingScore, setRatingScore]     = useState(0);
  const [ratingComment, setRatingComment] = useState('');

  const { data: shipment, isLoading } = useQuery({
    queryKey: ['shipment', id],
    queryFn: () => api.get(`/shipments/${id}`).then((r) => r.data.data),
    refetchInterval: 30000,
    enabled: !!id,
  });

  const rateMutation = useMutation({
    mutationFn: ({ score, comment }) =>
      api.post(`/shipments/${id}/rate`, { score, comment }),
    onSuccess: () => {
      queryClient.invalidateQueries(['shipment', id]);
      toast.success('Thank you for your rating!');
      setShowRateModal(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Rating failed'),
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
          <div className="flex items-center justify-between mt-2">
            <span className={`badge text-xs ${shipment.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {shipment.isPaid ? '✓ Paid' : 'Payment Pending'}
            </span>
            {!shipment.isPaid && shipment.status === 'pending' && (
              <Link
                to="/customer/payment"
                state={{ shipmentId: shipment.id, trackingNumber: shipment.trackingNumber, amount: shipment.totalPrice }}
                className="flex items-center gap-1.5 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              >
                <FiDollarSign size={13} /> Pay Now
              </Link>
            )}
            {shipment.paymentMethod && (
              <span className="text-xs text-gray-400 capitalize">{shipment.paymentMethod}</span>
            )}
          </div>
        </div>
      </div>

      {/* Rate delivery */}
      {shipment.status === 'delivered' && !shipment.ratingScore && (
        <div className="card bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-green-800 dark:text-green-400 text-sm">Delivery completed!</p>
              <p className="text-green-700 dark:text-green-500 text-xs mt-0.5">How was your experience?</p>
            </div>
            <button
              onClick={() => setShowRateModal(true)}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              <FiStar size={13} /> Rate Delivery
            </button>
          </div>
        </div>
      )}

      {shipment.ratingScore && (
        <div className="card">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Your Rating</p>
          <div className="flex items-center gap-2">
            {[1,2,3,4,5].map((n) => (
              <FiStar key={n} size={18} className={n <= shipment.ratingScore ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
            ))}
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">{shipment.ratingScore}/5</span>
          </div>
          {shipment.ratingComment && (
            <p className="text-sm text-gray-500 mt-2 italic">"{shipment.ratingComment}"</p>
          )}
        </div>
      )}

      {/* Cancel button — only for pending or confirmed */}
      {['pending', 'confirmed'].includes(shipment.status) && (
        <div className="card border border-red-100 dark:border-red-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-red-700 dark:text-red-400 text-sm">Cancel Shipment</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {shipment.status === 'confirmed'
                  ? 'Payment will need to be refunded manually'
                  : 'No charges will apply'}
              </p>
            </div>
            <button
              onClick={async () => {
                if (!window.confirm('Are you sure you want to cancel this shipment?')) return;
                try {
                  await api.put(`/shipments/${id}/cancel`, { reason: 'Cancelled by customer' });
                  toast.success('Shipment cancelled');
                  queryClient.invalidateQueries(['shipment', id]);
                  queryClient.invalidateQueries(['customer-shipments-recent']);
                } catch (err) {
                  toast.error(err.response?.data?.message || 'Cannot cancel this shipment');
                }
              }}
              className="text-xs bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-3 py-1.5 rounded-lg transition-colors border border-red-200"
            >
              Cancel Shipment
            </button>
          </div>
        </div>
      )}
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

      {/* Rate Modal */}
      <Modal isOpen={showRateModal} onClose={() => setShowRateModal(false)} title="Rate Your Delivery" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            How was your delivery experience for shipment <span className="font-mono font-semibold text-primary-500">{shipment.trackingNumber}</span>?
          </p>

          {/* Star selector */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating *</p>
            <div className="flex items-center gap-2">
              {[1,2,3,4,5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRatingScore(n)}
                  className="transition-transform hover:scale-110"
                >
                  <FiStar
                    size={28}
                    className={n <= ratingScore ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 hover:text-yellow-300'}
                  />
                </button>
              ))}
              {ratingScore > 0 && (
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 ml-1">
                  {['','Poor','Fair','Good','Very Good','Excellent'][ratingScore]}
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Comment <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              rows={3}
              className="input-field resize-none"
              placeholder="Share your experience..."
            />
          </div>

          <div className="flex gap-3">
            <button onClick={() => setShowRateModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button
              onClick={() => rateMutation.mutate({ score: ratingScore, comment: ratingComment })}
              disabled={ratingScore === 0 || rateMutation.isPending}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {rateMutation.isPending ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Submitting...</>
              ) : (
                <><FiStar size={14} />Submit Rating</>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TrackShipment;
