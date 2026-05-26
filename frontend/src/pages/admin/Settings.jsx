import React from 'react';
import { useForm } from 'react-hook-form';
import { FiSettings, FiBell, FiShield, FiDatabase } from 'react-icons/fi';
import toast from 'react-hot-toast';

const SystemSettings = () => {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      siteName: 'Smart Transport',
      supportEmail: 'support@smarttransport.et',
      supportPhone: '+251 911 123 456',
      baseShippingRate: 500,
      weightRate: 10,
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
    },
  });

  const onSubmit = (data) => {
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* General */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <FiSettings className="text-primary-500" size={18} />
            <h3 className="font-semibold text-gray-900 dark:text-white">General Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Platform Name</label>
              <input {...register('siteName')} className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Support Email</label>
                <input {...register('supportEmail')} type="email" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Support Phone</label>
                <input {...register('supportPhone')} className="input-field" />
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <FiDatabase className="text-blue-500" size={18} />
            <h3 className="font-semibold text-gray-900 dark:text-white">Pricing Configuration</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Base Shipping Rate (ETB)</label>
              <input {...register('baseShippingRate')} type="number" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rate per kg (ETB)</label>
              <input {...register('weightRate')} type="number" className="input-field" />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <FiBell className="text-yellow-500" size={18} />
            <h3 className="font-semibold text-gray-900 dark:text-white">Notification Settings</h3>
          </div>
          <div className="space-y-3">
            {[
              { key: 'emailNotifications', label: 'Email Notifications', desc: 'Send email alerts for shipment updates' },
              { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Send SMS alerts via Twilio' },
              { key: 'pushNotifications', label: 'Push Notifications', desc: 'Send push notifications via Firebase' },
            ].map(({ key, label, desc }) => (
              <label key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-xl cursor-pointer">
                <div>
                  <p className="font-medium text-sm text-gray-900 dark:text-white">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
                <input {...register(key)} type="checkbox" className="w-4 h-4 accent-primary-500" />
              </label>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <FiShield className="text-green-500" size={18} />
            <h3 className="font-semibold text-gray-900 dark:text-white">Security</h3>
          </div>
          <div className="space-y-3 text-sm">
            {[
              { label: 'JWT Authentication', status: 'Enabled' },
              { label: 'Rate Limiting', status: '100 req/15min' },
              { label: 'Input Sanitization', status: 'Active' },
              { label: 'HTTPS', status: 'Configured' },
            ].map(({ label, status }) => (
              <div key={label} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-xl">
                <span className="text-gray-700 dark:text-gray-300">{label}</span>
                <span className="badge bg-green-100 text-green-700">{status}</span>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="btn-primary w-full py-3">Save Settings</button>
      </form>
    </div>
  );
};

export default SystemSettings;
