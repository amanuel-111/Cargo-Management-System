import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiTruck, FiZap, FiAlertCircle } from 'react-icons/fi';
import { login } from '../../redux/slices/authSlice';
import { useLanguage } from '../../context/LanguageContext';

const DEMO_USERS = [
  { label: 'Admin',        email: 'admin@smarttransport.et', password: 'admin123', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
  { label: 'Fleet Mgr',   email: 'fleet@smarttransport.et', password: 'fleet123', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
  { label: 'Driver',      email: 'driver@test.et',          password: 'test123',  color: 'bg-green-100 text-green-700 hover:bg-green-200' },
  { label: 'Customer',    email: 'customer@test.et',        password: 'test123',  color: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
];

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { loading } = useSelector((state) => state.auth);
  const [showPass, setShowPass] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors, dirtyFields } } = useForm({ mode: 'onChange' });

  const fillDemo = (user) => {
    setValue('email', user.email, { shouldValidate: true });
    setValue('password', user.password, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    const result = await dispatch(login(data));
    if (login.fulfilled.match(result)) {
      const role = result.payload.user.role;
      const paths = { customer: '/customer/dashboard', driver: '/driver/dashboard', fleet_manager: '/fleet/dashboard', admin: '/admin/dashboard' };
      navigate(paths[role] || '/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex gap-6 items-start">

        {/* ── Login Form Card ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-2xl p-8 flex-1">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiTruck className="text-white text-2xl" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t('welcomeBack', 'Welcome Back')}</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to your Smart Transport account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('email', 'Email Address')}</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
                  })}
                  type="email"
                  className={`input-field pl-10 ${errors.email ? 'border-red-400 focus:ring-red-400' : dirtyFields.email ? 'border-green-400 focus:ring-green-400' : ''}`}
                  placeholder="you@example.com"
                />
              </div>
              <AnimatePresence mode="wait">
                {errors.email && (
                  <motion.p key="err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-1 text-red-500 text-xs mt-1">
                    <FiAlertCircle size={11} />{errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('password', 'Password')}</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  {...register('password', { required: 'Password is required' })}
                  type={showPass ? 'text' : 'password'}
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              <AnimatePresence mode="wait">
                {errors.password && (
                  <motion.p key="err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-1 text-red-500 text-xs mt-1">
                    <FiAlertCircle size={11} />{errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" className="rounded" />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-sm text-primary-500 hover:text-primary-600">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('submitting', 'Signing in...')}
                </span>
              ) : t('signIn', 'Sign In')}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {t('dontHaveAccount', "Don't have an account?")}{' '}
            <Link to="/register" className="text-primary-500 font-medium hover:text-primary-600">
              {t('signUp', 'Create one')}
            </Link>
          </p>
        </motion.div>

        {/* ── Demo Credentials Card ── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="w-72 flex-shrink-0"
        >
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center">
                <FiZap size={14} className="text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Demo Credentials</p>
                <p className="text-white/50 text-xs">Click any role to fill the form</p>
              </div>
            </div>

            <div className="space-y-2">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.label}
                  type="button"
                  onClick={() => fillDemo(u)}
                  className="w-full text-left px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${u.color}`}>
                      {u.label}
                    </span>
                    <span className="text-white/40 text-xs group-hover:text-white/70 transition-colors">
                      click to fill →
                    </span>
                  </div>
                  <p className="text-white/70 text-xs mt-1.5 truncate">{u.email}</p>
                  <p className="text-white/40 text-xs">{u.password}</p>
                </button>
              ))}
            </div>

            <p className="text-white/30 text-xs text-center mt-4">
              For demo & testing purposes only
            </p>
          </div>

          <p className="text-center text-gray-400 text-sm mt-4">
            <Link to="/" className="hover:text-white transition-colors">← Back to Home</Link>
          </p>
        </motion.div>

      </div>
    </div>
  );
};

export default LoginPage;
