import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiTruck, FiMapPin, FiRefreshCw, FiNavigation,
  FiActivity, FiUser, FiPackage, FiWifi, FiWifiOff,
} from 'react-icons/fi';
import api from '../../services/api';
import { getSocket } from '../../services/socketService';
import { getInitials, timeAgo } from '../../utils/helpers';

const TrackingCenter = () => {
  const [driverLocations, setDriverLocations] = useState({});   // live location per driverId
  const [onlineMap,       setOnlineMap]       = useState({});   // live online status
  const [selectedDriver,  setSelectedDriver]  = useState(null); // driver detail panel
  const [lastUpdate,      setLastUpdate]      = useState(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['active-drivers'],
    queryFn: () => api.get('/tracking/active-drivers').then((r) => r.data.data),
    refetchInterval: 30000,
  });

  // Socket listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Live location update from driver
    const onLocation = (update) => {
      setDriverLocations((prev) => ({ ...prev, [update.driverId]: update }));
      setLastUpdate(new Date());
    };

    // Driver goes online / offline
    const onAvailability = ({ driverId, isOnline }) => {
      setOnlineMap((prev) => ({ ...prev, [driverId]: isOnline }));
      if (!isOnline) {
        // Remove location when driver goes offline
        setDriverLocations((prev) => {
          const next = { ...prev };
          delete next[driverId];
          return next;
        });
      }
    };

    socket.on('driverLocationUpdate',    onLocation);
    socket.on('driverAvailabilityChange', onAvailability);

    return () => {
      socket.off('driverLocationUpdate',    onLocation);
      socket.off('driverAvailabilityChange', onAvailability);
    };
  }, []);

  const drivers = data || [];

  // Merge API data with live socket data
  const enrichedDrivers = drivers.map((d) => ({
    ...d,
    isOnline:    onlineMap[d.id] ?? d.isOnline,
    liveLocation: driverLocations[d.id] || null,
  }));

  const onlineDrivers  = enrichedDrivers.filter((d) => d.isOnline);
  const offlineDrivers = enrichedDrivers.filter((d) => !d.isOnline);

  const DriverCard = ({ driver, isSelected }) => {
    const loc = driver.liveLocation;
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setSelectedDriver(isSelected ? null : driver)}
        className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
          isSelected
            ? 'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-300'
            : 'bg-gray-50 dark:bg-dark-700 hover:bg-gray-100 dark:hover:bg-dark-600 border-2 border-transparent'
        }`}
      >
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            {driver.avatar ? (
              <img src={driver.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <span className="text-primary-600 font-semibold text-sm">{getInitials(driver.firstName, driver.lastName)}</span>
            )}
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
            driver.isOnline ? 'bg-green-500' : 'bg-gray-300'
          }`} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
            {driver.firstName} {driver.lastName}
          </p>
          {loc ? (
            <div className="space-y-0.5">
              <div className="flex items-center gap-1 text-xs text-green-600">
                <FiNavigation size={10} className="animate-pulse" />
                <span>Live · {loc.speed ? `${Number(loc.speed).toFixed(0)} km/h` : 'Stationary'}</span>
              </div>
              <p className="text-xs text-gray-400">
                {Number(loc.lat).toFixed(4)}, {Number(loc.lng).toFixed(4)}
              </p>
              <p className="text-xs text-gray-400">{timeAgo(loc.timestamp)}</p>
            </div>
          ) : (
            <p className="text-xs text-gray-400">
              {driver.isOnline ? 'Online · No location yet' : 'Offline'}
            </p>
          )}
        </div>

        {driver.isOnline && (
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0 mt-1" />
        )}
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tracking Center</h1>
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <FiActivity size={12} className="text-green-500" />
              Updated {timeAgo(lastUpdate)}
            </span>
          )}
          <button onClick={() => refetch()} className="btn-secondary flex items-center gap-2 text-sm">
            <FiRefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-600">{onlineDrivers.length}</p>
          <p className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
            <FiWifi size={11} /> Online Drivers
          </p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-gray-400">{offlineDrivers.length}</p>
          <p className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
            <FiWifiOff size={11} /> Offline Drivers
          </p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-primary-600">{Object.keys(driverLocations).length}</p>
          <p className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
            <FiNavigation size={11} /> Live Locations
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card min-h-80 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50 dark:from-dark-800 dark:to-dark-700">
            <div className="text-center text-gray-500 max-w-sm">
              <FiMapPin className="mx-auto mb-3 text-primary-400" size={40} />
              <p className="font-semibold text-gray-700 dark:text-gray-300">Live Map View</p>
              <p className="text-sm mt-2 text-gray-500">
                Add your Mapbox token to enable the interactive map with real-time driver positions.
              </p>
              <code className="block mt-3 text-xs bg-gray-200 dark:bg-dark-600 rounded-lg px-3 py-2 text-gray-600 dark:text-gray-400">
                REACT_APP_MAPBOX_TOKEN=pk.eyJ1...
              </code>
            </div>
          </div>

          {/* Live location feed */}
          {Object.keys(driverLocations).length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <FiActivity className="text-green-500" size={16} />
                Live Location Feed
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                <AnimatePresence>
                  {Object.entries(driverLocations).map(([driverId, loc]) => {
                    const driver = enrichedDrivers.find((d) => String(d.id) === String(driverId));
                    return (
                      <motion.div
                        key={driverId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 p-2 bg-green-50 dark:bg-green-900/10 rounded-lg text-xs"
                      >
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {driver ? `${driver.firstName} ${driver.lastName}` : `Driver #${driverId}`}
                        </span>
                        <span className="text-gray-500">
                          {Number(loc.lat).toFixed(5)}, {Number(loc.lng).toFixed(5)}
                        </span>
                        {loc.speed && (
                          <span className="text-green-600 font-medium ml-auto">{Number(loc.speed).toFixed(0)} km/h</span>
                        )}
                        <span className="text-gray-400 ml-auto">{timeAgo(loc.timestamp)}</span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {/* Driver list */}
        <div className="space-y-4">
          {/* Online */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Online ({onlineDrivers.length})
            </h3>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 dark:bg-dark-700 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : onlineDrivers.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm">
                <FiTruck className="mx-auto mb-2 text-gray-300" size={24} />
                No drivers online
              </div>
            ) : (
              <div className="space-y-2">
                {onlineDrivers.map((driver) => (
                  <DriverCard
                    key={driver.id}
                    driver={driver}
                    isSelected={selectedDriver?.id === driver.id}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Offline */}
          {offlineDrivers.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-300" />
                Offline ({offlineDrivers.length})
              </h3>
              <div className="space-y-2">
                {offlineDrivers.map((driver) => (
                  <DriverCard
                    key={driver.id}
                    driver={driver}
                    isSelected={selectedDriver?.id === driver.id}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected driver detail panel */}
      <AnimatePresence>
        {selectedDriver && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="card border-2 border-primary-200 dark:border-primary-800"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FiUser size={16} className="text-primary-500" />
                {selectedDriver.firstName} {selectedDriver.lastName}
              </h3>
              <button onClick={() => setSelectedDriver(null)} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Contact</p>
                <p className="text-gray-700 dark:text-gray-300">{selectedDriver.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Vehicle</p>
                <p className="text-gray-700 dark:text-gray-300 font-mono">
                  {selectedDriver.vehicleAssigned?.plateNumber || 'Not assigned'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Live Location</p>
                {driverLocations[selectedDriver.id] ? (
                  <div>
                    <p className="text-green-600 font-medium text-xs">
                      {Number(driverLocations[selectedDriver.id].lat).toFixed(5)},
                      {Number(driverLocations[selectedDriver.id].lng).toFixed(5)}
                    </p>
                    {driverLocations[selectedDriver.id].speed && (
                      <p className="text-gray-500 text-xs">
                        Speed: {Number(driverLocations[selectedDriver.id].speed).toFixed(0)} km/h
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-400 text-xs">No live data</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TrackingCenter;
