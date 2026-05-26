import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiTruck, FiZap } from 'react-icons/fi';
import { login } from '../../redux/slices/authSlice';

const DEMO_USERS = [
  { label: 'Admin',        email: 'admin@smarttransport.et', password: 'admin123', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
  { label: 'Fleet Mgr',   email: 'fleet@smarttransport.et', password: 'fleet123', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
  { label: 'Driver',      email: 'driver@test.et',          password: 'test123',  color: 'bg-green-100 text-green-700 hover:bg-green-200' },
  { label: 'Customer',    email: 'customer@test.et',        password: 'test123',  color: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
];

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);
  const [showPass, setShowPass] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

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
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiTruck className="text-white text-2xl" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to your Smart Transport account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
                  type="email"
                  className="input-field pl-10"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  {...register('password', { required: 'Password is required' })}
                  type={showPass ? 'text' : 'password'}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
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
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-500 font-medium hover:text-primary-600">
              Create one
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-1.5 mb-3">
              <FiZap size={13} className="text-primary-500" />
              <p className="text-xs font-semibold text-gray-600">Quick Login — click to fill</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.label}
                  type="button"
                  onClick={() => fillDemo(u)}
                  className={`text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${u.color}`}
                >
                  <span className="font-semibold block">{u.label}</span>
                  <span className="opacity-75 truncate block">{u.email}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <p className="text-center text-gray-400 text-sm mt-6">
          <Link to="/" className="hover:text-white transition-colors">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
