import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiMapPin, FiPackage, FiInfo, FiArrowRight, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const steps = ['Pickup & Delivery', 'Cargo Details', 'Review & Submit'];

const cargoCategories = ['general', 'fragile', 'perishable', 'hazardous', 'electronics', 'furniture', 'livestock'];
const priorities = ['low', 'normal', 'high', 'urgent'];

const CreateShipment = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { priority: 'normal', 'cargo.category': 'general', 'cargo.quantity': 1 },
  });

  const formData = watch();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        pickup: {
          address: data.pickupAddress,
          city: data.pickupCity,
          region: data.pickupRegion,
          contactName: data.pickupContactName,
          contactPhone: data.pickupContactPhone,
        },
        destination: {
          address: data.destAddress,
          city: data.destCity,
          region: data.destRegion,
          contactName: data.destContactName,
          contactPhone: data.destContactPhone,
        },
        cargo: {
          description: data.cargoDescription,
          category: data.cargoCategory,
          weight: Number(data.cargoWeight),
          quantity: Number(data.cargoQuantity),
          specialInstructions: data.specialInstructions,
        },
        priority: data.priority,
      };

      const { data: res } = await api.post('/shipments', payload);
      toast.success(`Shipment created! Tracking: ${res.data.trackingNumber}`);
      navigate('/customer/shipments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create shipment');
    } finally {
      setLoading(false);
    }
  };

  const ethiopianCities = ['Addis Ababa', 'Dire Dawa', 'Mekelle', 'Gondar', 'Hawassa', 'Bahir Dar', 'Adama', 'Jimma', 'Dessie', 'Jijiga'];

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
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                i < step ? 'bg-green-500 text-white' : i === step ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {i < step ? <FiCheckCircle size={16} /> : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${i === step ? 'text-primary-500' : 'text-gray-500'}`}>{s}</span>
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-3 ${i < step ? 'bg-green-500' : 'bg-gray-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card space-y-4">

          {/* Step 0: Pickup & Delivery */}
          {step === 0 && (
            <>
              <div className="flex items-center gap-2 mb-2">
                <FiMapPin className="text-green-500" size={18} />
                <h3 className="font-semibold text-gray-900 dark:text-white">Pickup Location</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City *</label>
                  <select {...register('pickupCity', { required: 'Required' })} className="input-field">
                    <option value="">Select city</option>
                    {ethiopianCities.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.pickupCity && <p className="text-red-500 text-xs mt-1">{errors.pickupCity.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Region</label>
                  <input {...register('pickupRegion')} className="input-field" placeholder="e.g. Oromia" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address *</label>
                <input {...register('pickupAddress', { required: 'Required' })} className="input-field" placeholder="Street address, landmark" />
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

              <div className="border-t border-gray-100 dark:border-dark-700 pt-4 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiMapPin className="text-red-500" size={18} />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Delivery Location</h3>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City *</label>
                  <select {...register('destCity', { required: 'Required' })} className="input-field">
                    <option value="">Select city</option>
                    {ethiopianCities.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.destCity && <p className="text-red-500 text-xs mt-1">{errors.destCity.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Region</label>
                  <input {...register('destRegion')} className="input-field" placeholder="e.g. SNNPR" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address *</label>
                <input {...register('destAddress', { required: 'Required' })} className="input-field" placeholder="Street address, landmark" />
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
            </>
          )}

          {/* Step 1: Cargo Details */}
          {step === 1 && (
            <>
              <div className="flex items-center gap-2 mb-2">
                <FiPackage className="text-primary-500" size={18} />
                <h3 className="font-semibold text-gray-900 dark:text-white">Cargo Information</h3>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
                <textarea {...register('cargoDescription', { required: 'Required' })} rows={3} className="input-field resize-none" placeholder="Describe your cargo..." />
                {errors.cargoDescription && <p className="text-red-500 text-xs mt-1">{errors.cargoDescription.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select {...register('cargoCategory')} className="input-field">
                    {cargoCategories.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weight (kg) *</label>
                  <input {...register('cargoWeight', { required: 'Required', min: { value: 0.1, message: 'Min 0.1 kg' } })} type="number" step="0.1" className="input-field" placeholder="0.0" />
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
                    {priorities.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Special Instructions</label>
                <textarea {...register('specialInstructions')} rows={2} className="input-field resize-none" placeholder="Handle with care, keep upright, etc." />
              </div>
            </>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <FiInfo className="text-primary-500" size={18} />
                <h3 className="font-semibold text-gray-900 dark:text-white">Review Your Shipment</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-dark-700 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Route</p>
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{formData.pickupCity}</p>
                      <p className="text-xs text-gray-500">{formData.pickupAddress}</p>
                    </div>
                    <FiArrowRight className="text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{formData.destCity}</p>
                      <p className="text-xs text-gray-500">{formData.destAddress}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-dark-700 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Cargo</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500">Description:</span> <span className="font-medium">{formData.cargoDescription}</span></div>
                    <div><span className="text-gray-500">Weight:</span> <span className="font-medium">{formData.cargoWeight} kg</span></div>
                    <div><span className="text-gray-500">Category:</span> <span className="font-medium capitalize">{formData.cargoCategory}</span></div>
                    <div><span className="text-gray-500">Priority:</span> <span className="font-medium capitalize">{formData.priority}</span></div>
                  </div>
                </div>
                <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4">
                  <p className="text-xs font-semibold text-primary-600 uppercase mb-2">Estimated Price</p>
                  <p className="text-2xl font-bold text-primary-600">
                    ETB {Math.max(200, (Number(formData.cargoWeight) || 0) * 2).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">25 ETB/km · 2 ETB/kg weight surcharge · min ETB 200</p>
                  <p className="text-xs text-gray-400 mt-0.5">Final price calculated on pickup & destination coordinates</p>
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="btn-secondary flex items-center gap-2 disabled:opacity-40"
          >
            <FiArrowLeft size={16} /> Previous
          </button>

          {step < steps.length - 1 ? (
            <button type="button" onClick={() => setStep(step + 1)} className="btn-primary flex items-center gap-2">
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
                <><FiCheckCircle size={16} /> Submit Shipment</>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateShipment;
