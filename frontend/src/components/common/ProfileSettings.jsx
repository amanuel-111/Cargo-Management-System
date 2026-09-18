import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiCamera, FiCheckCircle, FiAlertCircle, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { updateProfile } from '../../redux/slices/authSlice';
import { getInitials } from '../../utils/helpers';
import api from '../../services/api';
import toast from 'react-hot-toast';

const FieldError = ({ message }) => (
  <AnimatePresence mode="wait">
    {message && (
      <motion.p key={message} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
        className="flex items-center gap-1 text-red-500 text-xs mt-1">
        <FiAlertCircle size={11} />{message}
      </motion.p>
    )}
  </AnimatePresence>
);

const ProfileSettings = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const avatarRef = useRef();
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile]       = useState(null);
  const [showCurrent, setShowCurrent]     = useState(false);
  const [showNew, setShowNew]             = useState(false);
  const [pwLoading, setPwLoading]         = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName:  user?.lastName  || '',
      phone:     user?.phone     || '',
    },
    mode: 'onChange',
  });

  const {
    register: regPw,
    handleSubmit: handlePw,
    watch: watchPw,
    reset: resetPw,
    formState: { errors: pwErrors },
  } = useForm({ mode: 'onChange' });

  const onAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onSubmit = (data) => {
    const formData = new FormData();
    if (data.firstName) formData.append('firstName', data.firstName);
    if (data.lastName)  formData.append('lastName',  data.lastName);
    if (data.phone)     formData.append('phone',     data.phone);
    if (avatarFile)     formData.append('avatar',    avatarFile);
    dispatch(updateProfile(formData));
  };

  const onPasswordSubmit = async (data) => {
    setPwLoading(true);
    try {
      await api.put('/auth/update-password', {
        currentPassword: data.currentPassword,
        newPassword:     data.newPassword,
      });
      toast.success('Password updated successfully');
      resetPw();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPwLoading(false);
    }
  };

  const fc = (err, dirty) => {
    if (err)           return 'input-field border-red-400 focus:ring-red-400';
    if (dirty && !err) return 'input-field border-green-400 focus:ring-green-400';
    return 'input-field';
  };

  return (
    <div className="space-y-6">
      {/* Profile info */}
      <div className="card">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary-100 overflow-hidden flex items-center justify-center">
              {avatarPreview || user?.avatar ? (
                <img
                  src={avatarPreview || user.avatar}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <span className="text-primary-600 font-bold text-2xl">
                  {getInitials(user?.firstName, user?.lastName)}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => avatarRef.current.click()}
              className="absolute bottom-0 right-0 w-7 h-7 bg-primary-500 hover:bg-primary-600 rounded-full flex items-center justify-center shadow-md transition-colors"
              title="Change photo"
            >
              <FiCamera className="text-white" size={12} />
            </button>
            <input
              ref={avatarRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={onAvatarChange}
            />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-lg">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-gray-500 text-sm capitalize">{user?.role?.replace('_', ' ')}</p>
            <span className={`badge mt-1 text-xs ${user?.isEmailVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {user?.isEmailVerified ? '✓ Email Verified' : 'Email Unverified'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  {...register('firstName', {
                    required: 'First name is required',
                    minLength: { value: 2, message: 'At least 2 characters' },
                    pattern: { value: /^[a-zA-Z\u00C0-\u024F\s'-]+$/, message: 'Letters only' },
                  })}
                  className={`${fc(errors.firstName, dirtyFields.firstName)} pl-9`}
                />
              </div>
              <FieldError message={errors.firstName?.message} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
              <input
                {...register('lastName', {
                  required: 'Last name is required',
                  minLength: { value: 2, message: 'At least 2 characters' },
                  pattern: { value: /^[a-zA-Z\u00C0-\u024F\s'-]+$/, message: 'Letters only' },
                })}
                className={fc(errors.lastName, dirtyFields.lastName)}
              />
              <FieldError message={errors.lastName?.message} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                value={user?.email || ''}
                disabled
                className="input-field pl-9 bg-gray-50 dark:bg-dark-700 cursor-not-allowed opacity-70"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                {...register('phone', {
                  required: 'Phone is required',
                  pattern: { value: /^\+?[0-9\s\-]{7,20}$/, message: 'Invalid phone number' },
                })}
                className={`${fc(errors.phone, dirtyFields.phone)} pl-9`}
                placeholder="+251 911 123 456"
              />
            </div>
            <FieldError message={errors.phone?.message} />
          </div>

          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
            ) : (
              <><FiCheckCircle size={15} />Save Changes</>
            )}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FiLock size={16} /> Change Password
        </h2>
        <form onSubmit={handlePw(onPasswordSubmit)} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                {...regPw('currentPassword', { required: 'Current password is required' })}
                type={showCurrent ? 'text' : 'password'}
                className={`${fc(pwErrors.currentPassword, false)} pl-9 pr-9`}
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showCurrent ? <FiEyeOff size={14} /> : <FiEye size={14} />}
              </button>
            </div>
            <FieldError message={pwErrors.currentPassword?.message} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                {...regPw('newPassword', {
                  required: 'New password is required',
                  minLength: { value: 8, message: 'At least 8 characters' },
                  validate: {
                    hasUpper:  (v) => /[A-Z]/.test(v) || 'Must include an uppercase letter',
                    hasNumber: (v) => /[0-9]/.test(v) || 'Must include a number',
                  },
                })}
                type={showNew ? 'text' : 'password'}
                className={`${fc(pwErrors.newPassword, false)} pl-9 pr-9`}
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showNew ? <FiEyeOff size={14} /> : <FiEye size={14} />}
              </button>
            </div>
            <FieldError message={pwErrors.newPassword?.message} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                {...regPw('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (v) => v === watchPw('newPassword') || 'Passwords do not match',
                })}
                type="password"
                className={`${fc(pwErrors.confirmPassword, false)} pl-9`}
                placeholder="••••••••"
              />
            </div>
            <FieldError message={pwErrors.confirmPassword?.message} />
          </div>

          <button type="submit" disabled={pwLoading} className="btn-secondary flex items-center gap-2">
            {pwLoading ? (
              <><div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />Updating...</>
            ) : (
              <><FiLock size={14} />Update Password</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
