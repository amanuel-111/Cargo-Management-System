import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiUsers, FiSearch, FiStar, FiTruck } from 'react-icons/fi';
import api from '../../services/api';
import { SkeletonTable } from '../../components/common/LoadingSkeleton';
import { getInitials } from '../../utils/helpers';

const ManageDrivers = () => {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['drivers', search],
    queryFn: () => api.get(`/users/drivers${search ? `?search=${search}` : ''}`).then((r) => r.data),
  });

  const drivers = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Drivers</h1>
        <span className="badge bg-blue-100 text-blue-700">{data?.count || 0} drivers</span>
      </div>

      <div className="card">
        <div className="relative mb-4">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search drivers..."
            className="input-field pl-9"
          />
        </div>

        {isLoading ? (
          <SkeletonTable />
        ) : drivers.length === 0 ? (
          <div className="text-center py-12">
            <FiUsers className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500">No drivers found</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {drivers.map((driver) => (
              <div key={driver._id} className="bg-gray-50 dark:bg-dark-700 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    {driver.avatar ? (
                      <img src={driver.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <span className="text-primary-600 font-semibold text-sm">{getInitials(driver.firstName, driver.lastName)}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{driver.firstName} {driver.lastName}</p>
                    <p className="text-xs text-gray-500">{driver.phone}</p>
                  </div>
                  <div className={`ml-auto w-2 h-2 rounded-full ${driver.isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <FiStar className="text-yellow-400" size={12} />
                    <span>{driver.rating || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiTruck size={12} />
                    <span>{driver.vehicleAssigned?.plateNumber || 'No vehicle'}</span>
                  </div>
                  <span>{driver.totalDeliveries || 0} deliveries</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageDrivers;
