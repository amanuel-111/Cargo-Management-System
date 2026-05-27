import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiUsers, FiSearch, FiStar, FiTruck, FiPackage } from 'react-icons/fi';
import api from '../../services/api';
import { SkeletonCard } from '../../components/common/LoadingSkeleton';
import { getInitials } from '../../utils/helpers';

const ManageDrivers = () => {
  const [search, setSearch] = useState('');
  const [onlineOnly, setOnlineOnly] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['drivers', search, onlineOnly],
    queryFn: () =>
      api.get(`/users/drivers${search ? `?search=${encodeURIComponent(search)}` : ''}`)
        .then((r) => r.data),
  });

  const drivers = (data?.data || []).filter((d) =>
    onlineOnly ? d.isOnline : true
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Drivers</h1>
        <span className="badge bg-blue-100 text-blue-700">{data?.count || 0} drivers</span>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search drivers by name or phone..."
              className="input-field pl-9"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={onlineOnly}
              onChange={(e) => setOnlineOnly(e.target.checked)}
              className="w-4 h-4 accent-primary-500"
            />
            Online only
          </label>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : drivers.length === 0 ? (
          <div className="text-center py-12">
            <FiUsers className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500">No drivers found</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {drivers.map((driver) => (
              <div key={driver.id} className="bg-gray-50 dark:bg-dark-700 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      {driver.avatar ? (
                        <img src={driver.avatar} alt="" className="w-11 h-11 rounded-full object-cover" />
                      ) : (
                        <span className="text-primary-600 font-semibold text-sm">
                          {getInitials(driver.firstName, driver.lastName)}
                        </span>
                      )}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                      driver.isOnline ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                      {driver.firstName} {driver.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{driver.phone}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-white dark:bg-dark-800 rounded-lg p-2">
                    <div className="flex items-center justify-center gap-0.5 text-yellow-500 mb-0.5">
                      <FiStar size={11} />
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {driver.rating ? Number(driver.rating).toFixed(1) : 'N/A'}
                      </span>
                    </div>
                    <p className="text-gray-400">Rating</p>
                  </div>
                  <div className="bg-white dark:bg-dark-800 rounded-lg p-2">
                    <div className="flex items-center justify-center gap-0.5 mb-0.5">
                      <FiPackage size={11} className="text-primary-500" />
                      <span className="font-semibold text-gray-900 dark:text-white">{driver.totalDeliveries || 0}</span>
                    </div>
                    <p className="text-gray-400">Trips</p>
                  </div>
                  <div className="bg-white dark:bg-dark-800 rounded-lg p-2">
                    <div className="flex items-center justify-center gap-0.5 mb-0.5">
                      <FiTruck size={11} className="text-blue-500" />
                      <span className="font-semibold text-gray-900 dark:text-white text-xs truncate">
                        {driver.vehicleAssigned?.plateNumber || '—'}
                      </span>
                    </div>
                    <p className="text-gray-400">Vehicle</p>
                  </div>
                </div>

                {driver.licenseNumber && (
                  <p className="text-xs text-gray-400 mt-2">License: {driver.licenseNumber}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageDrivers;
