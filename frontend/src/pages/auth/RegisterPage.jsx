import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff,
  FiTruck, FiCheckCircle, FiAlertCircle,
} from 'react-icons/fi';
import { register as registerUser } from '../../redux/slices/authSlice';

// ── Reusable field wrapper ────────────────────────────────────
const Field = ({ label, error, success, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {children}
    <AnimatePresence mode="wait">
      {error && (
        <motion.p
          key="error"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-1 text-red-500 text-xs mt-1"
        >
          <FiAlertCircle size={11} />
          {error}
        </motion.p>
      )}
      {!error && success && (
        <motion.p
          key="success"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-1 text-green-500 text-xs mt-1"
        >
          <FiCheckCircle size={11} />
          {success}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

// Border class based on touched/error state
const inputClass = (error, isDirty) => {
  const base = 'input-field';
  if (error)            return `${base} border-red-400 focus:ring-red-400`;
  if (isDirty && !error) return `${base} border-green-400 focus:ring-green-400`;
  return base;
};

// Password strength indicator
const PasswordStrength = ({ password }) => {
  if (!password) return null;
  const checks = [
    { label: '8+ characters', ok: password.length >= 8 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Number', ok: /[0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ['bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${i < score ? colors[score] : 'bg-gray-200'}`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          {checks.map((c) => (
            <span key={c.label} className={`text-xs flex items-center gap-0.5 ${c.ok ? 'text-green-600' : 'text-gray-400'}`}>
              <FiCheckCircle size={10} />
              {c.label}
            </span>
          ))}
        </div>
        <span className={`text-xs font-semibold ${colors[score].replace('bg-', 'text-')}`}>
          {labels[score]}
        </span>
      </div>
    </div>
  );
};

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, dirtyFields, touchedFields },
  } = useForm({ mode: 'onChange' });

  const password = watch('password', '');

  const onSubmit = async (data) => {
    const { confirmPassword, ...userData } = data;
    const result = await dispatch(registerUser(userData));
    if (registerUser.fulfilled.match(result)) {
      const role = result.payload.user.role;
      navigate(role === 'driver' ? '/driver/dashboard' : '/customer/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiTruck className="text-white text-2xl" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-500 text-sm mt-1">Join Smart Transport today</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

            {/* First + Last name */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="First Name" error={errors.firstName?.message} success={dirtyFields.firstName && !errors.firstName ? '✓' : ''}>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input
                    {...register('firstName', {
                      required: 'First name is required',
                      minLength: { value: 2, message: 'At least 2 characters' },
                      maxLength: { value: 50, message: 'Too long' },
                      pattern: { value: /^[a-zA-Z\u00C0-\u024F\s'-]+$/, message: 'Letters only' },
                    })}
                    className={`${inputClass(errors.firstName, dirtyFields.firstName)} pl-9 text-sm`}
                    placeholder="Abebe"
                  />
                </div>
              </Field>

              <Field label="Last Name" error={errors.lastName?.message} success={dirtyFields.lastName && !errors.lastName ? '✓' : ''}>
                <input
                  {...register('lastName', {
                    required: 'Last name is required',
                    minLength: { value: 2, message: 'At least 2 characters' },
                    maxLength: { value: 50, message: 'Too long' },
                    pattern: { value: /^[a-zA-Z\u00C0-\u024F\s'-]+$/, message: 'Letters only' },
                  })}
                  className={`${inputClass(errors.lastName, dirtyFields.lastName)} text-sm`}
                  placeholder="Girma"
                />
              </Field>
            </div>

            {/* Email */}
            <Field label="Email Address" error={errors.email?.message} success={dirtyFields.email && !errors.email ? 'Valid email' : ''}>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
                  })}
                  type="email"
                  className={`${inputClass(errors.email, dirtyFields.email)} pl-9 text-sm`}
                  placeholder="you@example.com"
                />
              </div>
            </Field>

            {/* Phone */}
            <Field label="Phone Number" error={errors.phone?.message} success={dirtyFields.phone && !errors.phone ? 'Valid phone number' : ''}>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: { value: /^\+?[0-9\s\-]{7,20}$/, message: 'Enter a valid phone number (e.g. +251 911 123 456)' },
                  })}
                  className={`${inputClass(errors.phone, dirtyFields.phone)} pl-9 text-sm`}
                  placeholder="+251 911 123 456"
                />
              </div>
            </Field>

            {/* Account type */}
            <Field label="Account Type">
              <select {...register('role')} className="input-field text-sm">
                <option value="customer">Customer — Ship cargo</option>
                <option value="driver">Driver — Deliver cargo</option>
              </select>
            </Field>

            {/* Password */}
            <Field label="Password" error={errors.password?.message}>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'At least 8 characters required' },
                    validate: {
                      hasUpper:  (v) => /[A-Z]/.test(v) || 'Must include an uppercase letter',
                      hasNumber: (v) => /[0-9]/.test(v) || 'Must include a number',
                    },
                  })}
                  type={showPass ? 'text' : 'password'}
                  className={`${inputClass(errors.password, dirtyFields.password)} pl-9 pr-9 text-sm`}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                </button>
              </div>
              {/* Live strength meter */}
              {password && <PasswordStrength password={password} />}
            </Field>

            {/* Confirm password */}
            <Field label="Confirm Password" error={errors.confirmPassword?.message} success={dirtyFields.confirmPassword && !errors.confirmPassword ? 'Passwords match' : ''}>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (v) => v === password || 'Passwords do not match',
                  })}
                  type={showConfirm ? 'text' : 'password'}
                  className={`${inputClass(errors.confirmPassword, dirtyFields.confirmPassword)} pl-9 pr-9 text-sm`}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirm ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                </button>
              </div>
            </Field>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-500 font-medium hover:text-primary-600">Sign in</Link>
          </p>
        </motion.div>

        <p className="text-center text-gray-400 text-sm mt-6">
          <Link to="/" className="hover:text-white transition-colors">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
