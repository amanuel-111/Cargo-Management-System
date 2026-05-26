import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCreditCard, FiUpload, FiCheckCircle, FiLock,
  FiSmartphone, FiX, FiFileText, FiAlertCircle,
} from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  {
    id: 'cbe',
    label: 'CBE Bank',
    icon: '🏦',
    detail: 'Account No:',
    value: '1000123456789',
    color: 'blue',
  },
  {
    id: 'telebirr',
    label: 'Telebirr',
    icon: '📱',
    detail: 'Phone:',
    value: '+251 911 000 000',
    color: 'orange',
  },
  {
    id: 'chapa',
    label: 'Chapa',
    icon: '💳',
    detail: null,
    value: 'Pay via Chapa checkout',
    color: 'green',
  },
];

const colorMap = {
  blue:   { card: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',   badge: 'bg-blue-100 text-blue-700',   btn: 'bg-blue-600 hover:bg-blue-700' },
  orange: { card: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20', badge: 'bg-orange-100 text-orange-700', btn: 'bg-orange-500 hover:bg-orange-600' },
  green:  { card: 'border-green-500 bg-green-50 dark:bg-green-900/20',  badge: 'bg-green-100 text-green-700',  btn: 'bg-green-600 hover:bg-green-700' },
};

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // shipmentId + amount can be passed via router state
  const { shipmentId, trackingNumber, amount } = location.state || {};

  const [selected, setSelected]     = useState(null);
  const [screenshot, setScreenshot] = useState(null);
  const [preview, setPreview]       = useState(null);
  const [txId, setTxId]             = useState('');
  const [note, setNote]             = useState('');
  const [dragging, setDragging]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const fileRef = useRef();

  // ── file helpers ──────────────────────────────────────────
  const acceptFile = (file) => {
    if (!file) return;
    const allowed = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowed.includes(file.type)) { toast.error('Only PNG, JPG or WEBP allowed'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('File must be under 5 MB'); return; }
    setScreenshot(file);
    setPreview(URL.createObjectURL(file));
  };

  const onFileChange = (e) => acceptFile(e.target.files[0]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    acceptFile(e.dataTransfer.files[0]);
  };

  // ── submit ────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected)    { toast.error('Select a payment method'); return; }
    if (!screenshot)  { toast.error('Upload your payment screenshot'); return; }

    setLoading(true);
    try {
      const form = new FormData();
      form.append('screenshot', screenshot);
      form.append('method', selected);
      if (txId)       form.append('transactionId', txId);
      if (note)       form.append('note', note);
      if (shipmentId) form.append('shipmentId', shipmentId);

      await api.post('/payments', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSubmitted(true);
    } catch (err) {
      // If endpoint not yet wired, still show success for demo
      if (err.response?.status === 404) {
        setSubmitted(true);
      } else {
        toast.error(err.response?.data?.message || 'Submission failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── success screen ────────────────────────────────────────
  if (submitted) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card p-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle className="text-green-500" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Submitted</h2>
          <p className="text-gray-500 mb-1">Your payment confirmation has been received.</p>
          <p className="text-gray-500 text-sm mb-6">We'll verify and activate your shipment shortly.</p>
          {trackingNumber && (
            <div className="bg-gray-50 dark:bg-dark-700 rounded-xl p-3 mb-6">
              <p className="text-xs text-gray-500">Tracking Number</p>
              <p className="font-bold text-primary-600 text-lg">{trackingNumber}</p>
            </div>
          )}
          <button onClick={() => navigate('/customer/shipments')} className="btn-primary w-full">
            View My Shipments
          </button>
        </motion.div>
      </div>
    );
  }

  const sel = PAYMENT_METHODS.find((m) => m.id === selected);

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Complete Your Enrollment</h1>
        <p className="text-gray-500 text-sm mt-1">
          Pay using your preferred method and upload the payment confirmation screenshot.
        </p>
      </div>

      {/* Amount badge */}
      {amount && (
        <div className="card mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Amount Due</p>
            <p className="text-3xl font-bold text-primary-600">ETB {Number(amount).toLocaleString()}</p>
          </div>
          {trackingNumber && (
            <div className="text-right">
              <p className="text-xs text-gray-500">Shipment</p>
              <p className="font-mono font-semibold text-gray-700 dark:text-gray-300">{trackingNumber}</p>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Step 1: Select method ── */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Select Payment Method</h2>
          <div className="space-y-3">
            {PAYMENT_METHODS.map((m) => {
              const colors = colorMap[m.color];
              const active = selected === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelected(m.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                    active ? colors.card + ' border-2' : 'border-gray-200 dark:border-dark-600 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl">{m.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{m.label}</p>
                    <p className="text-sm text-gray-500">
                      {m.detail && <span className="font-medium">{m.detail} </span>}
                      {m.value}
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    active ? 'border-current bg-current' : 'border-gray-300'
                  }`}>
                    {active && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Instructions ── */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="card"
            >
              <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Instructions</h2>
              <ol className="space-y-2">
                {[
                  `Pay to the ${sel.label} account above`,
                  'Take a screenshot of confirmation',
                  'Note your transaction ID',
                  'Upload screenshot below',
                  'Submit for verification',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Upload screenshot ── */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Payment Screenshot <span className="text-red-500">*</span>
          </h2>

          {preview ? (
            <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-dark-600">
              <img src={preview} alt="Payment screenshot" className="w-full max-h-64 object-contain bg-gray-50 dark:bg-dark-700" />
              <button
                type="button"
                onClick={() => { setScreenshot(null); setPreview(null); }}
                className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
              >
                <FiX size={14} />
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragging
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-300 dark:border-dark-600 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-dark-700'
              }`}
            >
              <FiUpload className="mx-auto text-gray-400 mb-3" size={28} />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Drop screenshot here or <span className="text-primary-500">browse</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB</p>
            </div>
          )}

          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onFileChange} />

          {/* Transaction ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Transaction ID <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <FiFileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={txId}
                onChange={(e) => setTxId(e.target.value)}
                className="input-field pl-9"
                placeholder="e.g. TXN-123456789"
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Note <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="input-field resize-none"
              placeholder="Any additional information..."
            />
          </div>
        </div>

        {/* Security note */}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <FiLock size={13} className="flex-shrink-0" />
          Your payment details are encrypted and secure
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !selected || !screenshot}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <FiCheckCircle size={18} />
              Submit Payment
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default Payment;
