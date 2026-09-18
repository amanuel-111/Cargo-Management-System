import React from 'react';
import { useSelector } from 'react-redux';
import { FiTruck, FiStar, FiPackage, FiDollarSign } from 'react-icons/fi';
import { formatDate } from '../../utils/helpers';
import ProfileSettings from '../../components/common/ProfileSettings';

const DriverProfile = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Driver Profile</h1>

      <ProfileSettings />

      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Driver Statistics</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: FiPackage, label: 'Total Deliveries', value: user?.totalDeliveries || 0, color: 'text-primary-500' },
            { icon: FiStar, label: 'Rating', value: user?.rating || 'N/A', color: 'text-yellow-500' },
            { icon: FiDollarSign, label: 'Earnings (ETB)', value: (user?.earnings || 0).toLocaleString(), color: 'text-green-500' },
            { icon: FiTruck, label: 'Vehicle', value: user?.vehicleAssigned?.plateNumber || 'None', color: 'text-blue-500' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-gray-50 dark:bg-dark-700 rounded-xl p-4 text-center">
              <Icon className={`mx-auto mb-2 ${color}`} size={20} />
              <p className="font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {user?.licenseNumber && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">License Information</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-500">License #:</span> <span className="font-medium ml-1">{user.licenseNumber}</span></div>
            <div><span className="text-gray-500">Expiry:</span> <span className="font-medium ml-1">{formatDate(user.licenseExpiry)}</span></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverProfile;
