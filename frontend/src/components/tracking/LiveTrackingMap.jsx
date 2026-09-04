import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { formatDistanceToNow } from 'date-fns';
import { io } from 'socket.io-client';

// Fix Leaflet's default icon path issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom truck icon
const truckIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/643/643111.png', // A free truck icon
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

const destinationIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/149/149059.png',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

const pickupIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

const LiveTrackingMap = ({ shipment, trackingData, history }) => {
  const [liveLocation, setLiveLocation] = useState(trackingData?.location || null);
  const [lastUpdate, setLastUpdate] = useState(trackingData?.location?.recordedAt ? new Date(trackingData.location.recordedAt) : null);
  const mapRef = useRef(null);

  // Connect to Socket.io for live updates
  useEffect(() => {
    if (!shipment?.id) return;
    
    // In a real app we would use the existing socket instance, but for simplicity here we assume
    // we can either listen to a global one or create one.
    // The existing app has services/socketService.js which we can use, but we don't have its exact exports.
    // We'll rely on the parent component or standard event listeners.
    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    const token = localStorage.getItem('token');
    const socket = io(socketUrl, { auth: { token } });

    socket.on('connect', () => {
      socket.emit('joinShipment', shipment.id);
    });

    socket.on('shipmentLocationUpdated', (data) => {
      if (data.shipmentId === shipment.id) {
        setLiveLocation({
          latitude: data.latitude,
          longitude: data.longitude,
          speed: data.speed,
          heading: data.heading,
          recordedAt: data.recordedAt
        });
        setLastUpdate(new Date(data.recordedAt));
        
        // Pan map to new location
        if (mapRef.current) {
          mapRef.current.panTo([data.latitude, data.longitude]);
        }
      }
    });

    return () => {
      socket.emit('leaveShipment', shipment.id);
      socket.disconnect();
    };
  }, [shipment?.id]);

  useEffect(() => {
    if (trackingData?.location) {
      setLiveLocation(trackingData.location);
      setLastUpdate(new Date(trackingData.location.recordedAt));
    }
  }, [trackingData]);

  // Determine Connection Status
  const getStatus = () => {
    if (!lastUpdate) return { label: 'Offline', color: 'text-red-500', dot: 'bg-red-500' };
    const secondsAgo = (new Date() - lastUpdate) / 1000;
    if (secondsAgo < 60) return { label: 'Live', color: 'text-green-500', dot: 'bg-green-500 animate-pulse' };
    if (secondsAgo < 300) return { label: 'Signal Delayed', color: 'text-yellow-500', dot: 'bg-yellow-500' };
    return { label: 'Offline', color: 'text-red-500', dot: 'bg-red-500' };
  };

  const status = getStatus();

  // Create route line from history
  const routeLine = history?.map(h => [h.latitude, h.longitude]) || [];
  if (liveLocation) {
    routeLine.push([liveLocation.latitude, liveLocation.longitude]);
  }

  // Map center logic
  let center = [9.03, 38.74]; // Default Addis Ababa
  if (liveLocation) {
    center = [liveLocation.latitude, liveLocation.longitude];
  } else if (shipment?.pickupLat && shipment?.pickupLng) {
    center = [shipment.pickupLat, shipment.pickupLng];
  }

  return (
    <div className="card !p-0 overflow-hidden flex flex-col h-[500px]">
      {/* Map Header */}
      <div className="p-4 bg-white dark:bg-dark-800 border-b border-gray-100 dark:border-dark-700 flex items-center justify-between z-10">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            Live GPS Tracking
            <span className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-gray-50 dark:bg-dark-900 ${status.color}`}>
              <span className={`w-2 h-2 rounded-full ${status.dot}`}></span>
              {status.label}
            </span>
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {lastUpdate ? `Last update: ${formatDistanceToNow(lastUpdate, { addSuffix: true })}` : 'Waiting for GPS signal...'}
          </p>
        </div>
        
        {liveLocation && (
          <div className="text-right">
            <p className="text-xs text-gray-400">Current Speed</p>
            <p className="font-bold text-gray-900 dark:text-white">{Math.round(liveLocation.speed || 0)} km/h</p>
          </div>
        )}
      </div>

      {/* The Map */}
      <div className="flex-1 w-full relative">
        <MapContainer 
          center={center} 
          zoom={13} 
          scrollWheelZoom={true} 
          className="h-full w-full z-0"
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Pickup Marker */}
          {shipment?.pickupLat && shipment?.pickupLng && (
            <Marker position={[shipment.pickupLat, shipment.pickupLng]} icon={pickupIcon}>
              <Popup>
                <div className="text-sm">
                  <p className="font-bold">Pickup</p>
                  <p>{shipment.pickupCity}</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Destination Marker */}
          {shipment?.destLat && shipment?.destLng && (
            <Marker position={[shipment.destLat, shipment.destLng]} icon={destinationIcon}>
              <Popup>
                <div className="text-sm">
                  <p className="font-bold">Destination</p>
                  <p>{shipment.destCity}</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Route History Line */}
          {routeLine.length > 1 && (
            <Polyline positions={routeLine} color="#3b82f6" weight={4} opacity={0.7} />
          )}

          {/* Live Truck Marker */}
          {liveLocation && (
            <Marker 
              position={[liveLocation.latitude, liveLocation.longitude]} 
              icon={truckIcon}
              // If we wanted to rotate the marker based on heading, we'd need a custom divIcon or plugin. 
              // Standard leaflet markers don't rotate easily without extra CSS or plugins.
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-bold">{trackingData?.vehicle?.plateNumber || 'Truck'}</p>
                  <p>Speed: {Math.round(liveLocation.speed || 0)} km/h</p>
                  <p className="text-xs text-gray-500">{new Date(liveLocation.recordedAt).toLocaleTimeString()}</p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default LiveTrackingMap;
