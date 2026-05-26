import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiTruck, FiMapPin, FiRefreshCw } from 'react-icons/fi';
import api from '../../services/api';
import { getSocket } from '../../services/socketService';
import { getInitials } from '../../utils/helpers';

const TrackingCenter = () => {
  const [driverLocations, setDriverLocations] = useState({});

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['active-drivers'],
    queryFn: () => api.get('/tracking/active-drivers').then((r) => r.data.data),
    refetchInterval: 30000,
  });

  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      socket.on('driverLocationUpdate', (update) => {
        setDriverLocations((prev) => ({
          ...prev,
          [update.driverId]: update,
        }));
      });
      return () => socket.off('driverLocationUpdate');
    }
  }, []);

  const drivers = data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tracking Center</h1>
        <button onClick={() => refetch()} className="btn-secondary flex items-center gap-2 text-sm">
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map placeholder */}
        <div className="lg:col-span-2 card min-h-96 flex items-center justify-center bg-gray-100 dark:bg-dark-700">
          <div className="text-center text-gray-500">
            <FiMapPin className="mx-auto mb-3 text-primary-400" size={40} />
            <p className="font-medium">Live Map View</p>
            <p className="text-sm mt-1">Configure Mapbox token in .env to enable live tracking</p>
            <p className="text-xs mt-2 text-gray-400">REACT_APP_MAPBOX_TOKEN=your_token</p>
          </div>
        </div>

        {/* Driver list */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Active Drivers
            <span className="ml-2 badge bg-green-100 text-green-700">{drivers.length} online</span>
          </h3>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 dark:bg-dark-700 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : drivers.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              <FiTruck className="mx-auto mb-2 text-gray-300" size={28} />
              No drivers online
            </div>
          ) : (
            <div className="space-y-3">
              {drivers.map((driver) => {
                const liveLocation = driverLocations[driver._id];
                return (
                  <div key={driver._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-700 rounded-xl">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        {driver.avatar ? (
                          <img src={driver.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <span className="text-primary-600 font-semibold text-sm">{getInitials(driver.firstName, driver.lastName)}</span>
                        )}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                        {driver.firstName} {driver.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {driver.vehicleAssigned?.plateNumber || 'No vehicle'}
                      </p>
                      {liveLocation && (
                        <p className="text-xs text-green-600">
                          {liveLocation.speed ? `${liveLocation.speed} km/h` : 'Live'}
                        </p>
                      )}
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackingCenter;
