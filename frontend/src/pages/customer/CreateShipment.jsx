import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
  FiMapPin, FiPackage, FiInfo, FiArrowRight,
  FiArrowLeft, FiCheckCircle, FiTruck, FiDollarSign,
} from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const steps = ['Pickup & Delivery', 'Cargo Details', 'Review & Submit'];

const cargoCategories = ['general', 'fragile', 'perishable', 'hazardous', 'electronics', 'furniture', 'livestock'];
const priorities = ['low', 'normal', 'high', 'urgent'];

// Ethiopian cities with real coordinates
const CITIES = [
  { name: 'Addis Ababa',  lat: 9.0320,  lng: 38.7469 },
  { name: 'Dire Dawa',    lat: 9.5931,  lng: 41.8661 },
  { name: 'Mekelle',      lat: 13.4967, lng: 39.4753 },
  { name: 'Gondar',       lat: 12.6030, lng: 37.4521 },
  { name: 'Hawassa',      lat: 7.0621,  lng: 38.4762 },
  { name: 'Bahir Dar',    lat: 11.5936, lng: 37.3906 },
  { name: 'Adama',        lat: 8.5400,  lng: 39.2700 },
  { name: 'Jimma',        lat: 7.6667,  lng: 36.8333 },
  { name: 'Dessie',       lat: 11.1333, lng: 39.6333 },
  { name: 'Jijiga',       lat: 9.3500,  lng: 42.8000 },
  { name: 'Shashamane',   lat: 7.2000,  lng: 38.5833 },
  { name: 'Bishoftu',     lat: 8.7500,  lng: 38.9833 },
  { name: 'Arba Minch',   lat: 6.0333,  lng: 37.5500 },
  { name: 'Hosaena',      lat: 7.5500,  lng: 37.8500 },
  { name: 'Woldia',       lat: 11.8167, lng: 39.6000 },
];

const PRICE_PER_KM = 25;
const WEIGHT_RATE  = 35;
const MIN_PRICE    = 200;

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Fields that must pass before advancing each step
const STEP_FIELDS = [
  ['pickupCity', 'pickupAddress', 'destCity', 'destAddress'],
  ['cargoDescription', 'cargoWeight'],
];

const CreateShipment = () => {
  const navigate = useNavigate();
  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [pricing, setPricing] = useState({ distanceKm: 0, distancePrice: 0, weightPrice: 0, total: MIN_PRICE });

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: { priority: 'normal', cargoCategory: 'general', cargoQuantity: 1 },
    mode: 'onChange',
  });

  const watchedPickupCity  = watch('pickupCity');
  const watchedDestCity    = watch('destCity');
  const watchedCargoWeight = watch('cargoWeight');

  // Recalculate price whenever relevant fields change
  useEffect(() => {
    const pickup = CITIES.find((c) => c.name === watchedPickupCity);
    const dest   = CITIES.find((c) => c.name === watchedDestCity);
    const weight = Number(watchedCargoWeight) || 0;

    let distanceKm    = 0;
    let distancePrice = 0;

    if (pickup && dest && pickup.name !== dest.name) {
      distanceKm    = parseFloat(haversineKm(pickup.lat, pickup.lng, dest.lat, dest.lng).toFixed(1));
      distancePrice = parseFloat((distanceKm * PRICE_PER_KM).toFixed(2));
    }

    const weightPrice = parseFloat((weight * WEIGHT_RATE).toFixed(2));
    const total       = Math.max(distancePrice + weightPrice, MIN_PRICE);

    setPricing({ distanceKm, distancePrice, weightPrice, total });
  }, [watchedPickupCity, watchedDestCity, watchedCargoWeight]);

  // Validate current step fields before advancing
  const handleNext = async () => {
    const fields = STEP_FIELDS[step];
    const valid  = await trigger(fields);
    if (valid) setStep((s) => s + 1);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const pickup = CITIES.find((c) => c.name === data.pickupCity);
      const dest   = CITIES.find((c) => c.name === data.destCity);

      const payload = {
        pickup: {
          address:      data.pickupAddress,
          city:         data.pickupCity,
          region:       data.pickupRegion,
          lat:          pickup?.lat,
          lng:          pickup?.lng,
          contactName:  data.pickupContactName,
          contactPhone: data.pickupContactPhone,
        },
        destination: {
          address:      data.destAddress,
          city:         data.destCity,
          region:       data.destRegion,
          lat:          dest?.lat,
          lng:          dest?.lng,
          contactName:  data.destContactName,
          contactPhone: data.destContactPhone,
        },
        cargo: {
          description:        data.cargoDescription,
          category:           data.cargoCategory,
          weight:             Number(data.cargoWeight),
          quantity:           Number(data.cargoQuantity),
          specialInstructions: data.specialInstructions,
        },
        priority: data.priority,
      };

      const { data: res } = await api.post('/shipments', payload);
      toast.success(`Shipment created! Tracking: ${res.data.trackingNumber}`);

      // Go to payment page with shipment details
      navigate('/customer/payment', {
        state: {
          shipmentId:     res.data.id,
          trackingNumber: res.data.trackingNumber,
          amount:         res.data.totalPrice,
        },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create shipment');
    } finally {
      setLoading(false);
    }
  };

  const formData = getValues();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Shipment</h1>
        <p className="text-gray-500 text-sm mt-1">Fill in the details to create your transport request</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center mb-8">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                i < step ? 'bg-green-500 text-white' : i === step ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {i < step ? <FiCheckCircle size={16} /> : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${i === step ? 'text-primary-500' : 'text-gray-500'}`}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 transition-colors ${i < step ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card space-y-4">

          {/* ── Step 0: Pickup & Delivery ── */}
          {step === 0 && (
            <>
              <div className="flex items-center gap-2 mb-2">
                <FiMapPin className="text-green-500" size={18} />
                <h3 className="font-semibold text-gray-900 dark:text-white">Pickup Location</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City *</label>
                  <select {...register('pickupCity', { required: 'City is required' })} className="input-field">
                    <option value="">Select city</option>
                    {CITIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                  {errors.pickupCity && <p className="text-red-500 text-xs mt-1">{errors.pickupCity.message}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address *</label>
                <input {...register('pickupAddress', { required: 'Address is required' })} className="input-field" placeholder="Street address, landmark" />
                {errors.pickupAddress && <p className="text-red-500 text-xs mt-1">{errors.pickupAddress.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Name</label>
                  <input {...register('pickupContactName')} className="input-field" placeholder="Sender name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Phone</label>
                  <input {...register('pickupContactPhone')} className="input-field" placeholder="+251..." />
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-dark-700 pt-4 mt-2">
                <div className="flex items-center gap-2 mb-3">
                  <FiMapPin className="text-red-500" size={18} />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Delivery Location</h3>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City *</label>
                  <select {...register('destCity', { required: 'City is required' })} className="input-field">
                    <option value="">Select city</option>
                    {CITIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                  {errors.destCity && <p className="text-red-500 text-xs mt-1">{errors.destCity.message}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address *</label>
                <input {...register('destAddress', { required: 'Address is required' })} className="input-field" placeholder="Street address, landmark" />
                {errors.destAddress && <p className="text-red-500 text-xs mt-1">{errors.destAddress.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Name</label>
                  <input {...register('destContactName')} className="input-field" placeholder="Receiver name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Phone</label>
                  <input {...register('destContactPhone')} className="input-field" placeholder="+251..." />
                </div>
              </div>

              {/* Live price preview on step 0 */}
              {watchedPickupCity && watchedDestCity && watchedPickupCity !== watchedDestCity && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl p-3 mt-2"
                >
                  <FiTruck className="text-primary-500 flex-shrink-0" size={18} />
                  <div className="text-sm">
                    <span className="text-gray-500">Estimated distance: </span>
                    <span className="font-semibold text-gray-800 dark:text-white">{pricing.distanceKm} km</span>
                    <span className="mx-2 text-gray-300">·</span>
                    <span className="text-gray-500">Base fare: </span>
                    <span className="font-semibold text-primary-600">ETB {pricing.distancePrice.toLocaleString()}</span>
                  </div>
                </motion.div>
              )}
            </>
          )}

          {/* ── Step 1: Cargo Details ── */}
          {step === 1 && (
            <>
              <div className="flex items-center gap-2 mb-2">
                <FiPackage className="text-primary-500" size={18} />
                <h3 className="font-semibold text-gray-900 dark:text-white">Cargo Information</h3>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
                <textarea
                  {...register('cargoDescription', { required: 'Description is required' })}
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Describe your cargo..."
                />
                {errors.cargoDescription && <p className="text-red-500 text-xs mt-1">{errors.cargoDescription.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select {...register('cargoCategory')} className="input-field">
                    {cargoCategories.map((c) => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weight (kg) *</label>
                  <input
                    {...register('cargoWeight', {
                      required: 'Weight is required',
                      min: { value: 0.1, message: 'Min 0.1 kg' },
                    })}
                    type="number"
                    step="0.1"
                    className="input-field"
                    placeholder="0.0"
                  />
                  {errors.cargoWeight && <p className="text-red-500 text-xs mt-1">{errors.cargoWeight.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
                  <input {...register('cargoQuantity')} type="number" min="1" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <select {...register('priority')} className="input-field">
                    {priorities.map((p) => (
                      <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Special Instructions</label>
                <textarea
                  {...register('specialInstructions')}
                  rows={2}
                  className="input-field resize-none"
                  placeholder="Handle with care, keep upright, etc."
                />
              </div>
            </>
          )}

          {/* ── Step 2: Review ── */}
          {step === 2 && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <FiInfo className="text-primary-500" size={18} />
                <h3 className="font-semibold text-gray-900 dark:text-white">Review Your Shipment</h3>
              </div>
              <div className="space-y-3">

                {/* Route */}
                <div className="bg-gray-50 dark:bg-dark-700 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Route</p>
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center gap-1 pt-1">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <div className="w-0.5 h-8 bg-gray-300" />
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{formData.pickupCity}</p>
                        <p className="text-xs text-gray-500">{formData.pickupAddress}</p>
                        {formData.pickupContactName && (
                          <p className="text-xs text-gray-400">{formData.pickupContactName} · {formData.pickupContactPhone}</p>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{formData.destCity}</p>
                        <p className="text-xs text-gray-500">{formData.destAddress}</p>
                        {formData.destContactName && (
                          <p className="text-xs text-gray-400">{formData.destContactName} · {formData.destContactPhone}</p>
                        )}
                      </div>
                    </div>
                    {pricing.distanceKm > 0 && (
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Distance</p>
                        <p className="font-bold text-gray-700 dark:text-white">{pricing.distanceKm} km</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cargo */}
                <div className="bg-gray-50 dark:bg-dark-700 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Cargo</p>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div>
                      <span className="text-gray-500 text-xs">Description</span>
                      <p className="font-medium text-gray-900 dark:text-white">{formData.cargoDescription}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">Category</span>
                      <p className="font-medium capitalize text-gray-900 dark:text-white">{formData.cargoCategory}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">Weight</span>
                      <p className="font-medium text-gray-900 dark:text-white">{formData.cargoWeight} kg</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">Priority</span>
                      <p className="font-medium capitalize text-gray-900 dark:text-white">{formData.priority}</p>
                    </div>
                  </div>
                </div>

                {/* Price breakdown */}
                <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FiDollarSign className="text-primary-500" size={16} />
                    <p className="text-xs font-semibold text-primary-600 uppercase">Price Breakdown</p>
                  </div>
                  <div className="space-y-1.5 text-sm mb-3">
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Distance ({pricing.distanceKm} km × ETB {PRICE_PER_KM})</span>
                      <span>ETB {pricing.distancePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Weight ({formData.cargoWeight || 0} kg × ETB {WEIGHT_RATE})</span>
                      <span>ETB {pricing.weightPrice.toLocaleString()}</span>
                    </div>
                    {pricing.distancePrice + pricing.weightPrice < MIN_PRICE && (
                      <div className="flex justify-between text-gray-400 text-xs">
                        <span>Minimum fare applied</span>
                        <span>ETB {MIN_PRICE}</span>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-primary-200 dark:border-primary-700 pt-2 flex justify-between items-center">
                    <span className="font-semibold text-gray-700 dark:text-white">Total</span>
                    <span className="text-2xl font-bold text-primary-600">
                      ETB {pricing.total.toLocaleString()}
                    </span>
                  </div>
                </div>

              </div>
            </>
          )}
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="btn-secondary flex items-center gap-2 disabled:opacity-40"
          >
            <FiArrowLeft size={16} /> Previous
          </button>

          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary flex items-center gap-2"
            >
              Next <FiArrowRight size={16} />
            </button>
          ) : (
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <><FiCheckCircle size={16} /> Submit & Pay</>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateShipment;
